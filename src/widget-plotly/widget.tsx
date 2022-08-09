// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import plotly from 'plotly.js/dist/plotly';
import React, { useState } from 'react';
import PlotlyEditor from 'react-chart-editor';
import 'react-chart-editor/lib/react-chart-editor.css';
import { ArrayModel } from '../builtins/models';
import { ITLabWidgetProps } from '../front/manager';
import { useStoreSignal } from '../store/store';

export function PlotlyWidget({ manager, store }: ITLabWidgetProps) {
  const [state, setState] = useState<any>({ data: [], layout: {}, frames: [] });
  const [config, setConfig] = useState<any>({ editable: true });
  const [dataSources, setDataSources] = useState<any>();
  const [dataSourceOptions, setDataSourceOptions] = useState<any>();

  // Once when the widget is mounted
  // And when the store changes
  // TODO: Do not iterate over the whole store each times.
  useStoreSignal(store, store => {
    // Update data sources
    const _dataSources: any = {};
    for (const { name, path, data } of store.filter<ArrayModel>(ArrayModel)) {
      _dataSources[[name, ...path].join('.')] = data.value;
    }
    setDataSources(_dataSources);

    // Update data source options
    const _dataSourceOptions = Reflect.ownKeys(_dataSources).map(name => ({
      value: name,
      label: name
    }));
    setDataSourceOptions(_dataSourceOptions);

    // refresh plotly data
    const newData = state.data.map((traceObj: any) => {
      const columnNames = traceObj.meta.columnNames;
      Object.entries(columnNames).forEach(([key, val]: any) => {
        traceObj[key] = _dataSources[val];
      });
      return traceObj;
    });
    setState({ ...state, data: newData });
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
