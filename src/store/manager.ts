// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { Kernel } from '@jupyterlab/services';
import { Token } from '@lumino/coreutils';
import { IKernelStoreHandler } from './handler';
import { Model } from './models';
import { ITLabStore, TLabStore } from './store';

export const ITLabStoreManager = new Token<ITLabStoreManager>(
  'tlab:ITLabStoreManager'
);

type KerStoreHandlerFactory = (
  store: ITLabStore,
  kernel: Kernel.IKernelConnection
) => IKernelStoreHandler;

type ModelCls = (new () => Model) & { _modelName: string };

/**
 * Store manager. Registers kernel store handlers (language support) and data models.
 * Manages stores, kernel store handles and serialization.
 */
export interface ITLabStoreManager {
  /**
   * Register a kernel store handler.
   * @param language JupyterLab language string.
   * @param handlerFactory
   */
  registerKernelStoreHandler(
    language: string,
    handlerFactory: KerStoreHandlerFactory
  ): void;

  /**
   * Get a kernel store handler for a kernel connection.
   * @param store
   * @param kernel Session kernel connection.
   * @returns Kernel store handler promise.
   */
  getKernelStoreHandler(
    store: ITLabStore,
    kernel: Kernel.IKernelConnection
  ): Promise<IKernelStoreHandler>;

  /**
   * Register a data model.
   * @param model
   */
  registerModel(model: ModelCls): void;

  /**
   * Get a data model
   * @param id
   * @returns Model class.
   */
  getModel(id: string): ModelCls;

  /**
   * Deserialize a data model.
   * @param obj
   * @returns Deserialized model.
   */
  parseModel(obj: any): Model;

  /**
   * @returns A new store.
   */
  newStore(): ITLabStore;
}

export class TLabStoreManager implements ITLabStoreManager {
  private kerStoreHandlerFactories = new Map<string, KerStoreHandlerFactory>();
  private kerStoreHandlers = new Map<string, IKernelStoreHandler>();
  private dataModels = new Map<string, ModelCls>();

  constructor(private app: JupyterFrontEnd) {}

  registerKernelStoreHandler(
    language: string,
    handlerFactory: KerStoreHandlerFactory
  ) {
    this.kerStoreHandlerFactories.set(language, handlerFactory);
  }

  async getKernelStoreHandler(
    store: ITLabStore,
    kernel: Kernel.IKernelConnection
  ) {
    let handler = this.kerStoreHandlers.get(kernel.id);
    if (!handler) {
      const infos = await kernel.info;
      const language = infos.language_info.name;
      const factory = this.kerStoreHandlerFactories.get(language);
      if (!factory) throw new Error('Language not supported');
      handler = factory(store, kernel);
      this.kerStoreHandlers.set(kernel.id, handler);
    }
    return handler;
  }

  registerModel(model: ModelCls) {
    this.dataModels.set(model._modelName, model);
  }

  getModel(id: string) {
    const m = this.dataModels.get(id);
    if (!m) throw new Error('Model not registered');
    return m;
  }

  parseModel(obj: any) {
    const modelClass = this.getModel(obj._modelName);
    const model = new modelClass();
    for (const key of Reflect.ownKeys(obj)) {
      if (key === '_modelName') continue;
      let value = obj[key];
      // recurse if _modelName is present
      if (value && value._modelName) value = this.parseModel(value);
      Reflect.set(model, key, value);
    }
    return model;
  }

  newStore(): ITLabStore {
    return new TLabStore(this.app, this);
  }
}
