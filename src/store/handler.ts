// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

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
   * @param name Variable name
   * @returns Serialized variable and model id.
   */
  fetch(name: string): Promise<{ obj: any; modelId: string }>;
}
