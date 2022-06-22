import { Kernel, KernelMessage } from '@jupyterlab/services';
import { IKernelStoreHandler } from '../store/handler';
import { PromiseDelegate } from '@lumino/coreutils';

const code = `
def target_func(comm, open_msg):
    handlers = {}

    def on(name):
        def coro(func):
            handlers[name] = func
            return func
        return coro

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

    if open_msg['content']['data'].get('name', None) == 'syn':
        comm.send({'name': 'ack'})


get_ipython().kernel.comm_manager.register_target('twiinit_lab', target_func)
`;

export class PythonKernelStoreHandler implements IKernelStoreHandler {
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

  private onCommMsg(msg: KernelMessage.ICommMsgMsg) {
    console.log(msg);
    const name = msg.content.data.name;
    const value = msg.content.data.value;
    switch (name) {
      case 'ack':
        this._ready.resolve();
        break;

      case 'error':
        throw new Error(value?.toString());

      default:
        break;
    }
  }
}
