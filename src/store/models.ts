// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { Subject, Subscription } from 'rxjs';

/**
 * Value (de)serializer.
 * TODO: Extract validator.
 */
export interface ISerializer<T> {
  deserialize?: (value?: any) => T;
  serialize?: (value?: T) => any;
  // validator?: (value?: T) => boolean;
}

export type JSONPatchOperationType =
  | 'add'
  | 'remove'
  | 'replace'
  | 'move'
  | 'copy'
  | 'test';

/**
 * JSON Patch operation.
 * https://datatracker.ietf.org/doc/html/rfc6902/
 */
export interface IJSONPatchOperation<T> {
  op: JSONPatchOperationType;
  path: string[];
  value?: T;
}

/**
 * Subject proxy for a value.
 */
export class Value<T> extends Subject<IJSONPatchOperation<T>> {
  /**
   * Internal value.
   */
  private _value?: T;
  /**
   * If _value is a model, subscription to its changes.
   */
  private _subscription?: Subscription;

  constructor(public serializer?: ISerializer<T>) {
    super();
  }

  /**
   * Return the internal value.
   */
  get value(): T | undefined {
    return this._value;
  }

  /**
   * Set the internal value and emit a patch operation.
   */
  set value(value: T | undefined) {
    // Validation and update
    let op: JSONPatchOperationType = 'replace';
    if (this._value === undefined) op = 'add';
    const didChange = this.setWithoutEmit(value);
    if (!didChange) return;
    if (this._value === undefined) op = 'remove';
    // Emit update event
    this.next({ op, path: [], value: this.toJSON() });
  }

  /**
   * Set the internal value without emitting a patch operation.
   */
  setWithoutEmit(value: T | undefined) {
    if (value === this._value) return false;
    this._value = this.serializer?.deserialize?.(value) ?? value;
    // Update value subscription
    this._subscription?.unsubscribe();
    this._subscription = (this._value as Model | undefined)?.subscribe?.({
      next: v => this.next(v)
    });
    return true;
  }

  toJSON() {
    return (
      this.serializer?.serialize?.(this.value) ?? // Use value serializer
      (this.value as any)?.toJSON?.() ?? // Recursively serialize value
      this.value // Use value as is
    );
  }
}

/**
 * Base abstract class for all data models.
 */
export abstract class Model extends Subject<IJSONPatchOperation<any>> {
  /**
   * Model name. Should be something unique.
   */
  static _modelName: string;

  /**
   * List of synced keys + serializer filled by the @sync decorator.
   */
  private _syncedKeys?: { [key: string]: ISerializer<any> };
  private _syncedValues: { [key: string]: Value<any> } = {};

  constructor() {
    super();

    if (this._syncedKeys) {
      Object.entries(this._syncedKeys).forEach(([key, serializer]) => {
        // Create synced value
        const prev = this[key as keyof this];
        const val = new Value<typeof prev>(serializer);
        this._syncedValues[key] = val;
        this.setWithoutEmit(key, prev);

        // Attach value to model
        Reflect.defineProperty(this, key, {
          get: () => val.value,
          set: v => (val.value = v)
        });

        // Subscribe to synced attributes
        val.subscribe({
          next: ({ op, path, value }) =>
            this.next({ op, path: [key.toString(), ...path], value })
        });
      });
    }
  }

  /**
   * Set an synced attribute without emmitting a patch operation.
   * @param key Synced key.
   * @param value New value.
   */
  setWithoutEmit(key: string, value: any) {
    this._syncedValues[key].setWithoutEmit(value);
  }

  toJSON() {
    return { _modelName: Model._modelName, ...this._syncedValues };
  }
}

/**
 * Decorator to declare synced attributes on a model.
 * @param serializer Serializer for the attribute.
 * @returns
 */
export function sync<T>(serializer?: ISerializer<T>): PropertyDecorator {
  return (target, key) => {
    let syncedKeys = Reflect.get(target, '_syncedKeys');
    if (syncedKeys === undefined) {
      syncedKeys = {};
      Reflect.set(target, '_syncedKeys', syncedKeys);
    }
    Reflect.set(syncedKeys, key, serializer);
  };
}
