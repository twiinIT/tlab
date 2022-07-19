# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from functools import partial
from inspect import getmembers
from typing import Any, Generic, Type, TypeVar

import reactivex as rx

T = TypeVar('T')


class Value(rx.Subject, Generic[T]):
    __slots__ = ('_value',)

    def __init__(self,
                 typ: Type[T],
                 allow_none: bool = True,
                 default: T = None) -> None:
        super().__init__()
        self.typ = typ
        self.allow_none = allow_none
        self.value = default

    @property
    def value(self) -> T:
        return self._value

    @value.setter
    def value(self, value: T) -> None:
        self._value = self.validate(value)
        self.on_next(self._value)

    def validate(self, value: T) -> T:
        if value is None and not self.allow_none:
            raise ValueError('Value cannot be None')
        if value is not None and not isinstance(value, self.typ):
            raise ValueError(f"Value must be of type {self.typ}")
        return value


class Model(rx.Subject):

    def get_state(self) -> dict[str, Any]:
        state = {}
        for name, value in getmembers(self):
            if isinstance(value, Value):
                state[name] = value.value
        return state

    def on_member_update(self, name: str, value: Any) -> None:
        self.on_next((name, value))

    def __setattr__(self, __name: str, __value: Any) -> None:
        super().__setattr__(__name, __value)
        if isinstance(__value, Value):
            __value.subscribe(on_next=partial(self.on_member_update, __name))


class Person(Model):

    def __init__(self) -> None:
        super().__init__()
        self.name = Value(str)
        self.age = Value(int)
        self.is_student = Value(bool)
        self.subscribe(on_next=print)
