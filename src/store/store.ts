// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { SessionContext, sessionContextDialogs } from '@jupyterlab/apputils';
import { KernelMessage } from '@jupyterlab/services';
import { IComm } from '@jupyterlab/services/lib/kernel/kernel';
import { PromiseDelegate, UUID } from '@lumino/coreutils';
import { Signal } from '@lumino/signaling';
import { useEffect } from 'react';
import { ITLabStoreManager } from './manager';

const TARGET_NAME = 'tlab';

interface IStoreObject {
  name: string;
  uuid: string;
  data: any;
}

interface ICommMsgMeta {
  method: string;
  req_id?: string;
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
      if (listener.check(msg)) {
        listener.handler(msg);
      }
    }
  }
}

/**
 * Front TLab store. Exposes kernel variables to the front end widgets
 * and manage a communication with a kernel store via a handler.
 */
export interface ITLabStore {
  /**
   * Objects in store.
   */
  objects: Map<string, IStoreObject>;

  /**
   * Signal for when an object is modified to the store.
   */
  signal: Signal<this, IStoreObject>;

  /**
   * Connect store to kernel, obtain kernel store handler
   * and wait for kernel store to be ready.
   */
  connect(): Promise<void>;

  /**
   * Fetch a variable from the kernel store.
   * Its data model should be supported registered in store manager.
   * @param name Name of the variable in kernel.
   * @returns Variable promise.
   */
  fetch(name: string): Promise<any>;
}

/**
 * ITLabStore implementation.
 */
export class TLabStore implements ITLabStore {
  objects = new Map<string, IStoreObject>();
  signal = new Signal<this, IStoreObject>(this);

  private sessionContext;
  private comm?: IComm;
  private listeners = new CommListeners();
  private cmdDelegates = new Map<
    string,
    PromiseDelegate<KernelMessage.ICommMsgMsg>
  >();

  constructor(
    private app: JupyterFrontEnd,
    private manager: ITLabStoreManager
  ) {
    const serviceManager = app.serviceManager;
    this.sessionContext = new SessionContext({
      sessionManager: serviceManager.sessions,
      specsManager: serviceManager.kernelspecs,
      name: 'twiinIT Lab'
    });
  }

  async connect() {
    // User kernel selection
    const val = await this.sessionContext.initialize();
    if (val) {
      await sessionContextDialogs.selectKernel(this.sessionContext);
    }

    // Connect store to the kernel
    const kernel = this.sessionContext.session?.kernel;
    if (kernel) {
      this.comm = kernel.createComm(TARGET_NAME);
      this.comm.onMsg = this.onCommMsg.bind(this);

      const infos = await kernel.info;
      const language = infos.language_info.name;
      const connector = this.manager.getKernelStoreConnector(language);
      await connector(kernel, TARGET_NAME);

      const metadata: ICommMsgMeta = { method: 'open', req_id: UUID.uuid4() };
      this.comm.open(undefined, metadata as any);
    }
  }

  async fetch(name: string) {
    const uuid = UUID.uuid4();
    const listenerId = this.listeners.add(
      msg => msg.metadata.uuid === uuid && msg.content.data.method === 'update',
      msg => {
        const obj = this.objects.get(uuid);
        if (obj) {
          const newState = msg.content.data.state as any;
          obj.data = { ...obj.data, ...newState };
          this.signal.emit(obj);
        } else {
          this.listeners.remove(listenerId);
        }
      }
    );
    const msg = await this.command('fetch', { name, uuid });
    const storeObj = { name, uuid, data: msg.content.data.state };
    this.objects.set(uuid, storeObj);
    this.signal.emit(storeObj);
    return storeObj;
  }

  /**
   * Send a command to the kernel.
   * @param method
   * @param payload
   * @returns Result message.
   */
  private async command(method: string, payload: any) {
    if (!this.comm) {
      throw new Error('no comm');
    }
    const delegate = new PromiseDelegate<KernelMessage.ICommMsgMsg>();
    const req_id = UUID.uuid4();
    this.cmdDelegates.set(req_id, delegate);
    setTimeout(() => {
      delegate.reject(new Error('timeout'));
      this.cmdDelegates.delete(req_id);
    }, 10000);
    await this.comm.send(payload, { method, req_id }).done;
    return delegate.promise;
  }

  /**
   * Kernel event handler.
   * @param msg Message from the kernel.
   */
  private onCommMsg(msg: KernelMessage.ICommMsgMsg) {
    console.log('onCommMsg', msg);
    const { method, req_id } = msg.metadata as any as ICommMsgMeta;
    if (method === 'reply' && req_id) {
      const promiseDelegate = this.cmdDelegates.get(req_id);
      promiseDelegate?.resolve(msg);
      this.cmdDelegates.delete(req_id);
    }
    this.listeners.resolve(msg);
  }
}

/**
 * Store signal React hook.
 * @param store Store to be used.
 * @param callback
 */
export function useStoreSignal(
  store: ITLabStore,
  callback: (store: ITLabStore, obj: IStoreObject) => void
) {
  useEffect(() => {
    store.signal.connect(callback);
    return () => {
      store.signal.disconnect(callback);
    };
  }, [callback, store.signal]);
}
