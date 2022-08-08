// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import React, { createElement, useMemo, useState } from 'react';
import { ITLabWidgetProps } from '../front/manager';
import { Model } from '../store/models';
import { IFilterResult, ITLabStore, useStoreSignal } from '../store/store';
import { ITLabCtrlManager } from './manager';

type ControllerWidgetProps = ITLabWidgetProps & {
  ctrlManager: ITLabCtrlManager;
};

export function ControllerWidget({
  manager,
  store,
  ctrlManager
}: ControllerWidgetProps) {
  const [children, setChildren] = useState<JSX.Element[]>([]);

  return (
    <div>
      <h1>Controller Widget</h1>
      <h2>Instantiate a new model</h2>
      <Creator store={store} ctrlManager={ctrlManager} />
      <h2>Add a control</h2>
      <Selector
        store={store}
        ctrlManager={ctrlManager}
        onAdd={e => setChildren([...children, e])}
      />
      <h2>Controls</h2>
      {children}
    </div>
  );
}

function Creator({
  store,
  ctrlManager
}: {
  store: ITLabStore;
  ctrlManager: ITLabCtrlManager;
}) {
  const [modelName, setModelName] = useState('');
  const [name, setName] = useState('');
  const models = useMemo(() => ctrlManager.getModels(), [ctrlManager]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    const model = new models[modelName]();
    store.add(name, model);
    setModelName('');
    setName('');
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <select value={modelName} onChange={e => setModelName(e.target.value)}>
          <option value="">Select a model</option>
          {Object.keys(models).map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input type="submit" />
      </form>
    </div>
  );
}

function Selector({
  store,
  ctrlManager,
  onAdd
}: {
  store: ITLabStore;
  ctrlManager: ITLabCtrlManager;
  onAdd: (el: JSX.Element) => void;
}) {
  const [attrVal, setAttrVal] = useState('');
  const [ctrlVal, setCtrlVal] = useState('');
  const [attributes, setAttributes] = useState<{
    [key: string]: IFilterResult<Model>;
  }>({});

  useStoreSignal(store, store => {
    const opts: { [key: string]: IFilterResult<Model> } = {};
    for (const res of store.filter()) {
      opts[[res.name, ...res.path].join('.')] = res;
    }
    setAttributes(opts);
  });

  const controllers = useMemo(() => {
    const res = attributes[attrVal];
    if (!res) return {};
    const modelName = res.data._modelName;
    const controllers = ctrlManager.getControllers(modelName);
    return controllers;
  }, [attrVal, attributes, ctrlManager]);

  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          const props = { res: attributes[attrVal] };
          const el = createElement(controllers[ctrlVal], props);
          onAdd(el);
        }}
      >
        <select value={attrVal} onChange={e => setAttrVal(e.target.value)}>
          <option value="">Select an attribute</option>
          {Object.entries(attributes).map(([attr, res]) => (
            <option key={attr} value={attr}>
              {attr} ({res?.data._modelName})
            </option>
          ))}
        </select>
        <select value={ctrlVal} onChange={e => setCtrlVal(e.target.value)}>
          <option value="">Select a controller</option>
          {Object.keys(controllers).map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <input type="submit" />
      </form>
    </div>
  );
}
