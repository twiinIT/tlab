import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabFront } from '../front/front';
import { StoreWidget } from './widget';

export const labStoreWidgetPlugin: JupyterFrontEndPlugin<void> = {
  id: 'twiinit_lab:store_widget',
  autoStart: true,
  requires: [ITLabFront],
  activate: (app: JupyterFrontEnd, front: ITLabFront) => {
    front.widgets.set('store_widget', {
      id: 'store',
      name: 'Store',
      component: StoreWidget
    });
  }
};
