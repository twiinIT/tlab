// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { labDanfoPlugin } from './danfo';
import { labFrontManagerPlugin } from './front';
import { labPrimitivesPlugin } from './primitives';
import { labStoreManagerPlugin } from './store';
import { labStorePythonPlugin } from './store-python';
import { labWidgetPlotlyPlugin } from './widget-plotly';
import { labWidgetStorePlugin } from './widget-store';

/**
 * Exported extension plugins
 */
const plugins = [
  labDanfoPlugin,
  labFrontManagerPlugin,
  labPrimitivesPlugin,
  labStoreManagerPlugin,
  labStorePythonPlugin,
  labWidgetPlotlyPlugin,
  labWidgetStorePlugin
];

export default plugins;
