// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import plotly from 'plotly.js/dist/plotly';
import React, { useState } from 'react';
import PlotlyEditor from 'react-chart-editor';
import { ITLabWidgetProps } from '../front/manager';
import { useStoreSignal } from '../store/store';

import 'react-chart-editor/lib/react-chart-editor.css';

export function PlotlyWidget({
  manager,
  store
}: ITLabWidgetProps): JSX.Element {
  const [state, setState] = useState<any>({ data: [], layout: {}, frames: [] });
  const [config, setConfig] = useState<any>({ editable: true });
  const [dataSources, setDataSources] = useState<any>({});
  const [dataSourceOptions, setDataSourceOptions] = useState<any>([]);

  useStoreSignal(store, () => {
    const _dataSources: any = {};
    for (const obj of store.objects) {
      _dataSources[obj.name] = obj.data;
    }
    setDataSources(_dataSources);
    const _dataSourceOptions = Object.keys(_dataSources).map(name => ({
      value: name,
      label: name
    }));
    setDataSourceOptions(_dataSourceOptions);
  });

  return (
    <div>
      <PlotlyEditor
        data={state.data}
        layout={state.layout}
        config={config}
        frames={state.frames}
        dataSources={dataSources}
        dataSourceOptions={dataSourceOptions}
        plotly={plotly}
        onUpdate={(data, layout, frames) => setState({ data, layout, frames })}
        useResizeHandler
        debug
        advancedTraceTypeSelector
      />
    </div>
  );
}
