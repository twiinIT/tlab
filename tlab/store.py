# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from functools import partial
from importlib import import_module
from typing import TYPE_CHECKING, Any, Callable, Dict

import reactivex as rx

if TYPE_CHECKING:
    from ipykernel.comm import Comm
    from IPython import get_ipython

    from .models import Model

_handlers = {}


def on(name: str):
    """
    Handler decorator for comm events.
    TODO: Something cleaner.
    """

    def decorator(func: Callable[['TLabKernelStore', Any], None]):
        _handlers[name] = func
        return func

    return decorator


class TLabKernelStore(rx.Subject):
    """Python kernel store implementation."""

    def __init__(self, target='tlab'):
        self._init_comm(target)
        self.classes: Dict[str, (str, str)] = {}
        self.models: Dict[str, Model] = {}

    def _init_comm(self, target):
        """Initialize the comm."""
        self.shell = get_ipython()
        self.shell.kernel.comm_manager.register_target(target, self._register)

    def _register(self, comm: 'Comm', open_msg):
        """When a comm is opened from the frontend."""
        self.comm = comm
        comm.on_msg(self._on_msg)

        # register model classes
        msg_data = open_msg['content']['data']
        for model_name, (module_path, model_class) in msg_data:
            self.classes[model_name] = (module_path, model_class)

        new_meta = dict(method='reply', reqId=open_msg['metadata']['reqId'])
        comm.send(msg_data, new_meta)

    def _on_msg(self, msg):
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
        # get model
        var_name = msg['content']['data']['name']
        # TODO: replace self.shell.user_ns with ??
        var: 'Model' = self.shell.user_ns[var_name]

        # get metadata
        uuid = msg['content']['data']['uuid']
        reqId = msg['metadata']['reqId']

        # serialize and send
        state = var.dict()
        self.comm.send(state, dict(method='reply', reqId=reqId))

        # subscribe to changes
        var.subscribe(on_next=partial(self.on_model_patch, uuid))
        self.models[uuid] = var

    def on_model_patch(self, uuid, value):
        self.comm.send([value], dict(method='patch', uuid=uuid))

    @on('patch')
    def patch(self, msg):
        """Apply a patch to a model."""
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

            field = parent.__fields__[path[-1]]
            serializer = field.field_info.extra.get('serializer', None)
            if serializer is not None:
                deserialize = serializer.deserialize
                if deserialize is not None:
                    value = deserialize(value)

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

    @on('add')
    def add(self, msg):
        """Deserialize a model and add it to the namespace."""
        uuid = msg['metadata']['uuid']
        name = msg['content']['data']['name']
        data = msg['content']['data']['data']
        parsed = self.parse(data)
        # TODO: replace self.shell.user_ns with ??
        self.shell.user_ns[name] = parsed
        self.models[uuid] = parsed
        self.comm.send(None, dict(method='reply',
                                  reqId=msg['metadata']['reqId']))

    def parse(self, obj: Dict):
        # get model class
        model_cls = self.get_model(obj['_modelName'])
        model = model_cls()
        # iterate on items
        for key, val in obj.items():
            if key == '_modelName':
                continue
            # if val is a serialized sub-model, deserialize it
            if isinstance(val, dict) and '_modelName' in val:
                val = self.parse(val)
            setattr(model, key, val)
        return model

    def get_model(self, model_name: str):
        module_path, model_cls = self.classes[model_name]
        module = import_module(module_path)
        return getattr(module, model_cls)
