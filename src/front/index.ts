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
import { ITLabFrontManager, TLabFrontManager } from './manager';
import { TLabShellWidget } from './widget';

namespace CommandIDs {
  export const open = 'tlab:open';
}

/**
 * Front manager plugin.
 * Registers the command and the front manager.
 */
export const labFrontManagerPlugin: JupyterFrontEndPlugin<ITLabFrontManager> = {
  id: 'tlab:front_manager',
  autoStart: true,
  requires: [ILabShell, ICommandPalette, ILauncher, ITLabStoreManager],
  provides: ITLabFrontManager,
  activate: (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    palette: ICommandPalette,
    launcher: ILauncher,
    storeManager: ITLabStoreManager
  ) => {
    const frontManager = new TLabFrontManager();

    const command = CommandIDs.open;
    const label = 'Open twiinIT Lab';
    const category = 'twiinIT Lab';

    app.commands.addCommand(command, {
      label,
      execute: () => {
        const widget = new TLabShellWidget(
          app,
          frontManager,
          storeManager.newStore()
        );
        labShell.add(widget, 'main');
      }
    });

    palette.addItem({ command, category });
    launcher.add({ command, category });

    console.log('JupyterLab extension tlab is activated!');
    return frontManager;
  }
};
