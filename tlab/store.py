# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from functools import partial
from typing import TYPE_CHECKING, Any, Callable

import reactivex as rx

from .models import Model, Value

if TYPE_CHECKING:
    from ipykernel.comm import Comm
    from IPython import get_ipython

_handlers = {}


def on(name: str):

    def decorator(func: Callable[['TLabKernelStore', Any], None]):
        _handlers[name] = func
        return func

    return decorator


class TLabKernelStore(rx.Subject):

    def __init__(self, target='tlab'):
        self.init_comm(target)
        self.widget_handlers: dict[str, Callable] = {}

    def init_comm(self, target):
        self.shell = get_ipython()
        self.shell.kernel.comm_manager.register_target(target, self.register)

    def register(self, comm: 'Comm', open_msg):
        self.comm = comm
        comm.on_msg(self.on_msg)
        new_meta = dict(method='reply', reqId=open_msg['metadata']['reqId'])
        comm.send(None, new_meta)

    def on_msg(self, msg):
        try:
            uuid = msg['metadata'].get('uuid', None)
            if uuid is not None:
                self.widget_handlers[uuid](msg)
                return

            method = msg['metadata']['method']
            if method in _handlers:
                _handlers[method](self, msg)
                return
        except Exception as e:
            reqId = msg['metadata']['reqId']
            self.comm.send(str(e), dict(method='error', reqId=reqId))

    @on('fetch')
    def get(self, msg):
        var_name = msg['content']['data']['name']
        var: Model | Value = self.shell.user_ns[var_name]
        uuid = msg['content']['data']['uuid']
        reqId = msg['metadata']['reqId']
        state = var.value if isinstance(var, Value) else var.get_state()
        self.comm.send(state, dict(method='reply', reqId=reqId))
        var.subscribe(on_next=partial(self.on_model_update, uuid))

    def on_model_update(self, uuid, value):
        self.comm.send(dict([value]), dict(method='update', uuid=uuid))
