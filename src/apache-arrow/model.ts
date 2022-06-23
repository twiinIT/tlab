import { Table, tableFromIPC } from 'apache-arrow';
import { IDataModel } from '../store/model';

export const arrowModel: IDataModel<Table> = {
  id: 'apache_arrow',
  name: 'Apache Arrow',
  deserialize: tableFromIPC
};
