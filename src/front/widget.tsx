import { ReactWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { listIcon } from '@jupyterlab/ui-components';
import React from 'react';
import { ITwiinITLabFront } from '.';

export class TwiinITLabWidget extends ReactWidget {
  constructor(private front: ITwiinITLabFront, options?: Widget.IOptions) {
    super(options);
    this.title.label = 'twiinIT Lab';
    this.title.closable = true;
    this.title.icon = listIcon;

    console.log(this.front);
  }

  render(): JSX.Element {
    return <TwiinITLab />;
  }
}

function TwiinITLab() {
  return <div>twiinIT Lab</div>;
}
