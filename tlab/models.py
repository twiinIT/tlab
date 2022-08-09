# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

import reactivex as rx
from pyportrait import HasTraits


class Model(HasTraits):
    _modelName: str

    def __init__(self):
        super().__init__()
        self._patch_subject = rx.Subject()
        self._subject.subscribe(self._value_changed)

    def subscribe(self, *args, **kwargs):
        return self._patch_subject.subscribe(*args, **kwargs)

    def _value_changed(self, change):
        op = 'replace'
        path = [change['name']]
        value = change['new']
        self._patch_subject.on_next(dict(op=op, path=path, value=value))

    def dict(self):
        d = super().dict(exclude={
            '_subject', '_observables', '_observers', '_patch_subject'
        })
        d['_modelName'] = self._modelName
        return d
