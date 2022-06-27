// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import React, { useState } from 'react';
import { ITLabWidgetProps } from '../front/manager';

export function StoreWidget({
  app,
  manager: front,
  store
}: ITLabWidgetProps): JSX.Element {
  const [name, setName] = useState('');

  return (
    <div>
      <div>Store Widget</div>
      <button onClick={() => store.connect()}>Connect kernel</button>
      <form
        onSubmit={e => {
          e.preventDefault();
          store.fetch(name);
        }}
      >
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
