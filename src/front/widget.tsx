import { JupyterFrontEnd } from '@jupyterlab/application';
import { ReactWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { listIcon } from '@jupyterlab/ui-components';
import React from 'react';
import { UUID } from '@lumino/coreutils';
import { ITLabFront, ITLabWidgetProps } from './front';
import { TLabStore } from '../store/store';

export class TLabShellWidget extends ReactWidget {
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
  }

  render(): JSX.Element {
    return <TLab app={this.app} front={this.front} store={this.store} />;
  }
}

function TLab({ app, front, store }: ITLabWidgetProps) {
  return (
    <div>
      <div>twiinIT Lab</div>
      {[...front.widgets.values()].map(w => w.component({ app, front, store }))}
    </div>
  );
}
