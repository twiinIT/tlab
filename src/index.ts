// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { labDanfoPlugin } from './danfo';
import { labFrontManagerPlugin } from './front';
import { labPrimitivesPlugin } from './primitives';
import { labStorePythonPlugin } from './python';
import { labStoreManagerPlugin } from './store';
import { labWidgetPlotlyPlugin } from './widget-plotly';
import { labWidgetStorePlugin } from './widget-store';

/**
 * Exported extension plugins
 */
const plugins = [
  labDanfoPlugin,
  labFrontManagerPlugin,
  labPrimitivesPlugin,
  labStorePythonPlugin,
  labStoreManagerPlugin,
  labWidgetPlotlyPlugin,
  labWidgetStorePlugin
];

export default plugins;
