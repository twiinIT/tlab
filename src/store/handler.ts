// Copyright (C) 2022, twiinIT

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
}
