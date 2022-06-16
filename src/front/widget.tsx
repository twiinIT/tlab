import { ReactWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { listIcon } from '@jupyterlab/ui-components';
import React from 'react';
import { UUID } from '@lumino/coreutils';
import { ITwiinITLabFront } from '.';
import { ITwiinITLabStoreInstance } from '../store';
import { Message } from '@lumino/messaging';

export class TwiinITLabWidget extends ReactWidget {
  private storeInstance?: ITwiinITLabStoreInstance;

  constructor(private front: ITwiinITLabFront, options?: Widget.IOptions) {
    super(options);
    this.id = UUID.uuid4();
    this.title.label = 'twiinIT Lab';
    this.title.closable = true;
    this.title.icon = listIcon;

    this.storeInstance = this.front.store?.newInstance(this.id);
    this.storeInstance?.connect();
  }

  protected onCloseRequest(msg: Message): void {
    super.onCloseRequest(msg);
    this.storeInstance?.dispose();
  }

  render(): JSX.Element {
    return <TwiinITLab />;
  }
}

function TwiinITLab() {
  return <div>twiinIT Lab</div>;
}
