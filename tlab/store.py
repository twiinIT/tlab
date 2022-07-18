# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from typing import TYPE_CHECKING, Any, Callable

if TYPE_CHECKING:
    from ipykernel.comm import Comm
    from IPython import get_ipython

    from .models.model import Model

_handlers = {}


def on(name: str):

    def decorator(func: Callable[['TLabKernelStore', Any], None]):
        _handlers[name] = func
        return func

    return decorator


class TLabKernelStore:

    def __init__(self, target='tlab'):
        self.init_comm(target)
        self.widget_handlers: dict[str, Callable] = {}

    def init_comm(self, target):
        self.shell = get_ipython()
        self.shell.kernel.comm_manager.register_target(target, self.register)

    def register(self, comm: 'Comm', open_msg):
        self.comm = comm
        comm.on_msg(self.on_msg)
        new_meta = dict(name='reply', req_id=open_msg['metadata']['req_id'])
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
            req_id = msg['metadata']['req_id']
            self.comm.send(str(e), dict(name='error', req_id=req_id))

    @on('fetch')
    def get(self, msg):
        var_name = msg['content']['data']['name']
        var: 'Model' = self.shell.user_ns[var_name]
        uuid = msg['content']['data']['uuid']
        req_id = msg['metadata']['req_id']
        var.open(self.comm, uuid, req_id)
        self.widget_handlers[uuid] = var._handle_msg
