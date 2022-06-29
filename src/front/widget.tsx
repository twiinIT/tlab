// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { ReactWidget } from '@jupyterlab/apputils';
import { listIcon } from '@jupyterlab/ui-components';
import { UUID } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';
import React from 'react';
import { TLabStore } from '../store/store';
import { ITLabFrontManager, ITLabWidgetProps } from './manager';

/**
 * TLab Lumino widget wrapping TLab.
 */
export class TLabShellWidget extends ReactWidget {
  constructor(
    private app: JupyterFrontEnd,
    private manager: ITLabFrontManager,
    private store: TLabStore,
    options?: Widget.IOptions
  ) {
    super(options);
    this.id = UUID.uuid4();
    this.title.label = 'twiinIT Lab';
    this.title.closable = true;
    this.title.icon = listIcon;
  }

  render(): JSX.Element {
    return <TLab manager={this.manager} store={this.store} />;
  }
}

function TLab({ manager, store }: ITLabWidgetProps) {
  return (
    <div>
      <div>twiinIT Lab</div>
      {[...manager.widgets].map(w => w.component({ manager, store }))}
    </div>
  );
}
