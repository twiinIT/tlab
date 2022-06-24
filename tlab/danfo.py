# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

import pandas as pd
import numpy as np

df = pd.DataFrame(
    {
        "A": ["A0", "A1", "A2", "A3"],
        "B": ["B0", "B1", "B2", "B3"],
        "C": ["C0", "C1", "C2", "C3"],
        "D": ["D0", "D1", "D2", "D3"],
    },
    index=['zero', 'one', 'two', 'three'],
)