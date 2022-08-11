# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from contextlib import suppress
from dataclasses import dataclass
from functools import partial
from typing import Any, Callable, Generic, TypeVar

import reactivex as rx
from pydantic import BaseModel
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
        # FIXME: validate_assignment should be True
        validate_assignment = False
        arbitrary_types_allowed = True

    def p_wrapper(self, name, p):
        p['path'] = [name, *p['path']]
        self._patch_subject.on_next(p)

    def __init__(self):
        super().__init__()
        self._patch_subject = rx.Subject()
        self._subject.subscribe(self._emit_patch)

        for name, trait in self.__fields__.items():
            if trait.field_info.extra.get("observable", False):
                val = getattr(self, name)
                if isinstance(val, Model):
                    val.subscribe(partial(self.p_wrapper, name))

    def subscribe(self, *args, **kwargs):
        return self._patch_subject.subscribe(*args, **kwargs)

    # TODO: replace w/ operator
    def _emit_patch(self, change):
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

    def on_message(self, msg):
        pass

    def dict(self):
        d = dict(_modelName=self._modelName)
        for field in self.__fields__.values():
            value = getattr(self, field.name)
            serializer = field.field_info.extra.get('serializer', None)
            if serializer is not None and serializer.serialize is not None:
                value = serializer.serialize(value)
            else:
                with suppress(Exception):
                    value = value.dict()
            d[field.name] = value
        return d

    def __setattr__(self, name, value):
        try:
            old = super().__getattribute__(name)
            BaseModel.__setattr__(self, name, value)

            if isinstance(value, Model):
                value.subscribe(partial(self.p_wrapper, name))

            with suppress(Exception):
                old = old.dict()
            with suppress(Exception):
                value = value.dict()
            self._notify(name, old, value)
        except AttributeError:
            object.__setattr__(self, name, value)
