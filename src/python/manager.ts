// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { Token } from '@lumino/coreutils';

export const ITLabPythonManager = new Token<ITLabPythonManager>(
  'tlab:ITLabPythonManager'
);

/**
 * Registers Python model classes.
 */
export interface ITLabPythonManager {
  /**
   * Register a model class.
   * @param modelName
   * @param modulePath
   * @param className
   */
  registerClass(modelName: string, modulePath: string, className: string): void;

  getClasses(): [string, [string, string]][];
}

export class TLabPythonManager implements ITLabPythonManager {
  private clsMap = new Map<string, [string, string]>();

  registerClass(
    modelName: string,
    modulePath: string,
    className: string
  ): void {
    this.clsMap.set(modelName, [modulePath, className]);
  }

  getClasses(): [string, [string, string]][] {
    return [...this.clsMap.entries()];
  }
}
