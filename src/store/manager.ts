// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { Kernel } from '@jupyterlab/services';
import { Token } from '@lumino/coreutils';
import { ITLabStore, TLabStore } from './store';

export const ITLabStoreManager = new Token<ITLabStoreManager>(
  'tlab:ITLabStoreManager'
);

export type KernelStoreConnector = (
  kernel: Kernel.IKernelConnection,
  targetName: string
) => Promise<void>;

/**
 * Store manager. Registers kernel store handlers (language support) and data models.
 * Manages stores, kernel store handles and serialization.
 */
export interface ITLabStoreManager {
  /**
   * Register a kernel store handler.
   * @param language JupyterLab language string.
   * @param connector
   */
  registerKernelStoreConnector(
    language: string,
    connector: KernelStoreConnector
  ): void;

  /**
   * Get a kernel store connector for a kernel connection.
   * @param language Session kernel language.
   * @returns Kernel store connector.
   */
  getKernelStoreConnector(language: string): KernelStoreConnector;

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
  private kernelStoreConnectors = new Map<string, KernelStoreConnector>();
  private dataModels = new Map<string, any>();

  constructor(private app: JupyterFrontEnd) {}

  registerKernelStoreConnector(
    language: string,
    connector: KernelStoreConnector
  ) {
    this.kernelStoreConnectors.set(language, connector);
  }

  getKernelStoreConnector(language: string) {
    const connector = this.kernelStoreConnectors.get(language);
    if (!connector) {
      throw new Error('Language not supported');
    }
    return connector;
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
