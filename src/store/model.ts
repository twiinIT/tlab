// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

/**
 * TLab data model interface.
 */
export interface IDataModel<T> {
  /**
   * A human-readable id.
   */
  id: string;

  /**
   * Friendly name.
   */
  name: string;

  /**
   * @param obj Serialized object.
   * @returns Deserialized object promise.
   */
  deserialize: (obj: any) => T | Promise<T>;
}
