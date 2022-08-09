// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { Token } from '@lumino/coreutils';
import { ITLabStore } from '../store/store';

export const ITLabFrontManager = new Token<ITLabFrontManager>(
  'tlab:ITLabFrontManager'
);

/**
 * TLab front manager.
 *
 * Saves widgets and provides access to them.
 * TODO: workspace saves.
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
   * React component.
   * @param props
   * @returns React element.
   */
  component: (props: ITLabWidgetProps) => JSX.Element;
}

/**
 * Widget component props.
 */
export interface ITLabWidgetProps {
  manager: ITLabFrontManager;
  store: ITLabStore;
}

/**
 * ITLabFrontManager implementation.
 */
export class TLabFrontManager implements ITLabFrontManager {
  widgets = new Map<string, ITLabWidget>();

  registerWidget(widget: ITLabWidget) {
    this.widgets.set(widget.id, widget);
  }
}
