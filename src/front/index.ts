import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { Token } from '@lumino/coreutils';
import { TwiinITLabWidget } from './widget';

namespace CommandIDs {
  export const open = 'twiinit_lab:open';
}

export const ITwiinITLabFront = new Token<ITwiinITLabFront>(
  'twiinit_lab:ITwiinITLabFront'
);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITwiinITLabFront {}

export const labFrontPlugin: JupyterFrontEndPlugin<ITwiinITLabFront> = {
  id: 'twiinit_lab:front',
  autoStart: true,
  requires: [ILabShell],
  optional: [ICommandPalette, ILauncher],
  provides: ITwiinITLabFront,
  activate: (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    palette?: ICommandPalette,
    launcher?: ILauncher
  ): ITwiinITLabFront => {
    const front = new TwiinITLabFront();

    const command = CommandIDs.open;
    const label = 'Open twiinIT Lab';
    const category = 'twiinIT Lab';

    app.commands.addCommand(command, {
      label,
      execute: () => {
        const widget = new TwiinITLabWidget();
        labShell.add(widget, 'main');
      }
    });

    palette?.addItem({ command, category });
    launcher?.add({ command, category });

    return front;
  }
};

class TwiinITLabFront implements ITwiinITLabFront {}
