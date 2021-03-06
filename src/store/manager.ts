// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { Kernel } from '@jupyterlab/services';
import { Token } from '@lumino/coreutils';
import { IKernelStoreHandler } from './handler';
import { IDataModel } from './model';
import { ITLabStore, TLabStore } from './store';

export const ITLabStoreManager = new Token<ITLabStoreManager>(
  'tlab:ITLabStoreManager'
);

type IKernelStoreHandlerFactory = (
  kernel: Kernel.IKernelConnection
) => IKernelStoreHandler;

/**
 * Store manager. Registers kernel store handlers (language support) and data models.
 * Manages stores, kernel store handles and serialization.
 */
export interface ITLabStoreManager {
  /**
   * Register a kernel store handler.
   * @param language JupyterLab language string.
   * @param factory Function that creates the associated kernel store handler.
   */
  registerKernelStoreHandler(
    language: string,
    factory: IKernelStoreHandlerFactory
  ): void;

  /**
   * Register a data model.
   * @param model
   */
  registerModel(model: IDataModel): void;

  /**
   * Get a data model
   * @param id Model id.
   */
  getModel(id: string): IDataModel | undefined;

  /**
   * @returns A new store.
   */
  newStore(): ITLabStore;

  /**
   * Get a kernel store handler for a kernel connection.
   * @param kernel Session kernel connection.
   * @returns Kernel store handler promise.
   */
  getKernelStoreHandler(
    kernel: Kernel.IKernelConnection
  ): Promise<IKernelStoreHandler>;
}

/**
 * ITLabStoreManager implementation.
 */
export class TLabStoreManager implements ITLabStoreManager {
  private kernelStoreHandlerFactories: Map<string, IKernelStoreHandlerFactory>;
  private kernelStoreHandlers: Map<string, IKernelStoreHandler>;
  private dataModels: Map<string, IDataModel>;

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

  registerModel(model: IDataModel): void {
    this.dataModels.set(model.id, model);
  }

  getModel(id: string): IDataModel | undefined {
    return this.dataModels.get(id);
  }

  newStore(): ITLabStore {
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
