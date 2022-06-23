export interface IDataModel<T> {
  id: string;
  name: string;
  deserialize: (data: any) => T;
}
