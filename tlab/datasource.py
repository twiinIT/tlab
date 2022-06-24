# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from abc import ABC, abstractmethod
from typing import Any


class DataSource(ABC):
    input_classes: tuple[type] = ()

    @classmethod
    @abstractmethod
    def serialize(cls, obj) -> tuple[Any, str]:
        """obj -> (serialized object, front model_id)"""
        pass
