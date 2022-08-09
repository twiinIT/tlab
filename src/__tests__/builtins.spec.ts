// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  ArrayModel,
  BooleanModel,
  NumberModel,
  StringModel
} from '../builtins/models';

test('BooleanModel: assignments', () => {
  const model = new BooleanModel();
  expect(model.value).toBe(false);
  model.value = true;
  expect(model.value).toBe(true);
  expect(() => {
    // @ts-ignore
    model.value = 'hello';
  }).toThrow();
});

test('NumberModel: assignments', () => {
  const model = new NumberModel();
  expect(model.value).toBe(0);
  model.value = 1;
  expect(model.value).toBe(1);
  model.value = -0.3;
  expect(model.value).toBe(-0.3);
  expect(() => {
    // @ts-ignore
    model.value = 'hello';
  }).toThrow();
});

test('StringModel: assignments', () => {
  const model = new StringModel();
  expect(model.value).toBe('');
  model.value = 'hello';
  expect(model.value).toBe('hello');
  expect(() => {
    // @ts-ignore
    model.value = 1;
  }).toThrow();
});

test('ArrayModel: assignments', () => {
  const model = new ArrayModel();
  expect(model.value).toEqual([]);
  model.value = [1, 2, 3];
  expect(model.value).toEqual([1, 2, 3]);
  expect(() => {
    // @ts-ignore
    model.value = 'hello';
  }).toThrow();
});

test('BooleanModel: replace event', done => {
  const model = new BooleanModel();
  model.subscribe(patch => {
    expect(patch).toEqual({ op: 'replace', path: ['value'], value: true });
    done();
  });
  model.value = true;
}, 100);

test('NumberModel: replace event', done => {
  const model = new NumberModel();
  model.subscribe(patch => {
    expect(patch).toEqual({ op: 'replace', path: ['value'], value: 1 });
    done();
  });
  model.value = 1;
}, 100);

test('StringModel: replace event', done => {
  const model = new StringModel();
  model.subscribe(patch => {
    expect(patch).toEqual({ op: 'replace', path: ['value'], value: 'hello' });
    done();
  });
  model.value = 'hello';
}, 100);

test('ArrayModel: replace event', done => {
  const model = new ArrayModel();
  model.subscribe(patch => {
    expect(patch).toEqual({ op: 'replace', path: ['value'], value: [1, 2, 3] });
    done();
  });
  model.value = [1, 2, 3];
}, 100);
