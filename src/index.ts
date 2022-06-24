// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { labApacheArrowPlugin } from './apache-arrow';
import { labFrontPlugin } from './front';
import { labStoreManagerPlugin } from './store';
import { labStorePythonPlugin } from './store-python';
import { labWidgetPlotlyPlugin } from './widget-plotly';
import { labWidgetStorePlugin } from './widget-store';

const plugins = [
  labApacheArrowPlugin,
  labFrontPlugin,
  labStoreManagerPlugin,
  labStorePythonPlugin,
  labWidgetPlotlyPlugin,
  labWidgetStorePlugin
];

export default plugins;
