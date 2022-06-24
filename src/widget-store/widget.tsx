// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import React, { useCallback, useState } from 'react';
import { ITLabWidgetProps } from '../front/front';

export function StoreWidget({
  app,
  front,
  store
}: ITLabWidgetProps): JSX.Element {
  const [name, setName] = useState('');

  const handleKernelConnect = () => {
    store.connect();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(store);
    store.addToStore(name);
  };

  return (
    <div>
      <div>Store Widget</div>
      <button onClick={handleKernelConnect}>Connect kernel</button>

      <form onSubmit={handleSubmit}>
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
