import { Kernel } from '@jupyterlab/services';
import { IKernelStoreHandler } from '.';

export class PythonKernelStoreHandler implements IKernelStoreHandler {
  constructor(private kernel: Kernel.IKernelConnection) {}
}
