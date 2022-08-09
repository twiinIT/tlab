# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from dataclasses import dataclass
from typing import Any, Callable, Generic, TypeVar

import reactivex as rx
from pyportrait import HasTraits

T = TypeVar('T')


@dataclass
class Serializer(Generic[T]):
    deserialize: Callable[[Any], T] = None
    serialize: Callable[[T], Any] = None


class Model(HasTraits):
    """Base class for data models."""
    _modelName: str

    class Config:
        arbitrary_types_allowed = True

    def __init__(self):
        super().__init__()
        self._patch_subject = rx.Subject()
        self._subject.subscribe(self._value_changed)

    def subscribe(self, *args, **kwargs):
        return self._patch_subject.subscribe(*args, **kwargs)

    # TODO: replace w/ operator
    def _value_changed(self, change):
        op = 'replace'
        path = [change['name']]

        value = change['new']
        field = self.__fields__[change['name']]
        serializer = field.field_info.extra.get('serializer', None)
        if serializer is not None:
            serialize = serializer.serialize
            if serialize is not None:
                value = serialize(value)

        self._patch_subject.on_next(dict(op=op, path=path, value=value))

    def dict(self):
        d = dict(_modelName=self._modelName)
        for field in self.__fields__.values():
            value = getattr(self, field.name)
            serializer = field.field_info.extra.get('serializer', None)
            if serializer is not None:
                serialize = serializer.serialize
                if serialize is not None:
                    value = serialize(value)
            d[field.name] = value
        return d
