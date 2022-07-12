// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { SessionContext, sessionContextDialogs } from '@jupyterlab/apputils';
import { Signal } from '@lumino/signaling';
import { useEffect } from 'react';
import { IKernelStoreHandler } from './handler';
import { ITLabStoreManager } from './manager';

export interface IStoreObject {
  name: string;
  data: any;
  modelId: string;
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
  signal: Signal<this, void>;

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
}

/**
 * ITLabStore implementation.
 */
export class TLabStore implements ITLabStore {
  objects = new Map<string, IStoreObject>();
  signal = new Signal<this, void>(this);

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
    if (val) {
      await sessionContextDialogs.selectKernel(this.sessionContext);
    }
    // Connect store to the kernel
    const kernel = this.sessionContext.session?.kernel;
    if (kernel) {
      this.kernelStoreHandler = await this.manager.getKernelStoreHandler(
        kernel
      );
      await this.kernelStoreHandler.ready;
      console.log('KernelStore ready');
    }
  }

  async fetch(name: string) {
    if (!this.kernelStoreHandler) {
      throw new Error('Kernel store not connected');
    }
    const { data, modelId } = await this.kernelStoreHandler.fetch(name);
    const model = this.manager.getModel(modelId);
    if (!model) {
      throw new Error('Data model not registered');
    }
    const parsed = await model.deserialize(data);
    const object: IStoreObject = { name, data: parsed, modelId };
    this.objects.set(name, object);
    this.signal.emit();
    console.log(object);
    return object;
  }
}

/**
 * Store signal React hook.
 * @param store Store to be used.
 * @param callback
 */
export function useStoreSignal(
  store: ITLabStore,
  callback: (store: ITLabStore) => void
) {
  useEffect(() => {
    store.signal.connect(callback);
    return () => {
      store.signal.disconnect(callback);
    };
  }, [callback, store.signal]);
}
