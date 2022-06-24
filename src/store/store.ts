// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { SessionContext, sessionContextDialogs } from '@jupyterlab/apputils';
import { Kernel } from '@jupyterlab/services';
import { IKernelStoreHandler } from './handler';
import { ITLabStoreManager } from './manager';

export class TLabStore {
  sessionContext: SessionContext;
  kernelStoreHandler: IKernelStoreHandler | undefined;

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

  get kernel(): Kernel.IKernelConnection {
    const kernel = this.sessionContext.session?.kernel;
    if (!kernel) {
      throw new Error("Store doesn't have a kernel");
    }
    return kernel;
  }

  async connect(): Promise<void> {
    // User kernel selection
    const val = await this.sessionContext.initialize();
    if (val) {
      await sessionContextDialogs.selectKernel(this.sessionContext);
    }
    // Connect store to the kernel
    this.kernelStoreHandler = await this.manager.getKernelStoreHandler(
      this.kernel
    );
    await this.kernelStoreHandler.ready;
    console.log('KernelStore ready');
  }

  async addToStore(name: string): Promise<void> {
    const model = await this.kernelStoreHandler?.request(name);
    console.log(model);
  }
}
