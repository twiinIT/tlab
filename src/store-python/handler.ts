import { Kernel, KernelMessage } from '@jupyterlab/services';
import { JSONValue, PromiseDelegate } from '@lumino/coreutils';
import { IKernelStoreHandler } from '../store/handler';

export class PythonKernelStoreHandler implements IKernelStoreHandler {
  private static handlers: Map<string, (v: JSONValue) => void> = new Map();
  private _ready: PromiseDelegate<void>;
  private comm: Kernel.IComm;

  constructor(private kernel: Kernel.IKernelConnection) {
    this._ready = new PromiseDelegate();
    this.comm = this.kernel.createComm('twiinit_lab');
    this.comm.onMsg = this.onCommMsg.bind(this);
    this.initComm();
  }

  get ready(): Promise<void> {
    return this._ready.promise;
  }

  /**
   * https://jupyter-notebook.readthedocs.io/en/stable/comms.html#opening-a-comm-from-the-frontend
   */
  private async initComm() {
    // register the target in the kernel
    await this.kernel.requestExecute({ code }).done;
    // open the comm from the front
    await this.comm.open({ name: 'syn' }).done;
  }

  /**
   * Kernel event handler.
   * @param msg message from the kernel
   */
  private onCommMsg(msg: KernelMessage.ICommMsgMsg) {
    console.log(msg);
    const name = msg.content.data.name?.toString();
    const value = msg.content.data.value;
    if (name) {
      const handler = PythonKernelStoreHandler.handlers.get(name);
      handler?.call(this, value);
    }
  }

  /**
   * Add a handler for an eventName.
   * @param name name of the event
   * @returns decorator
   */
  private static on(name: string) {
    return (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) => {
      this.handlers.set(name, descriptor.value);
    };
  }

  @PythonKernelStoreHandler.on('ack')
  private onAck(value: JSONValue) {
    this._ready.resolve();
  }

  @PythonKernelStoreHandler.on('error')
  private onError(value: JSONValue) {
    throw new Error(value?.toString());
  }
}

const code = `
def target_func(comm, open_msg):
    handlers = {}

    @comm.on_msg
    def _recv(msg):
        name = msg['content']['data'].get('name', None)
        value = msg['content']['data'].get('value', None)
        handler = handlers.get(name, None)
        if handler is None:
            print('No handler for:', msg)
            return
        try:
            handler(value)
        except Exception as e:
            comm.send({'name': 'error', 'value': str(e)})

    def on(name):
        def decorator(func):
            handlers[name] = func
            return func
        return decorator

    if open_msg['content']['data'].get('name', None) == 'syn':
        comm.send({'name': 'ack'})


get_ipython().kernel.comm_manager.register_target('twiinit_lab', target_func)
`;
