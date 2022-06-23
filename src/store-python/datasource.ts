import { Token } from '@lumino/coreutils';
import { IDataModel } from '../store/model';

export interface IPyDataSource {
  id: string;
  script: string;
  provides: IDataModel<any>[];
}

export const ITLabPyDSManager = new Token<ITLabPyDSManager>(
  'twiinit_lab:ITLabPyDSManager'
);

export interface ITLabPyDSManager {
  dataSources: IterableIterator<IPyDataSource>;
  register(ds: IPyDataSource): void;
}

export class TLabPyDSManager implements ITLabPyDSManager {
  private _dataSources: Map<string, IPyDataSource>;

  constructor() {
    this._dataSources = new Map();
  }

  get dataSources(): IterableIterator<IPyDataSource> {
    return this._dataSources.values();
  }

  register(ds: IPyDataSource): void {
    this._dataSources.set(ds.id, ds);
  }
}
