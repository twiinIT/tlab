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
 * Python kernel store handler implementation.
 */
export class PythonKernelStoreHandler implements IKernelStoreHandler {
  static handlers = new Map<string, EventHandler>();

  private _ready = new PromiseDelegate<void>();
  private cmdPromises = new Map<
    string,
    PromiseDelegate<KernelMessage.ICommMsgMsg>
  >();
  private comm;

  constructor(
    private kernel: Kernel.IKernelConnection,
    private dsManager: ITLabPyDSManager
  ) {
    this.comm = this.kernel.createComm('tlab');
    this.comm.onMsg = this.onCommMsg.bind(this);
    this.initKernel();
  }

  get ready() {
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
    const dss = JSON.stringify([...this.dsManager.dataSources.values()]);
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
  async command(name: string, data: any) {
    const req_id = UUID.uuid4();
    const promise = new PromiseDelegate<KernelMessage.ICommMsgMsg>();
    this.cmdPromises.set(req_id, promise);
    const meta: ICommMsgMeta = { name, req_id };
    await this.comm.send(data, meta as unknown as JSONObject).done;
    return promise.promise;
  }

  async fetch(name: string) {
    const data = await this.command('get', name);
    return data.content.data as { data: any; modelId: string };
  }
}
