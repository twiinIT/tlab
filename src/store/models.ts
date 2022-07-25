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

export interface IJSONPatchOperation<T> {
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
