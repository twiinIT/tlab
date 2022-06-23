from typing import TYPE_CHECKING, Any, Callable

if TYPE_CHECKING:
    from ipykernel.comm import Comm
    from IPython import get_ipython


class TLabCommHandler:
    _handlers = {}

    def __init__(self, target='twiinit_lab'):
        get_ipython().kernel.comm_manager.register_target(target, self.register)

    def register(self, comm: 'Comm', open_msg):
        self.comm = comm
        comm.on_msg(self.on_msg)
        if open_msg['content']['data'].get('name', None) == 'syn':
            comm.send({'name': 'ack'})

    def on_msg(self, msg):
        name = msg['content']['data'].get('name', None)
        value = msg['content']['data'].get('value', None)
        handler = self._handlers.get(name, None)
        if handler is None:
            print('No handler for:', msg)
            return
        try:
            handler(value)
        except Exception as e:
            self.comm.send({'name': 'error', 'value': str(e)})

    @classmethod
    def on(cls, name: str):

        def decorator(func: Callable[[cls, Any], None]):
            cls._handlers[name] = func
            return func

        return decorator
