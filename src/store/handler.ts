export interface IKernelStoreHandler {
  ready: Promise<void>;
  request(name: string): any;
}
