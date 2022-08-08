// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { Token } from '@lumino/coreutils';
import { Model } from '../store/models';
import { IFilterResult } from '../store/store';

export const ITLabCtrlManager = new Token<ITLabCtrlManager>(
  'tlab:ITLabCtrlManager'
);

export interface IControllerProps<T extends Model> {
  res: IFilterResult<T>;
}

type Controller<T extends Model> = (props: IControllerProps<T>) => JSX.Element;

interface IControllerDict<T extends Model> {
  [componentName: string]: Controller<T>;
}

type ModelCls = (new () => Model) & { _modelName: string };

export interface ITLabCtrlManager {
  registerController<T extends Model>(
    modelName: string,
    component: Controller<T>,
    controllerName: string
  ): void;

  getControllers<T extends Model>(modelName: string): IControllerDict<T>;

  /**
   * Register a instantiable data model.
   * @param modelCls Model class.
   */
  registerModel(modelCls: ModelCls): void;

  getModels(): { [key: string]: ModelCls };
}

export class TLabCtrlManager implements ITLabCtrlManager {
  private ctrlMap: { [name: string]: IControllerDict<any> | undefined } = {};
  private modelMap: { [name: string]: ModelCls } = {};

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

  registerModel(modelCls: ModelCls) {
    this.modelMap[modelCls._modelName] = modelCls;
  }

  getModels() {
    return this.modelMap;
  }
}
