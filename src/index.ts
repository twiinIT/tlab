import { labFrontPlugin } from './front';
import { labPlotlyPlugin } from './plotly';
import { labStoreManagerPlugin } from './store';
import { labStorePythonPlugin } from './store-python';
import { labStoreWidgetPlugin } from './store-widget';

const plugins = [
  labFrontPlugin,
  labPlotlyPlugin,
  labStoreManagerPlugin,
  labStorePythonPlugin,
  labStoreWidgetPlugin
];

export default plugins;
