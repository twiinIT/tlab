// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { Token } from '@lumino/coreutils';
import { TLabStore } from '../store/store';

export const ITLabFrontManager = new Token<ITLabFrontManager>(
  'tlab:ITLabFrontManager'
);

/**
 * TLab front manager. Registers widgets and provides access to them.
 */
export interface ITLabFrontManager {
  /**
   * Available widgets.
   */
  widgets: IterableIterator<ITLabWidget>;

  /**
   * Register a widget.
   * @param widget
   */
  registerWidget(widget: ITLabWidget): void;
}

/**
 * ITLabFrontManager widget interface.
 */
export interface ITLabWidget {
  /**
   * A human-readable id.
   */
  id: string;

  /**
   * Friendly name.
   */
  name: string;

  /**
   * Widget component factory.
   * @param props
   * @returns React element.
   */
  component: (props: ITLabWidgetProps) => JSX.Element;
}

/**
 * Widget properties.
 */
export interface ITLabWidgetProps {
  app: JupyterFrontEnd;
  manager: ITLabFrontManager;
  store: TLabStore;
}

/**
 * ITLabFrontManager implementation.
 */
export class TLabFrontManager implements ITLabFrontManager {
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
