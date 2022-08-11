// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { SessionContext, sessionContextDialogs } from '@jupyterlab/apputils';
import { UUID } from '@lumino/coreutils';
import { Signal } from '@lumino/signaling';
import { useEffect } from 'react';
import { IKernelStoreHandler } from './handler';
import { ITLabStoreManager } from './manager';
import { IJSONPatchOperation, Model } from './models';

/**
 * Object in store.
 */
export interface IStoreObject<T extends Model> {
  name: string;
  uuid: string;
  data: T;
}

/**
 * Filtering result.
 */
export interface IFilterResult<T extends Model> {
  uuid: string;
  name: string;
  path: string[];
  data: T;
}

/**
 * Front TLab store. Exposes kernel variables to the front end widgets
 * and manage a communication with a kernel store via a handler.
 */
export interface ITLabStore {
  /**
   * Objects in store.
   */
  objects: Map<string, IStoreObject<any>>;

  /**
   * Signal for when an object is modified in the store.
   */
  signal: Signal<this, IStoreObject<any>>;

  /**
   * Connect store to kernel, obtain kernel store handler
   * and wait for kernel store to be ready.
   * @returns Completion promise.
   */
  connect(): Promise<void>;

  /**
   * Fetch a variable from the kernel store and add it to the front store.
   * Its data model should be supported registered in store manager.
   * @param name Name of the variable in kernel.
   * @returns Variable promise.
   */
  fetch(name: string): Promise<any>;

  /**
   * Add a new model to the store.
   * @param name
   * @param model
   * @param uuid Do not set if the model is instantiated from the front end.
   * @returns Store object
   */
  add<T extends Model>(name: string, model: T, uuid?: string): IStoreObject<T>;

  /**
   * Patch a object in store.
   * @param uuid UUID of the object.
   * @param patch JSON patch.
   */
  patch(uuid: string, patch: IJSONPatchOperation<any>[]): void;

  /**
   * Filter objects in store.
   * FIXME: fix return type (generic instead of Model)
   * @param modelCls Class of the data model.
   * @returns Generator of filtered objects.
   */
  filter<T extends Model, U extends (new () => T)[] = (new () => T)[]>(
    ...modelCls: U
  ): Generator<IFilterResult<T>>;

  /**
   * Import multiple serialized models into the store.
   * @param exportData Serialized models.
   */
  importAll(exportData: { name: string; data: any }[]): void;

  /**
   * Export all models from the store.
   * @returns Serialized models.
   */
  exportAll(): { name: string; data: any }[];

  /**
   * @returns TLabStoreManager.getModels()
   */
  getModels(): Map<string, new () => Model>;
}

export class TLabStore implements ITLabStore {
  objects = new Map<string, IStoreObject<any>>();
  signal = new Signal<this, IStoreObject<any>>(this);

  private sessionContext;
  private kernelStoreHandler?: IKernelStoreHandler;
  private toSend: [string, Model, string][] = [];

  constructor(
    private app: JupyterFrontEnd,
    private manager: ITLabStoreManager
  ) {
    const serviceManager = app.serviceManager;
    this.sessionContext = new SessionContext({
      sessionManager: serviceManager.sessions,
      specsManager: serviceManager.kernelspecs,
      name: 'twiinIT Lab'
    });
  }

  async connect() {
    // User kernel selection
    const val = await this.sessionContext.initialize();
    if (val) await sessionContextDialogs.selectKernel(this.sessionContext);

    // Connect store to the kernel
    const kernel = this.sessionContext.session?.kernel;
    if (kernel) {
      this.kernelStoreHandler = await this.manager.getKernelStoreHandler(
        this,
        kernel
      );
      await this.kernelStoreHandler.ready;
      console.log('KernelStore ready');

      // FIXME: why?
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.toSend.forEach(o => this.kernelStoreHandler!.add(...o));
      this.toSend = [];
    }
  }

