// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import React, { useState } from 'react';
import plotly from 'plotly.js/dist/plotly';
import PlotlyEditor from 'react-chart-editor';
import { ITLabWidgetProps } from '../front/manager';

import 'react-chart-editor/lib/react-chart-editor.css';

const dataSources = {
  col1: [1, 2, 3],
  col2: [4, 3, 2],
  col3: [17, 13, 9]
};

const dataSourceOptions = Object.keys(dataSources).map(name => ({
  value: name,
  label: name
}));

export function PlotlyWidget({
  app,
  manager: front,
  store
}: ITLabWidgetProps): JSX.Element {
  const [state, setState] = useState<any>({ data: [], layout: {}, frames: [] });
  const [config, setConfig] = useState<any>({ editable: true });

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
        onUpdate={(...args: any[]) => setState(args)}
        useResizeHandler
        debug
        advancedTraceTypeSelector
      />
    </div>
  );
}
