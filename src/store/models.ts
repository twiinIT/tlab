// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { Subject, Subscription } from 'rxjs';

type JSONPatchOperationType =
  | 'add'
  | 'remove'
  | 'replace'
  | 'move'
  | 'copy'
  | 'test';

interface IJSONPatchOperation<T> {
  op: JSONPatchOperationType;
  path: string[];
  value?: T;
}

class Value<T> extends Subject<IJSONPatchOperation<T>> {
  private _value?: T;
  private _subscription?: Subscription;

  get value(): T | undefined {
    return this._value;
  }

  /**
   * https://datatracker.ietf.org/doc/html/rfc6902/#section-4
   */
  set value(value: T | undefined) {
    if (value === this._value) return;

    // Validation and update
    let op: JSONPatchOperationType = 'replace';
    if (this._value === undefined) op = 'add';
    this._value = this.validate(value);
    if (this._value === undefined) op = 'remove';

    // Update value subscription
    this._subscription?.unsubscribe();
    this._subscription = (this._value as Model | undefined)?.subscribe?.({
      next: v => this.next(v)
    });

    // Emit update event
    this.next({ op, path: [], value: this._value });
  }

  validate(value: T | undefined): T | undefined {
    return value;
  }

  toJSON() {
    // works somehow
    return (this.value as Model | undefined)?.toJSON?.() ?? this.value;
  }
}

export abstract class Model extends Subject<IJSONPatchOperation<any>> {
  abstract _modelName: string;

  private _syncedKeys?: string[];
  private _syncedValues: { [key: string]: Value<any> } = {};

  constructor() {
    super();

    // Subscribe to synced attributes
    this._syncedKeys?.forEach(key => {
      const prev = this[key as keyof this];
      const val = new Value<typeof prev>();
      this._syncedValues[key] = val;
      val.value = prev;

      Reflect.defineProperty(this, key, {
        get: () => val.value,
        set: v => (val.value = v)
      });

      val.subscribe({
        next: ({ op, path, value }) =>
          this.next({ op, path: [key.toString(), ...path], value })
      });
    });

    // Log changes
    this.subscribe(console.log);
  }

  toJSON() {
    return { _modelName: this._modelName, ...this._syncedValues };
  }

  /**
   * Parse a JSON object into a model recursively.
   * @param dataModels Map of data models
   * @param obj
   * @returns Deserialized model
   */
  static parseModel(dataModels: Map<string, any>, obj: any): Model {
    const modelClass = dataModels.get(obj._modelName);
    const model = new modelClass();
    for (const key of Reflect.ownKeys(obj)) {
      if (key === '_modelName') continue;
      let value = obj[key];
      if (value._modelName) value = Model.parseModel(dataModels, value);
      model[key] = value;
    }
    return model;
  }
}

export const sync: PropertyDecorator = (target, key) => {
  let syncedKeys = Reflect.get(target, '_syncedKeys');
  if (syncedKeys === undefined) {
    syncedKeys = [];
    Reflect.set(target, '_syncedKeys', syncedKeys);
  }
  syncedKeys.push(key);
};

class Person extends Model {
  _modelName = 'Person';
  @sync name: string;
  @sync age: number;
  @sync isStudent: boolean;

  constructor(name: string, age: number, isStudent: boolean) {
    super();
    this.name = name;
    this.age = age;
    this.isStudent = isStudent;
  }
}

class Family extends Model {
  _modelName = 'Family';
  @sync name: string;
  @sync mother: Person;
  @sync father: Person;
  zipCode: number;

  constructor(name: string, mother: Person, father: Person, zipCode: number) {
    super();
    this.name = name;
    this.mother = mother;
    this.father = father;
    this.zipCode = zipCode;
  }
}

const pers1 = new Person('John', 30, true);
// { op: 'add', path: [ 'name' ], value: 'John' }
// { op: 'add', path: [ 'age' ], value: 30 }
// { op: 'add', path: [ 'isStudent' ], value: true }
pers1.name = 'Jane';
// { op: 'replace', path: [ 'name' ], value: 'Jane' }
pers1.age = 40;
// { op: 'replace', path: [ 'age' ], value: 40 }
pers1.isStudent = false;
// { op: 'replace', path: [ 'isStudent' ], value: false }

const pers2 = new Person('Peter', 10, true);
// { op: 'add', path: [ 'name' ], value: 'Peter' }
// { op: 'add', path: [ 'age' ], value: 10 }
// { op: 'add', path: [ 'isStudent' ], value: true }

const family = new Family("Jane's family", pers1, pers2, 12345);
// { op: 'add', path: [ 'name' ], value: "Jane's family" }
// { op: 'add', path: [ 'mother' ], value: Person { ... } }
// { op: 'add', path: [ 'father' ], value: Person { ... } }
family.name = "Peter's family";
// { op: 'replace', path: [ 'name' ], value: "Peter's family" }
family.mother.age = 60;
// { op: 'replace', path: [ 'age' ], value: 60 }
// { op: 'replace', path: [ 'mother', 'age' ], value: 60 }
family.mother.isStudent = false;
// { op: 'replace', path: [ 'isStudent' ], value: false }
// { op: 'replace', path: [ 'mother', 'isStudent' ], value: false }
family.father.age = 70;
// { op: 'replace', path: [ 'age' ], value: 70 }
// { op: 'replace', path: [ 'father', 'age' ], value: 70 }
family.father.isStudent = false;
// { op: 'replace', path: [ 'isStudent' ], value: false }
// { op: 'replace', path: [ 'father', 'isStudent' ], value: false }
family.zipCode = 54321;
// *nothing*

console.log(JSON.stringify(family, null, 2));
// {
//   "_modelName": "Family",
//   "name": "Peter's family",
//   "mother": {
//     "_modelName": "Person",
//     "name": "Jane",
//     "age": 60,
//     "isStudent": false
//   },
//   "father": {
//     "_modelName": "Person",
//     "name": "Peter",
//     "age": 70,
//     "isStudent": false
//   }
// }
