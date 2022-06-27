// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { listIcon } from '@jupyterlab/ui-components';
import { UUID } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import { Widget } from '@lumino/widgets';
import React from 'react';
import { ITLabFrontManager, ITLabWidgetProps } from './manager';
import { TLabStore } from '../store/store';

/**
 * TLab Lumino widget wrapping TLab.
 */
export class TLabShellWidget extends ReactWidget {
  private signal: ISignal<this, void>;

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

    this.signal = new Signal(this);
  }

  render(): JSX.Element {
    return (
      <UseSignal signal={this.signal}>
        {() => (
          <TLab app={this.app} manager={this.manager} store={this.store} />
        )}
      </UseSignal>
    );
  }
}

function TLab({ app, manager, store }: ITLabWidgetProps) {
  return (
    <div>
      <div>twiinIT Lab</div>
      {[...manager.widgets].map(w => w.component({ app, manager, store }))}
    </div>
  );
}
