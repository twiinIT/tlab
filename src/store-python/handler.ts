import { Kernel, KernelMessage } from '@jupyterlab/services';
import { JSONValue, PromiseDelegate } from '@lumino/coreutils';
import { IKernelStoreHandler } from '../store/handler';

type EventHandler = (v: JSONValue) => void;

export class PythonKernelStoreHandler implements IKernelStoreHandler {
  private static handlers: Map<string, EventHandler> = new Map();
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
    const code = `
    from twiinit_lab.store import TLabCommHandler
    __tlab_comm_handler = TLabCommHandler('twiinit_lab')
    `;
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
  private static on(name: string): MethodDecorator {
    return (
      target: any,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) => {
      PythonKernelStoreHandler.handlers.set(name, descriptor.value);
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
