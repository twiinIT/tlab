// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { SessionContext, sessionContextDialogs } from '@jupyterlab/apputils';
import { Kernel, KernelMessage } from '@jupyterlab/services';
import { IComm } from '@jupyterlab/services/lib/kernel/kernel';
import { UUID } from '@lumino/coreutils';
import { Signal } from '@lumino/signaling';
import { useEffect } from 'react';
import { ITLabStoreManager } from './manager';

const TARGET_NAME = 'tlab';

interface IStoreObject {
  name: string;
  uuid: string;
  data: any;
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
  private kernel?: Kernel.IKernelConnection;
  private comm?: IComm;
  private listeners = new CommListeners();

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
      this.kernel = kernel;
      this.comm = kernel.createComm(TARGET_NAME);
      this.comm.onMsg = this.onCommMsg.bind(this);

      const infos = await kernel.info;
      const language = infos.language_info.name;
      const connector = this.manager.getKernelStoreConnector(language);
      await connector(kernel, TARGET_NAME);

      const metadata = { name: 'syn', req_id: UUID.uuid4() };
      this.comm.open(undefined, metadata);
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
    const msg = await this.wait_for(
      'get',
      { name, uuid },
      msg => msg.metadata.uuid === uuid && msg.content.data.method === 'upload'
    );
    const storeObj = { name, uuid, data: msg.content.data.state };
    this.objects.set(uuid, storeObj);
    this.signal.emit(storeObj);
    return storeObj;
  }

  /**
   * Send command and wait for response.
   * @param action
   * @param payload
   * @param check
   * @returns
   */
  private async wait_for(
    action: string,
    payload: any,
    check: (msg: KernelMessage.ICommMsgMsg) => boolean
  ) {
    if (!this.comm) {
      throw new Error('no comm');
    }
    let listenerId: string;
    const promise = new Promise<KernelMessage.ICommMsgMsg>(
      (resolve, reject) => {
        listenerId = this.listeners.add(check, msg => {
          resolve(msg);
        });
        setTimeout(() => {
          reject(new Error('timeout'));
        }, 10000);
      }
    ).then(msg => {
      this.listeners.remove(listenerId);
      return msg;
    });
    await this.comm.send(payload, { action }).done;
    return promise;
  }

  /**
   * Kernel event handler.
   * @param msg Message from the kernel.
   */
  private onCommMsg(msg: KernelMessage.ICommMsgMsg) {
    console.log('onCommMsg', msg);
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
