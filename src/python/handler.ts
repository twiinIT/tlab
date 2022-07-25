// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { Kernel, KernelMessage } from '@jupyterlab/services';
import { IComm } from '@jupyterlab/services/lib/kernel/kernel';
import { PromiseDelegate, UUID } from '@lumino/coreutils';
import { IKernelStoreHandler } from '../store/handler';

const TARGET_NAME = 'tlab';

interface ICommMsgMeta {
  method: string;
  reqId?: string;
  uuid?: string;
}

interface ICommListener {
  check: (msg: KernelMessage.ICommMsgMsg) => boolean;
  handler: (msg: KernelMessage.ICommMsgMsg) => void;
}

class CommListeners {
  private map = new Map<string, ICommListener>();

  add(
    check: (msg: KernelMessage.ICommMsgMsg) => boolean,
    handler: (msg: KernelMessage.ICommMsgMsg) => void
  ) {
    const uuid = UUID.uuid4();
    this.map.set(uuid, { check, handler });
    return uuid;
  }

  remove(uuid: string) {
    this.map.delete(uuid);
  }

  resolve(msg: KernelMessage.ICommMsgMsg) {
    for (const listener of this.map.values()) {
      if (listener.check(msg)) listener.handler(msg);
    }
  }
}

/**
 * Python kernel store handler implementation.
 */
export class PythonKernelStoreHandler implements IKernelStoreHandler {
  private _ready = new PromiseDelegate<any>();
  private comm?: IComm;
  private listeners = new CommListeners();
  private cmdDelegates = new Map<
    string,
    PromiseDelegate<KernelMessage.ICommMsgMsg>
  >();

  constructor(private kernel: Kernel.IKernelConnection) {
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
    const code = `
    from tlab.store import TLabKernelStore
    __tlab_kernel_store = TLabKernelStore('${TARGET_NAME}')
      `;
    await this.kernel.requestExecute({ code }).done;
    const reqId = UUID.uuid4();
    this.cmdDelegates.set(reqId, this._ready);
    this.comm?.open(undefined, { method: 'open', reqId });
  }

  async fetch(name: string, uuid: string) {
    // const listenerId = this.listeners.add(
    //   msg => msg.metadata.uuid === uuid && msg.metadata.method === 'update',
    //   msg => {
    //     const obj = this.objects.get(uuid);
    //     if (obj) {
    //       const newState = msg.content.data as any;
    //       obj.data = { ...obj.data, ...newState };
    //       this.signal.emit(obj);
    //     } else {
    //       this.listeners.remove(listenerId);
    //     }
    //   }
    // );
    const msg = await this.command('fetch', { name, uuid });
    return msg.content.data;
  }

  /**
   * Send a command to the kernel.
   * @param method
   * @param payload
   * @returns Result message.
   */
  private async command(method: string, payload: any) {
    if (!this.comm) throw new Error('no comm');
    const delegate = new PromiseDelegate<KernelMessage.ICommMsgMsg>();
    const reqId = UUID.uuid4();
    this.cmdDelegates.set(reqId, delegate);
    setTimeout(() => {
      delegate.reject(new Error('timeout'));
      this.cmdDelegates.delete(reqId);
    }, 10000);
    await this.comm.send(payload, { method, reqId }).done;
    return delegate.promise;
  }

  /**
   * Kernel event handler.
   * @param msg Message from the kernel.
   */
  private onCommMsg(msg: KernelMessage.ICommMsgMsg) {
    console.log('onCommMsg:', msg);
    const { method, reqId } = msg.metadata as any as ICommMsgMeta;
    if (method === 'reply' && reqId) {
      const promiseDelegate = this.cmdDelegates.get(reqId);
      promiseDelegate?.resolve(msg);
      this.cmdDelegates.delete(reqId);
    }
    this.listeners.resolve(msg);
  }
}
