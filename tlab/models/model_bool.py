# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from traitlets import Bool, Unicode

from .model import Model


class Bool(Model):
    """A base class for creating widgets that represent booleans."""
    _model_name = Unicode('BoolModel').tag(sync=True)

    value = Bool(False, help="Bool value").tag(sync=True)
