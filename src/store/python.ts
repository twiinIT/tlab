import { KernelStoreConnector } from './manager';

export const connector: KernelStoreConnector = async (kernel, targetName) => {
  const code = `
    from tlab.store import TLabKernelStore
    __tlab_kernel_store = TLabKernelStore('${targetName}')
      `;
  await kernel.requestExecute({ code }).done;
};
