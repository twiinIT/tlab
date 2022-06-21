import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { ITLabStoreManager } from '../store/manager';
import { ITLabFront, TLabFront } from './front';
import { TLabShellWidget } from './widget';

namespace CommandIDs {
  export const open = 'twiinit_lab:open';
}

export const labFrontPlugin: JupyterFrontEndPlugin<ITLabFront> = {
  id: 'twiinit_lab:front',
  autoStart: true,
  requires: [ITLabStoreManager, ILabShell],
  optional: [ICommandPalette, ILauncher],
  provides: ITLabFront,
  activate: (
    app: JupyterFrontEnd,
    storeManager: ITLabStoreManager,
    labShell: ILabShell,
    palette?: ICommandPalette,
    launcher?: ILauncher
  ) => {
    const front = new TLabFront();

    const command = CommandIDs.open;
    const label = 'Open twiinIT Lab';
    const category = 'twiinIT Lab';

    app.commands.addCommand(command, {
      label,
      execute: () => {
        const widget = new TLabShellWidget(app, front, storeManager.newStore());
        labShell.add(widget, 'main');
      }
    });

    palette?.addItem({ command, category });
    launcher?.add({ command, category });

    return front;
  }
};
