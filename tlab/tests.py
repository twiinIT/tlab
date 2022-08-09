# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from pyportrait import Trait

from tlab.models import Model


class Person(Model):
    _modelName = 'Person'
    name: str = Trait('John').tag(observable=True)
    age: int = Trait(40).tag(observable=True)
    isStudent: bool = Trait(False).tag(observable=True)


pers = Person()
pers.subscribe(print)
