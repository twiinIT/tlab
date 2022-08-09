// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

declare module 'plotly.js/dist/plotly';

declare module 'react-chart-editor' {
  // TODO: remplace with real types
  export default function PlotlyEditor(props: {
    children?;
    layout?;
    data?: any[];
    config?;
    dataSourceOptions?: any[];
    dataSources?;
    frames?: any[];
    onUpdate?: (...args) => any;
    onRender?: (...args) => any;
    plotly?;
    useResizeHandler?: boolean;
    debug?: boolean;
    advancedTraceTypeSelector?: boolean;
    locale?: string;
    traceTypesConfig?;
    dictionaries?;
    divId?: string;
    hideControls?: boolean;
    showFieldTooltips?: boolean;
    srcConverters?: { toSrc; fromSrc };
    makeDefaultTrace?: (...args) => any;
    glByDefault?: boolean;
    fontOptions?: any[];
    chartHelp?;
    customConfig?;
  }): JSX.Element;
}
