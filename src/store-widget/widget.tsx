import React, { useEffect, useCallback } from 'react';
import { ITLabWidgetProps } from '../front/front';

export function StoreWidget({
  app,
  front,
  store
}: ITLabWidgetProps): JSX.Element {
  const handleKernelConnect = useCallback(() => {
    store.connect();
  }, [store]);

  return (
    <div>
      <div>Store Widget</div>
      <button onClick={handleKernelConnect}>Connect kernel</button>
    </div>
  );
}
