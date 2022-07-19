// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { IStoreObject } from './store';

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
  fetch(name: string, uuid: string): Promise<IStoreObject>;
}
