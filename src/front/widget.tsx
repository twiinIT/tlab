import { JupyterFrontEnd } from '@jupyterlab/application';
import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { ISignal, Signal } from '@lumino/signaling';
import { Widget } from '@lumino/widgets';
import { listIcon } from '@jupyterlab/ui-components';
import React from 'react';
import { UUID } from '@lumino/coreutils';
import { ITLabFront, ITLabWidgetProps } from './front';
import { TLabStore } from '../store/store';

export class TLabShellWidget extends ReactWidget {
  private signal: ISignal<this, void>;

  constructor(
    private app: JupyterFrontEnd,
    private front: ITLabFront,
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
        {() => <TLab app={this.app} front={this.front} store={this.store} />}
      </UseSignal>
    );
  }
}

function TLab({ app, front, store }: ITLabWidgetProps) {
  return (
    <div>
      <div>twiinIT Lab</div>
      {[...front.widgets].map(w => w.component({ app, front, store }))}
    </div>
  );
}
