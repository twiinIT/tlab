// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { SessionContext, sessionContextDialogs } from '@jupyterlab/apputils';
import { IKernelStoreHandler } from './handler';
import { ITLabStoreManager } from './manager';

/**
 * Front TLab store. Exposes kernel variables to the front end widgets
 * and manage a communication with a kernel store via a handler.
 */
export class TLabStore {
  private sessionContext: SessionContext;
  private _kernelStoreHandler: IKernelStoreHandler | undefined;

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

  private get kernelStoreHandler() {
    const ksh = this._kernelStoreHandler;
    if (!ksh) {
      throw new Error('No kernel store handler');
    }
    return ksh;
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
      this._kernelStoreHandler = await this.manager.getKernelStoreHandler(
        kernel
      );
      await this._kernelStoreHandler.ready;
      console.log('KernelStore ready');
    }
  }

  /**
   * Fetch a variable from the kernel store.
   * Its data model should be supported registered in store manager.
   * @param name Name of the variable in kernel.
   * @returns Variable promise.
   */
  async fetch(name: string): Promise<void> {
    const { obj, modelId } = await this.kernelStoreHandler.fetch(name);
    const model = await this.manager.deserialize(obj, modelId);
    console.log(model);
  }
}
