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

interface IStoreObject {
  name: string;
  uuid: string;
  data: Model;
}

/**
 * Front TLab store. Exposes kernel variables to the front end widgets
 * and manage a communication with a kernel store via a handler.
 */
export interface ITLabStore {
  /**
   * Objects in store.
   */
  objects: Map<string, IStoreObject>;

  /**
   * Signal for when an object is modified to the store.
   */
  signal: Signal<this, IStoreObject>;

  /**
   * Connect store to kernel, obtain kernel store handler
   * and wait for kernel store to be ready.
   */
  connect(): Promise<void>;

  /**
   * Fetch a variable from the kernel store.
   * Its data model should be supported registered in store manager.
   * @param name Name of the variable in kernel.
   * @returns Variable promise.
   */
  fetch(name: string): Promise<any>;

  /**
   * Patch a object in store.
   * @param uuid UUID of the object.
   * @param patch JSON patch.
   */
  patch(uuid: string, patch: IJSONPatchOperation<any>[]): void;
}

/**
 * ITLabStore implementation.
 */
export class TLabStore implements ITLabStore {
  objects = new Map<string, IStoreObject>();
  signal = new Signal<this, IStoreObject>(this);

  private sessionContext;
  private kernelStoreHandler?: IKernelStoreHandler;

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
    }
  }

  async fetch(name: string) {
    if (!this.kernelStoreHandler) throw new Error('Kernel store not connected');

    const uuid = UUID.uuid4();
    const rawObj = await this.kernelStoreHandler?.fetch(name, uuid);

    const data = this.manager.parseModel(rawObj);
    data.subscribe(v => {
      console.log('front change:', uuid, [v]);
      this.kernelStoreHandler?.sendPatch(uuid, [v]);
    });
    Reflect.set(window, name, data);

    const storeObj: IStoreObject = { name, uuid, data };
    this.objects.set(uuid, storeObj);
    this.signal.emit(storeObj);

    return storeObj;
  }

  patch(uuid: string, patch: IJSONPatchOperation<any>[]): void {
    const obj = this.objects.get(uuid);
    if (!obj) throw new Error('Object not found');
    patch.forEach(p => {
      const path = p.path;
      let parent = obj.data;
      for (let i = 0; i < path.length - 1; i++) {
        parent = Reflect.get(parent, path[i]);
      }
      switch (p.op) {
        case 'add':
        case 'replace':
          Reflect.set(parent, path[path.length - 1], p.value);
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
    this.signal.emit(obj);
  }
}

/**
 * Store signal React hook.
 * @param store Store to be used.
 * @param callback
 */
export function useStoreSignal(
  store: ITLabStore,
  callback: (store: ITLabStore, obj: IStoreObject) => void
) {
  useEffect(() => {
    store.signal.connect(callback);
    return () => {
      store.signal.disconnect(callback);
    };
  }, [callback, store.signal]);
}
