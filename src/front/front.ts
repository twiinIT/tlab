// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { Token } from '@lumino/coreutils';
import { TLabStore } from '../store/store';

export const ITLabFront = new Token<ITLabFront>('tlab:ITLabFront');

export interface ITLabFront {
  widgets: IterableIterator<ITLabWidget>;
  registerWidget(widget: ITLabWidget): void;
}

export interface ITLabWidget {
  id: string;
  name: string;
  component: (props: ITLabWidgetProps) => JSX.Element;
}

export interface ITLabWidgetProps {
  app: JupyterFrontEnd;
  front: ITLabFront;
  store: TLabStore;
}

export class TLabFront implements ITLabFront {
  private _widgets: Map<string, ITLabWidget>;

  constructor() {
    this._widgets = new Map();
  }

  get widgets(): IterableIterator<ITLabWidget> {
    return this._widgets.values();
  }

  registerWidget(widget: ITLabWidget): void {
    this._widgets.set(widget.id, widget);
  }
}
