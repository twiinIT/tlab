// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { SessionContext, sessionContextDialogs } from '@jupyterlab/apputils';
import { IKernelStoreHandler } from './handler';
import { ITLabStoreManager } from './manager';

export class TLabStore {
  private sessionContext: SessionContext;
  private _kernelStoreHandler: IKernelStoreHandler | undefined;

  constructor(
    private app: JupyterFrontEnd,
    private manager: ITLabStoreManager
  ) {
    const serviceManager = this.app.serviceManager;
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

  async fetch(name: string): Promise<void> {
    const { obj, modelId } = await this.kernelStoreHandler.fetch(name);
    const model = await this.manager.deserialize(obj, modelId);
    console.log(model);
  }
}
