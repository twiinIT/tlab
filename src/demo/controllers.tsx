// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import React from 'react';
import { IControllerProps } from '../widget-controller/manager';
import { BallisticsModel } from './models';

export function CoSAppRunner({ res }: IControllerProps<BallisticsModel>) {
  return (
    <div>
      <button
        onClick={() => {
          res.data.runDrivers();
        }}
      >
        Run Drivers
      </button>
    </div>
  );
}
