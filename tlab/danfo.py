# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

import pandas as pd
import numpy as np

df = pd.DataFrame({
    "A": 1.0,
    "B": pd.Timestamp("20130102"),
    "C": pd.Series(1, index=list(range(4)), dtype="float32"),
    "D": np.array([3] * 4, dtype="int32"),
    "E": pd.Categorical(["test", "train", "test", "train"]),
    "F": "foo",
})
