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
export class TLabStore {
  private sessionContext: SessionContext;
  private kernelStoreHandler: IKernelStoreHandler | undefined;
  objects: Map<string, IStoreObject>;
  signal: Signal<this, void>;

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
    this.objects = new Map();
    this.signal = new Signal(this);
  }

  /**
   * Connect store to kernel, obtain kernel store handler
   * and wait for kernel store to be ready.
   */
  async connect(): Promise<void> {
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

  /**
   * Fetch a variable from the kernel store.
   * Its data model should be supported registered in store manager.
   * @param name Name of the variable in kernel.
   * @returns Variable promise.
   */
  async fetch(name: string): Promise<any> {
    if (!this.kernelStoreHandler) {
      throw new Error('Kernel store not connected');
    }
    const { obj, modelId } = await this.kernelStoreHandler.fetch(name);
    const model = this.manager.getModel(modelId);
    if (!model) {
      throw new Error('Data model not registered');
    }
    const parsed = await model.deserialize(obj);
    const wrapped = await this.kernelStoreHandler.wrap(name, modelId, parsed);
    const object: IStoreObject = { name, data: wrapped, modelId };
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
  store: TLabStore,
  callback: (store: TLabStore) => void
) {
  useEffect(() => {
    store.signal.connect(callback);
    return () => {
      store.signal.disconnect(callback);
    };
  }, [callback, store.signal]);
}
