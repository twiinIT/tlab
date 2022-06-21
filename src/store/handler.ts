import { Kernel } from '@jupyterlab/services';

export interface IKernelStoreHandler {}

export class PythonKernelStoreHandler implements IKernelStoreHandler {
  constructor(private kernel: Kernel.IKernelConnection) {}
}
