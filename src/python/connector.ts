// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { KernelStoreConnector } from '../store/manager';

export const connector: KernelStoreConnector = async (kernel, targetName) => {
  const code = `
  from tlab.store import TLabKernelStore
  __tlab_kernel_store = TLabKernelStore('${targetName}')
    `;
  await kernel.requestExecute({ code }).done;
};
