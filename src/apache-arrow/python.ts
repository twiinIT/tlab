import { IPyDataSource } from '../store-python/datasource';
import { arrowModel } from './model';

export const arrowPythonDS: IPyDataSource = {
  id: 'apache_arrow',
  script: '',
  provides: [arrowModel]
};
