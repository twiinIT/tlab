// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

export interface IDataModel<T> {
  id: string;
  name: string;
  deserialize: (obj: any) => T | Promise<T>;
}
