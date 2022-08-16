// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { Token } from '@lumino/coreutils';
import { Model } from '../store/models';
import { IFilterResult, ITLabStore } from '../store/store';

export const ITLabCtrlManager = new Token<ITLabCtrlManager>(
  'tlab:ITLabCtrlManager'
);

export interface IControllerProps<T extends Model> {
  store: ITLabStore;
  res: IFilterResult<T>;
}

type Controller<T extends Model> = (props: IControllerProps<T>) => JSX.Element;

interface IControllerDict<T extends Model> {
  [componentName: string]: Controller<T>;
}

/**
 * Controller manager. Registers controllers and front-instantiable data models.
 */
export interface ITLabCtrlManager {
  /**
   * Register a controller.
   * @param modelName
   * @param component React component.
   * @param controllerName
   */
  registerController<T extends Model>(
    modelName: string,
    component: Controller<T>,
    controllerName: string
  ): void;

  getControllers<T extends Model>(modelName: string): IControllerDict<T>;
}

export class TLabCtrlManager implements ITLabCtrlManager {
  // TODO: replace w/ Map?
  private ctrlMap: { [name: string]: IControllerDict<any> | undefined } = {};

  registerController<T extends Model>(
    modelName: string,
    component: Controller<T>,
    controllerName: string
  ) {
    this.ctrlMap[modelName] = {
      ...this.ctrlMap[modelName],
      [controllerName]: component
    };
  }

  getControllers<T extends Model>(modelName: string): IControllerDict<T> {
    return this.ctrlMap[modelName] ?? {};
  }
}
