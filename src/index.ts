// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { labFrontManagerPlugin } from './front';
import { labPythonPlugin } from './python';
import { labStoreManagerPlugin } from './store';
import { labWidgetPlotlyPlugin } from './widget-plotly';
import { labWidgetStorePlugin } from './widget-store';

/**
 * Exported extension plugins
 */
const plugins = [
  labFrontManagerPlugin,
  labPythonPlugin,
  labStoreManagerPlugin,
  labWidgetPlotlyPlugin,
  labWidgetStorePlugin
];

export default plugins;
