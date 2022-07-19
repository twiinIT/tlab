// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { Kernel } from '@jupyterlab/services';
import { Token } from '@lumino/coreutils';
import { IKernelStoreHandler } from './handler';
import { ITLabStore, TLabStore } from './store';

export const ITLabStoreManager = new Token<ITLabStoreManager>(
  'tlab:ITLabStoreManager'
);

/**
 * Store manager. Registers kernel store handlers (language support) and data models.
 * Manages stores, kernel store handles and serialization.
 */
export interface ITLabStoreManager {
  /**
   * Register a kernel store handler.
   * @param language JupyterLab language string.
   * @param handlerClass
   */
  registerKernelStoreHandler(language: string, handlerClass: any): void;

  /**
   * Get a kernel store handler for a kernel connection.
   * @param kernel Session kernel connection.
   * @returns Kernel store handler promise.
   */
  getKernelStoreHandler(
    kernel: Kernel.IKernelConnection
  ): Promise<IKernelStoreHandler>;

  /**
   * Register a data model.
   * @param id
   * @param model
   */
  registerModel(id: string, model: any): void;

  /**
   * Get a data model
   * @param id
   */
  getModel(id: string): any;

  /**
   * @returns A new store.
   */
  newStore(): ITLabStore;
}

/**
 * ITLabStoreManager implementation.
 */
export class TLabStoreManager implements ITLabStoreManager {
  private kernelStoreHandlerClasses = new Map<string, any>();
  private kernelStoreHandlers = new Map<string, IKernelStoreHandler>();
  private dataModels = new Map<string, any>();

  constructor(private app: JupyterFrontEnd) {}

  registerKernelStoreHandler(language: string, handlerClass: any) {
    this.kernelStoreHandlerClasses.set(language, handlerClass);
  }

  async getKernelStoreHandler(kernel: Kernel.IKernelConnection) {
    let handler = this.kernelStoreHandlers.get(kernel.id);
    if (!handler) {
      const infos = await kernel.info;
      const language = infos.language_info.name;
      const klass = this.kernelStoreHandlerClasses.get(language);
      if (!klass) {
        throw new Error('Language not supported');
      }
      handler = new klass(kernel) as IKernelStoreHandler;
      this.kernelStoreHandlers.set(kernel.id, handler);
    }
    return handler;
  }

  registerModel(id: string, model: any) {
    this.dataModels.set(id, model);
  }

  getModel(id: string) {
    return this.dataModels.get(id);
  }

  newStore(): ITLabStore {
    return new TLabStore(this.app, this);
  }
}
