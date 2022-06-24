// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

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
  export const open = 'tlab:open';
}

export const labFrontPlugin: JupyterFrontEndPlugin<ITLabFront> = {
  id: 'tlab:front',
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
