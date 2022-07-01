// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

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
  widgets: Map<string, ITLabWidget>;

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
  manager: ITLabFrontManager;
  store: TLabStore;
}

/**
 * ITLabFrontManager implementation.
 */
export class TLabFrontManager implements ITLabFrontManager {
  widgets: Map<string, ITLabWidget>;

  constructor() {
    this.widgets = new Map();
  }

  registerWidget(widget: ITLabWidget): void {
    this.widgets.set(widget.id, widget);
  }
}
