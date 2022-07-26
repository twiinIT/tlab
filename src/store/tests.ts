// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { Model, sync } from './models';

export class Person extends Model {
  static _modelName = 'Person';
  @sync name!: string;
  @sync age!: number;
  @sync isStudent!: boolean;
}

export class Family extends Model {
  static _modelName = 'Family';
  @sync name!: string;
  @sync mother!: Person;
  @sync father!: Person;
  zipCode?: number;
}
