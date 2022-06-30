// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { Kernel, KernelMessage } from '@jupyterlab/services';
import { JSONObject, PromiseDelegate, UUID } from '@lumino/coreutils';
import { IKernelStoreHandler } from '../store/handler';
import { ITLabPyDSManager } from './datasource';

/**
 * Comm message metadata format.
 */
interface ICommMsgMeta {
  /**
   * Event name.
   */
  name: string;

  /**
   * Request id.
   */
  req_id?: string;
}

type EventHandler = (v: KernelMessage.ICommMsgMsg) => void;

/**
 * Add a handler for an eventName.
 * @param name Name of the event.
 * @returns Decorator
 */
function on(name: string): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    PythonKernelStoreHandler.handlers.set(name, descriptor.value);
  };
}

/**
 * Python kernel store handler implementation.
 */
export class PythonKernelStoreHandler implements IKernelStoreHandler {
  static handlers: Map<string, EventHandler> = new Map();
  private _ready: PromiseDelegate<void>;
  private comm: Kernel.IComm;
  private cmdPromises: Map<string, PromiseDelegate<KernelMessage.ICommMsgMsg>>;

  constructor(
    private kernel: Kernel.IKernelConnection,
    private dsManager: ITLabPyDSManager
  ) {
    this._ready = new PromiseDelegate();
    this.comm = this.kernel.createComm('tlab');
    this.comm.onMsg = this.onCommMsg.bind(this);
    this.cmdPromises = new Map();
    this.initKernel();
  }

  get ready(): Promise<void> {
    return this._ready.promise;
  }

  /**
   * https://jupyter-notebook.readthedocs.io/en/stable/comms.html#opening-a-comm-from-the-frontend
   */
  private async initKernel() {
    // create KernelStore and register the comm target in the kernel
    const code = `
    from tlab.store import TLabKernelStore
    __tlab_kernel_store = TLabKernelStore('tlab')
    `;
    await this.kernel.requestExecute({ code }).done;

    // ready
    const req_id = UUID.uuid4();
    const metadata = { name: 'syn', req_id };
    const promise = new PromiseDelegate<KernelMessage.ICommMsgMsg>();
    promise.promise.then(() => this._ready.resolve());
    this.cmdPromises.set(req_id, promise);

    // open the comm from the front
    const dss = JSON.stringify([...this.dsManager.dataSources]);
    this.comm.open(dss, metadata);
    return this.ready;
  }

  /**
   * Kernel event handler.
   * @param msg Message from the kernel.
   */
  private onCommMsg(msg: KernelMessage.ICommMsgMsg) {
    console.log(msg);
    const { name, req_id } = msg.metadata as unknown as ICommMsgMeta;
    switch (name) {
      case 'reply': {
        if (!req_id) {
          throw new Error('no req_id');
        }
        const promise = this.cmdPromises.get(req_id);
        promise?.resolve(msg);
        this.cmdPromises.delete(req_id);
        break;
      }

      case 'error': {
        if (req_id) {
          const promise = this.cmdPromises.get(req_id);
          promise?.reject(msg);
          this.cmdPromises.delete(req_id);
        } else {
          throw new Error(msg.content.data.toString());
        }
        break;
      }

      default: {
        const handler = PythonKernelStoreHandler.handlers.get(name);
        handler?.call(this, msg);
        break;
      }
    }
  }

  /**
   * Send command to comm and wait for reply. Use uuid and promises.
   * @param name Event name.
   * @param data Payload to send.
   * @returns Promise of the reply.
   */
  async command(name: string, data: any): Promise<KernelMessage.ICommMsgMsg> {
    const req_id = UUID.uuid4();
    const promise = new PromiseDelegate<KernelMessage.ICommMsgMsg>();
    this.cmdPromises.set(req_id, promise);
    const meta: ICommMsgMeta = { name, req_id };
    await this.comm.send(data, meta as unknown as JSONObject).done;
    return promise.promise;
  }

  async fetch(name: string): Promise<{ obj: any; modelId: string }> {
    const data = await this.command('get', name);
    return data.content.data as { obj: any; modelId: string };
  }

  async wrap(name: string, modelId: string, parsed: any): Promise<any> {
    let wrapped;
    switch (modelId) {
      // Primitives
      case 'null':
      case 'boolean':
      case 'number':
      case 'string':
        wrapped = new Proxy(
          { target: parsed },
          new PrimitiveProxyHandler(name, this)
        );
        break;

      default:
        wrapped = new Proxy(parsed, new BasicProxyHandler(name, this));
        break;
    }
    return wrapped;
  }
}

/**
 * Proxy handler for primitive types.
 */
class PrimitiveProxyHandler implements ProxyHandler<any> {
  constructor(
    private name: string,
    private handler: PythonKernelStoreHandler
  ) {}

  get(target: any, p: string | symbol, receiver: any): any {
    const _target = Reflect.get(target, 'target');
    const value = _target[p];
    return typeof value === 'function' ? value.bind(_target) : value;
  }
}

/**
 * Basic proxy handler.
 */
class BasicProxyHandler implements ProxyHandler<any> {
  constructor(
    private name: string,
    private handler: PythonKernelStoreHandler
  ) {}

  set(target: any, p: string | symbol, value: any, receiver: any): boolean {
    return Reflect.set(target, p, value, receiver);
  }
}
