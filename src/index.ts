import { labFrontPlugin } from './front';
import { labStoreManagerPlugin } from './store';
import { labStorePythonPlugin } from './store-python';
import { labWidgetPlotlyPlugin } from './widget-plotly';
import { labWidgetStorePlugin } from './widget-store';

const plugins = [
  labFrontPlugin,
  labStoreManagerPlugin,
  labStorePythonPlugin,
  labWidgetPlotlyPlugin,
  labWidgetStorePlugin
];

export default plugins;
