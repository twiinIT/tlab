// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { IJSONPatchOperation, Model } from './models';

/**
 * Kernel store handler.
 */
export interface IKernelStoreHandler {
  /**
   * Wait for the kernel store to be ready.
   */
  ready: Promise<void>;

  /**
   * Fetch a kernel variable.
   * @param name Variable name.
   * @param uuid Store UUID of the variable.
   * @returns Serialized variable and model id.
   */
  fetch(name: string, uuid: string): Promise<any>;

  /**
   * Send a patch to the kernel store.
   * @param uuid
   * @param patch
   */
  sendPatch<T>(uuid: string, patch: IJSONPatchOperation<T>[]): void;

  /**
   * Add a new variable in the kernel.
   * @param name
   * @param data
   * @param uuid For further reference.
   * @returns Completion promise.
   */
  add<T extends Model>(name: string, data: T, uuid: string): Promise<void>;
}
