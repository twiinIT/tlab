# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from typing import TYPE_CHECKING, Any, Callable

from .models.model import Widget

if TYPE_CHECKING:
    from ipykernel.comm import Comm
    from IPython import get_ipython

_handlers = {}


def on(name: str):

    def decorator(func: Callable[['TLabKernelStore', Any], None]):
        _handlers[name] = func
        return func

    return decorator


class TLabKernelStore:

    def __init__(self, target='tlab'):
        self.init_comm(target)

    def init_comm(self, target):
        self.shell = get_ipython()
        self.shell.kernel.comm_manager.register_target(target, self.register)

    def register(self, comm: 'Comm', open_msg):
        self.comm = comm
        comm.on_msg(self.on_msg)
        new_meta = dict(name='reply',)
        comm.send(None, new_meta)

    def on_msg(self, msg):
        handler = _handlers[msg['metadata']['action']]
        try:
            handler(self, msg)
        except Exception as e:
            new_meta = dict(new_meta, req_id=msg['metadata']['req_id'])
            self.comm.send(str(e), new_meta)

    @on('get')
    def get(self, msg):
        var_name = msg['content']['data']['name']
        uuid = msg['content']['data']['uuid']
        var: Widget = self.shell.user_ns[var_name]
        var.open(self.comm, uuid)
