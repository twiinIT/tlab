import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabFront } from '../front/front';
import { StoreWidget } from './widget';

export const labWidgetStorePlugin: JupyterFrontEndPlugin<void> = {
  id: 'twiinit_lab:widget_store',
  autoStart: true,
  requires: [ITLabFront],
  activate: (app: JupyterFrontEnd, front: ITLabFront) => {
    front.registerWidget({
      id: 'store',
      name: 'Store',
      component: StoreWidget
    });
  }
};
