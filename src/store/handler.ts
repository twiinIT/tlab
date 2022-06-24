// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

export interface IKernelStoreHandler {
  ready: Promise<void>;
  fetch(name: string): Promise<{ obj: any; modelId: string }>;
}
