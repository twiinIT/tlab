// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { labBuiltinsPlugin } from './builtins';
import { labFrontManagerPlugin } from './front';
import { labPythonPlugin } from './python';
import { labStoreManagerPlugin } from './store';
import { labWidgetCtrlPlugin } from './widget-controller';
import { labWidgetPlotlyPlugin } from './widget-plotly';
import { labWidgetStorePlugin } from './widget-store';

/**
 * Exported extension plugins
 */
const plugins = [
  labBuiltinsPlugin,
  labFrontManagerPlugin,
  labPythonPlugin,
  labStoreManagerPlugin,
  labWidgetCtrlPlugin,
  labWidgetPlotlyPlugin,
  labWidgetStorePlugin
];

export default plugins;
