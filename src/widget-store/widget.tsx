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

  return (
    <div>
      <div>Store Widget</div>
      <button onClick={() => store.connect()}>Connect kernel</button>
      <input type="text" value={name} onChange={e => setName(e.target.value)} />
      <input type="submit" onClick={() => store.fetch(name)} />
    </div>
  );
}
