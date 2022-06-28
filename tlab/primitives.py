# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

import json
from types import NoneType

from tlab.datasource import DataSource


class NullDataSource(DataSource):
    input_classes: tuple[type] = (NoneType,)

    @classmethod
    def serialize(cls, value):
        return value, 'null'


class BooleanDataSource(DataSource):
    input_classes: tuple[type] = (bool,)

    @classmethod
    def serialize(cls, value):
        return value, 'boolean'


class NumberDataSource(DataSource):
    input_classes: tuple[type] = (int, float)

    @classmethod
    def serialize(cls, value):
        return value, 'number'


class StringDataSource(DataSource):
    input_classes: tuple[type] = (str,)

    @classmethod
    def serialize(cls, value):
        return json.dumps(value), 'string'
