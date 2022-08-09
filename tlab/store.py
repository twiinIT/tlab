# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from functools import partial
from typing import TYPE_CHECKING, Any, Callable, Dict

import reactivex as rx

if TYPE_CHECKING:
    from ipykernel.comm import Comm
    from IPython import get_ipython

    from .models import Model

_handlers = {}


def on(name: str):

    def decorator(func: Callable[['TLabKernelStore', Any], None]):
        _handlers[name] = func
        return func

    return decorator


class TLabKernelStore(rx.Subject):

    def __init__(self, target='tlab'):
        self.init_comm(target)
        self.models: Dict[str, Model] = {}

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
        var: 'Model' = self.shell.user_ns[var_name]
        uuid = msg['content']['data']['uuid']
        reqId = msg['metadata']['reqId']
        state = var.dict()
        self.comm.send(state, dict(method='reply', reqId=reqId))
        var.subscribe(on_next=partial(self.on_model_patch, uuid))
        self.models[uuid] = var

    def on_model_patch(self, uuid, value):
        self.comm.send([value], dict(method='patch', uuid=uuid))

    @on('patch')
    def patch(self, msg):
        uuid = msg['metadata']['uuid']
        var = self.models[uuid]
        patches = msg['content']['data']

        for patch in patches:
            op = patch['op']
            path = patch['path']
            value = patch['value']

            parent = var
            for p in path[:-1]:
                parent = parent[p]

            if op in ('add', 'replace'):
                setattr(parent, path[-1], value)
            elif op == 'remove':
                delattr(parent, path[-1])
            elif op == 'move':
                pass
            elif op == 'copy':
                pass
            elif op == 'test':
                pass
            else:
                raise RuntimeError('Unknown patch op: ' + op)
