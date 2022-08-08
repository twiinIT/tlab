// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { labBuiltinsPlugin } from './builtins';
import { labFrontManagerPlugin } from './front';
import { labPythonPlugin } from './python';
import { labStoreManagerPlugin } from './store';
import { labWidgetCtrlPlugin } from './widget-controller';
import { labWidgetKernelPlugin } from './widget-kernel';
import { labWidgetPlotlyPlugin } from './widget-plotly';

/**
 * Exported extension plugins
 */
const plugins = [
  labBuiltinsPlugin,
  labFrontManagerPlugin,
  labPythonPlugin,
  labStoreManagerPlugin,
  labWidgetCtrlPlugin,
  labWidgetKernelPlugin,
  labWidgetPlotlyPlugin
];

export default plugins;
