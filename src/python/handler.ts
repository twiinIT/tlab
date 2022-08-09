// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { Kernel, KernelMessage } from '@jupyterlab/services';
import { IComm } from '@jupyterlab/services/lib/kernel/kernel';
import { PromiseDelegate, UUID } from '@lumino/coreutils';
import { IKernelStoreHandler } from '../store/handler';
import { IJSONPatchOperation } from '../store/models';
import { ITLabStore } from '../store/store';

const TARGET_NAME = 'tlab';

/**
 * Comm msg metadata.
 */
interface ICommMsgMeta {
  method: string;
  reqId?: string;
  uuid?: string;
}

/**
 * Listener for comm messages. Unused.
 */
interface ICommListener {
  check: (msg: KernelMessage.ICommMsgMsg) => boolean;
  handler: (msg: KernelMessage.ICommMsgMsg) => void;
}

/**
 * Registry of comm listeners. Unused.
 */
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

  constructor(
    private store: ITLabStore,
    private kernel: Kernel.IKernelConnection
  ) {
    this.comm = this.kernel.createComm('tlab');
    this.comm.onMsg = this.onCommMsg.bind(this);
    this.initKernel();
  }

  get ready() {
    return this._ready.promise;
  }

  async fetch(name: string, uuid: string) {
    const msg = await this.command('fetch', { name, uuid });
    return msg.content.data;
  }

  sendPatch<T>(uuid: string, patch: IJSONPatchOperation<T>[]): void {
    this.command('patch', patch, uuid, false);
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

  /**
   * Send a command to the kernel.
   * @param method
   * @param payload
   * @param uuid
   * @param withReply
   * @returns Result message.
   */
  private async command(
    method: string,
    payload: any,
    uuid: string | null = null,
    withReply = true
  ) {
    if (!this.comm) throw new Error('no comm');
    const delegate = new PromiseDelegate<KernelMessage.ICommMsgMsg>();
    let reqId: string | null = null;
    if (withReply) {
      reqId = UUID.uuid4();
      this.cmdDelegates.set(reqId, delegate);
      setTimeout(() => {
        delegate.reject(new Error('timeout'));
        this.cmdDelegates.delete(reqId as string);
      }, 10000);
    }
    await this.comm.send(payload, { method, reqId, uuid }).done;
    return delegate.promise;
  }

  /**
   * Kernel event handler.
   * @param msg Message from the kernel.
   */
  private onCommMsg(msg: KernelMessage.ICommMsgMsg) {
    console.log('onCommMsg:', msg);
    const { method, reqId, uuid } = msg.metadata as unknown as ICommMsgMeta;
    if (method === 'reply' && reqId) {
      const promiseDelegate = this.cmdDelegates.get(reqId);
      promiseDelegate?.resolve(msg);
      this.cmdDelegates.delete(reqId);
    } else if (method === 'patch' && uuid) {
      this.store.patch(
        uuid,
        msg.content.data as unknown as IJSONPatchOperation<any>[]
      );
    }
    this.listeners.resolve(msg);
  }
}
