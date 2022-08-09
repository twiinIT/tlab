# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from typing import Any

import numpy as np
from pyportrait import Trait

from tlab.models import Model, Serializer


class ValueModel(Model):
    _modelName: str
    value: Any


class BooleanModel(ValueModel):
    _modelName = "Boolean"
    value: bool = Trait(False).tag(observable=True)


class NumberModel(ValueModel):
    _modelName = "Number"
    value: float = Trait(0.0).tag(observable=True)


class StringModel(ValueModel):
    _modelName = "String"
    value: str = Trait("").tag(observable=True)


class ArrayModel(ValueModel):
    _modelName = "Array"
    value: list = Trait([]).tag(observable=True)


class NDArrayModel(ValueModel):
    _modelName = "NDArray"
    value: np.ndarray = Trait(np.array([])).tag(
        observable=True,
        serializer=Serializer(
            deserialize=lambda v: np.reshape(v['data'], v['shape']),
            serialize=lambda v: dict(data=v.tolist(), shape=v.shape)))
