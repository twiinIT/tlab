// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { Token } from '@lumino/coreutils';

export const ITLabPyDSManager = new Token<ITLabPyDSManager>(
  'tlab:ITLabPyDSManager'
);

/**
 * Python data source manager.
 */
export interface ITLabPyDSManager {
  /**
   * Available data sources.
   */
  dataSources: IterableIterator<IPyDataSource>;

  /**
   * @param ds
   */
  register(ds: IPyDataSource): void;
}

/**
 * Python data source interface.
 */
export interface IPyDataSource {
  /**
   * A human-readable id.
   */
  id: string;

  /**
   * Module path.
   */
  module: string;

  /**
   * Python class name.
   */
  class: string;
}

/**
 * ITLabPyDSManager implementation.
 */
export class TLabPyDSManager implements ITLabPyDSManager {
  private _dataSources: Map<string, IPyDataSource>;

  constructor() {
    this._dataSources = new Map();
  }

  get dataSources(): IterableIterator<IPyDataSource> {
    return this._dataSources.values();
  }

  register(ds: IPyDataSource): void {
    this._dataSources.set(ds.id, ds);
  }
}
