// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import plotly from 'plotly.js/dist/plotly';
import React, { useEffect, useState } from 'react';
import PlotlyEditor from 'react-chart-editor';
import 'react-chart-editor/lib/react-chart-editor.css';
import { ArrayModel } from '../builtins/models';
import { ITLabWidgetProps } from '../front/manager';
import { useStoreSignal } from '../store/store';

export function PlotlyWidget({
  manager,
  store
}: ITLabWidgetProps): JSX.Element {
  const [state, setState] = useState<any>({ data: [], layout: {}, frames: [] });
  const [config, setConfig] = useState<any>({ editable: true });
  const [dataSources, setDataSources] = useState<any>();
  const [dataSourceOptions, setDataSourceOptions] = useState<any>();

  /**
   * TODO: Do not iterate over the whole store each times.
   */
  const updateDataSources = () => {
    // Update data sources
    const _dataSources: any = {};
    for (const val of store.filter(ArrayModel)) {
      _dataSources[val.name] = (val.data as ArrayModel).value;
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
  };

  // Once when the widget is mounted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(updateDataSources, []);
  // When the store changes
  useStoreSignal(store, updateDataSources);

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
