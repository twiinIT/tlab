import { JupyterFrontEnd } from '@jupyterlab/application';
import { Token } from '@lumino/coreutils';
import { TLabStore } from '../store/store';

export const ITLabFront = new Token<ITLabFront>('twiinit_lab:ITLabFront');

export interface ITLabFront {
  widgets: Map<string, ITLabWidget>;
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
  widgets = new Map<string, ITLabWidget>();
}
