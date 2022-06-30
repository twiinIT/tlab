# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

import importlib
import json
from dataclasses import asdict, dataclass
from typing import TYPE_CHECKING, Any, Callable, Optional

if TYPE_CHECKING:
    from ipykernel.comm import Comm
    from IPython import get_ipython

    from tlab.datasource import DataSource


# Pydantic?
@dataclass
class CommMsgMeta:
    name: str
    req_id: Optional[str] = None


_handlers = {}


def on(name: str):

    def decorator(func: Callable[['TLabKernelStore', Any], None]):
        _handlers[name] = func
        return func

    return decorator


class TLabKernelStore:
    datasources: dict[type, 'DataSource'] = {}

    def __init__(self, target='tlab'):
        self.init_comm(target)
        self.store: dict[str, Any] = {}

    def init_comm(self, target):
        self.shell = get_ipython()
        self.shell.kernel.comm_manager.register_target(target, self.register)

    def register(self, comm: 'Comm', open_msg):
        self.comm = comm
        comm.on_msg(self.on_msg)
        meta = CommMsgMeta(**open_msg['metadata'])
        if meta.name == 'syn':
            dss = json.loads(open_msg['content']['data'])
            for ds in dss:
                module = importlib.import_module(ds['module'])
                ds_cls: 'DataSource' = getattr(module, ds['class'])
                for cls in ds_cls.input_classes:
                    self.datasources[cls] = ds_cls
            new_meta = CommMsgMeta(name='reply', req_id=meta.req_id)
            comm.send(None, asdict(new_meta))

    def on_msg(self, msg):
        meta = CommMsgMeta(**msg['metadata'])
        handler = _handlers[meta.name]
        try:
            handler(self, msg)
        except Exception as e:
            new_meta = CommMsgMeta(name='error', req_id=meta.req_id)
            self.comm.send(str(e), asdict(new_meta))

    @on('get')
    def get(self, msg):
        var_name = msg['content']['data']
        var = self.shell.user_ns[var_name]
        self.store[var_name] = var
        ds = self.datasources[type(var)]
        obj, model_id = ds.serialize(var)
        meta = CommMsgMeta(**msg['metadata'])
        new_meta = CommMsgMeta(name='reply', req_id=meta.req_id)
        self.comm.send({'obj': obj, 'modelId': model_id}, asdict(new_meta))
