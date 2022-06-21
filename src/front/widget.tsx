import { ReactWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { listIcon } from '@jupyterlab/ui-components';
import React from 'react';
import { UUID } from '@lumino/coreutils';
import { ITLabFront } from '.';

export class TLabShellWidget extends ReactWidget {
  constructor(private front: ITLabFront, options?: Widget.IOptions) {
    super(options);
    this.id = UUID.uuid4();
    this.title.label = 'twiinIT Lab';
    this.title.closable = true;
    this.title.icon = listIcon;
  }

  render(): JSX.Element {
    return <TwiinITLab />;
  }
}

function TwiinITLab() {
  return <div>twiinIT Lab</div>;
}
