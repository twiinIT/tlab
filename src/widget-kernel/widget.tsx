// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import React, { useState } from 'react';
import { ITLabWidgetProps } from '../front/manager';

export function KernelWidget({ manager, store }: ITLabWidgetProps) {
  const [name, setName] = useState('');

  return (
    <div>
      <h1>Kernel Widget</h1>
      <button onClick={() => store.connect()}>Connect kernel</button>
      <form
        onSubmit={e => {
          e.preventDefault();
          store.fetch(name);
          setName('');
        }}
      >
        <label>
          Fetch
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>
        <input type="submit" />
      </form>
    </div>
  );
}
