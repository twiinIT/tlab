// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import produce from 'immer';
import React from 'react';
import { useSyncValue } from '../store/models';
import { IControllerProps } from '../widget-controller/manager';
import * as models from './models';

export function BoolCheckbox({ res }: IControllerProps<models.BooleanModel>) {
  const [value, setValue] = useSyncValue(
    res.data,
    m => m.value,
    (m, v) => {
      m.value = v;
    }
  );

  return (
    <div>
      <label>
        <b>{res.name}</b>.{res.path.join('.')}
        <input
          type="checkbox"
          checked={value}
          onChange={e => {
            setValue(e.target.checked);
          }}
        />
      </label>
    </div>
  );
}

export function NumberInput({ res }: IControllerProps<models.NumberModel>) {
  const [value, setValue] = useSyncValue(
    res.data,
    m => m.value,
    (m, v) => {
      m.value = v;
    }
  );

  return (
    <div>
      <label>
        <b>{res.name}</b>.{res.path.join('.')}
        <input
          type="number"
          value={value}
          onChange={e => {
            setValue(e.target.valueAsNumber);
          }}
        />
      </label>
    </div>
  );
}

export function NumberSlider({ res }: IControllerProps<models.NumberModel>) {
  const [value, setValue] = useSyncValue(
    res.data,
    m => m.value,
    (m, v) => {
      m.value = v;
    }
  );

  return (
    <div>
      <label>
        <b>{res.name}</b>.{res.path.join('.')}
        <input
          type="range"
          value={value}
          min="1"
          max="100"
          onChange={e => {
            setValue(e.target.valueAsNumber);
          }}
        />
        {value}
      </label>
    </div>
  );
}

export function StringInput({ res }: IControllerProps<models.StringModel>) {
  const [value, setValue] = useSyncValue(
    res.data,
    m => m.value,
    (m, v) => {
      m.value = v;
    }
  );

  return (
    <div>
      <label>
        <b>{res.name}</b>.{res.path.join('.')}
        <input
          type="text"
          value={value}
          onChange={e => {
            setValue(e.target.value);
          }}
        />
      </label>
    </div>
  );
}

export function ArrayInput({ res }: IControllerProps<models.ArrayModel>) {
  const [value, setValue] = useSyncValue(
    res.data,
    m => m.value,
    (m, v) => {
      m.value = v;
    }
  );

  return (
    <div>
      <label>
        <b>{res.name}</b>.{res.path.join('.')}
        <ol start={0}>
          {value.map((v, i) => (
            <li key={i}>
              <input
                type="number"
                value={v}
                onChange={e => {
                  setValue(
                    produce(value, draft => {
                      draft[i] = e.target.valueAsNumber;
                    })
                  );
                }}
              />
              <span
                onClick={() => {
                  setValue(
                    produce(value, draft => {
                      draft.splice(i, 1);
                    })
                  );
                }}
              >
                X
              </span>
            </li>
          ))}
          <button
            onClick={() => {
              setValue(
                produce(value, draft => {
                  draft.push(0);
                })
              );
            }}
          >
            +
          </button>
        </ol>
      </label>
    </div>
  );
}
