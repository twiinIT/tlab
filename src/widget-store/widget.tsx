// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import React, { useState } from 'react';
import { ITLabWidgetProps } from '../front/manager';
import { useStoreSignal } from '../store/store';

export function StoreWidget({ manager, store }: ITLabWidgetProps) {
  const [name, setName] = useState('');
  const [objList, setObjList] = useState('');

  useStoreSignal(store, store => {
    setObjList(JSON.stringify([...store.objects.values()], undefined, 2));
  });

  return (
    <div>
      <div>Store Widget</div>
      <button onClick={() => store.connect()}>Connect kernel</button>
      <form
        onSubmit={e => {
          e.preventDefault();
          store.fetch(name);
          setName('');
        }}
      >
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input type="submit" />
      </form>
      <pre>{objList}</pre>
    </div>
  );
}
