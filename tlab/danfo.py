# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

import pandas as pd

from tlab.datasource import DataSource


class DanfoDataSource(DataSource):
    input_classes: tuple[type] = (pd.DataFrame,)

    @classmethod
    def serialize(cls, df: pd.DataFrame):
        return {
            'records': df.to_json(orient='records'),
            'index': list(df.index)
        }, 'danfo_df'
