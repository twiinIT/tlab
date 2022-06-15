import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the twiinit_lab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'twiinit_lab:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension twiinit_lab is activated!');
  }
};

export default plugin;
