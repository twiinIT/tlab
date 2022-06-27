# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

import pandas as pd

from tlab.datasource import DataSource

foodf = pd.DataFrame(
    {
        "A": ["A0", "A1", "A2", "A3"],
        "B": ["B0", "B1", "B2", "B3"],
        "C": ["C0", "C1", "C2", "C3"],
        "D": ["D0", "D1", "D2", "D3"],
    },
    index=['zero', 'one', 'two', 'three'],
)


class DanfoDataSource(DataSource):
    input_classes: tuple[type] = (pd.DataFrame,)

    @classmethod
    def serialize(cls, df: pd.DataFrame):
        return {
            'records': df.to_json(orient='records'),
            'index': list(df.index)
        }, 'danfo_df'