  async fetch(name: string) {
    if (!this.kernelStoreHandler) throw new Error('Kernel store not connected');

    // Ask kernel store handler to fetch the variable
    const uuid = UUID.uuid4();
    const rawObj = await this.kernelStoreHandler?.fetch(name, uuid);

    // Parse the model
    const data = this.manager.parseModel(rawObj);

    return this.add(name, data, uuid);
  }

  add<T extends Model>(name: string, data: T, uuid?: string) {
    if (!uuid) {
      uuid = UUID.uuid4();
      if (this.kernelStoreHandler) {
        this.kernelStoreHandler.add(name, data, uuid);
      } else {
        this.toSend.push([name, data, uuid]);
      }
    }

    // Subscribe to changes
    data.subscribe(v => {
      console.log('front patch:', uuid, v);
      if (!v._private) this.kernelStoreHandler?.sendPatch(uuid as string, [v]);
      this.signal.emit(storeObj);
    });
    Reflect.set(window, name, data);

    // Store the object and emit signal
    const storeObj: IStoreObject<T> = { name, uuid, data };
    this.objects.set(uuid, storeObj);
    this.signal.emit(storeObj);

    return storeObj;
  }

  patch(uuid: string, patch: IJSONPatchOperation<any>[]): void {
    const obj = this.objects.get(uuid);
    if (!obj) throw new Error('Object not found');

    // Iterate over the patch and apply it to the data model
    patch.forEach(p => {
      const path = p.path;

      // Get the first parent of the modified value
      let parent = obj.data;
      for (let i = 0; i < path.length - 1; i++) {
        parent = Reflect.get(parent, path[i]);
      }

      // Apply the patch
      switch (p.op) {
        case 'add':
        case 'replace':
          parent.setSynced(path[path.length - 1], p.value, true);
          break;
        case 'remove':
          Reflect.deleteProperty(parent, path[path.length - 1]);
          break;
        case 'move':
          break;
        case 'copy':
          break;
        case 'test':
          break;
        default:
          throw new Error('Unknown operation');
      }
    });

    // Emit signal
    this.signal.emit(obj);
  }

  *filterObj<T extends Model, U extends (new () => T)[]>(
    obj: any,
    ...modelCls: U
  ): Generator<{ path: string[]; data: T }> {
    // The whole object is a match
    if (modelCls.length === 0 || modelCls.some(cls => obj instanceof cls)) {
      yield { path: [], data: obj };
    }
    // Iterate over its attributes
    for (const [k, v] of Object.entries(obj)) {
      // Attribute is a model, recurse
      if (v instanceof Model) {
        for (const { path, data } of this.filterObj(v, ...modelCls)) {
          yield { path: [k, ...path], data: data as T };
        }
      }
    }
  }

  *filter<T extends Model, U extends (new () => T)[]>(...modelCls: U) {
    // Iterate over the objects in store
    for (const obj of this.objects.values()) {
      for (const { path, data } of this.filterObj(obj.data, ...modelCls)) {
        yield { uuid: obj.uuid, name: obj.name, path, data: data as T };
      }
    }
  }

  importAll(exportData: { name: string; data: any }[]) {
    for (const { name, data } of exportData) {
      const parsed = this.manager.parseModel(data);
      this.add(name, parsed);
    }
  }

  exportAll() {
    const data = [];
    for (const obj of this.objects.values()) {
      data.push({ name: obj.name, data: obj.data });
    }
    return data;
  }

  getModels() {
    return this.manager.getModels();
  }
}

/**
 * Store signal React hook.
 * @param store Store to be used.
 * @param callback
 */
export function useStoreSignal(
  store: ITLabStore,
  callback: (store: ITLabStore, obj?: IStoreObject<any>) => void
) {
  useEffect(() => {
    store.signal.connect(callback);
    return () => {
      store.signal.disconnect(callback);
    };
  }, [callback, store]);

  useEffect(() => {
    callback(store);
    // FIXME: fix this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
