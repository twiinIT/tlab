// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { Kernel } from '@jupyterlab/services';
import { Token } from '@lumino/coreutils';
import { IKernelStoreHandler } from './handler';
import { IDataModel } from './model';
import { TLabStore } from './store';

export const ITLabStoreManager = new Token<ITLabStoreManager>(
  'tlab:ITLabStoreManager'
);

type IKernelStoreHandlerFactory = (
  kernel: Kernel.IKernelConnection
) => IKernelStoreHandler;

export interface ITLabStoreManager {
  registerKernelStoreHandler(
    language: string,
    factory: IKernelStoreHandlerFactory
  ): void;
  registerModel(model: IDataModel<any>): void;
  newStore(): TLabStore;
  getKernelStoreHandler(
    kernel: Kernel.IKernelConnection
  ): Promise<IKernelStoreHandler>;
}

export class TLabStoreManager implements ITLabStoreManager {
  private kernelStoreHandlerFactories: Map<string, IKernelStoreHandlerFactory>;
  private kernelStoreHandlers: Map<string, IKernelStoreHandler>;
  private dataModels: Map<string, IDataModel<any>>;

  constructor(private app: JupyterFrontEnd) {
    this.kernelStoreHandlerFactories = new Map();
    this.kernelStoreHandlers = new Map();
    this.dataModels = new Map();
  }

  registerKernelStoreHandler(
    language: string,
    factory: IKernelStoreHandlerFactory
  ): void {
    this.kernelStoreHandlerFactories.set(language, factory);
  }

  registerModel(model: IDataModel<any>): void {
    this.dataModels.set(model.id, model);
  }

  newStore(): TLabStore {
    return new TLabStore(this.app, this);
  }

  async getKernelStoreHandler(
    kernel: Kernel.IKernelConnection
  ): Promise<IKernelStoreHandler> {
    let handler = this.kernelStoreHandlers.get(kernel.id);
    if (!handler) {
      const infos = await kernel.info;
      const language = infos.language_info.name;
      const factory = this.kernelStoreHandlerFactories.get(language);
      if (!factory) {
        throw new Error('Language not supported');
      }
      handler = factory(kernel);
      this.kernelStoreHandlers.set(kernel.id, handler);
    }
    return handler;
  }
}
