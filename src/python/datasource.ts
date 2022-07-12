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
  dataSources: Map<string, IPyDataSource>;

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
  dataSources = new Map<string, IPyDataSource>();

  register(ds: IPyDataSource) {
    this.dataSources.set(ds.id, ds);
  }
}
