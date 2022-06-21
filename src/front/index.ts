import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { Token } from '@lumino/coreutils';
import { TLabShellWidget } from './widget';

namespace CommandIDs {
  export const open = 'twiinit_lab:open';
}

export const ITLabFront = new Token<ITLabFront>('twiinit_lab:ITLabFront');

export interface ITLabFront {
  widgets: ITLabWidget[];
}

export interface ITLabWidget {
  id: string;
  name: string;
}

export const labFrontPlugin: JupyterFrontEndPlugin<ITLabFront> = {
  id: 'twiinit_lab:front',
  autoStart: true,
  requires: [ILabShell],
  optional: [ICommandPalette, ILauncher],
  provides: ITLabFront,
  activate: (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    palette?: ICommandPalette,
    launcher?: ILauncher
  ): ITLabFront => {
    const front = new TLabFront();

    const command = CommandIDs.open;
    const label = 'Open twiinIT Lab';
    const category = 'twiinIT Lab';

    app.commands.addCommand(command, {
      label,
      execute: () => {
        const widget = new TLabShellWidget(front);
        labShell.add(widget, 'main');
      }
    });

    palette?.addItem({ command, category });
    launcher?.add({ command, category });

    return front;
  }
};

class TLabFront implements ITLabFront {
  widgets: ITLabWidget[] = [];
}
