from dataclasses import asdict, dataclass
from typing import TYPE_CHECKING, Any, Callable, Literal, Optional

from .arrow import data as testdata

if TYPE_CHECKING:
    from ipykernel.comm import Comm
    from IPython import get_ipython


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

    def __init__(self, target='twiinit_lab'):
        self.init_comm(target)

    def init_comm(self, target):
        get_ipython().kernel.comm_manager.register_target(target, self.register)

    def register(self, comm: 'Comm', open_msg):
        self.comm = comm
        comm.on_msg(self.on_msg)
        meta = CommMsgMeta(**open_msg['metadata'])
        if meta.name == 'syn':
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

    @on('request')
    def request(self, msg):
        data = testdata
        meta = CommMsgMeta(**msg['metadata'])
        new_meta = CommMsgMeta(name='reply', req_id=meta.req_id)
        self.comm.send(data, asdict(new_meta))
