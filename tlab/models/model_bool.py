# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from traitlets import Bool, Unicode

from .model import register
from .model_core import CoreWidget
from .model_value import ValueWidget


@register
class Bool(ValueWidget, CoreWidget):
    """A base class for creating widgets that represent booleans."""
    value = Bool(False, help="Bool value").tag(sync=True)

    def __init__(self, value=None, **kwargs):
        if value is not None:
            kwargs['value'] = value
        super().__init__(**kwargs)

    _model_name = Unicode('BoolModel').tag(sync=True)
