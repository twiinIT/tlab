// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { SessionContext, sessionContextDialogs } from '@jupyterlab/apputils';
import { Kernel, KernelMessage } from '@jupyterlab/services';
import { IComm } from '@jupyterlab/services/lib/kernel/kernel';
import { PromiseDelegate, UUID } from '@lumino/coreutils';
import { Signal } from '@lumino/signaling';
import { useEffect } from 'react';
import { ITLabStoreManager } from './manager';

const TARGET_NAME = 'tlab';

/**
 * Front TLab store. Exposes kernel variables to the front end widgets
 * and manage a communication with a kernel store via a handler.
 */
export interface ITLabStore {
  /**
   * Objects in store.
   */
  objects: Map<string, any>;

  /**
   * Signal for when an object is modified to the store.
   */
  signal: Signal<this, void>;

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
  objects = new Map<string, any>();
  signal = new Signal<this, void>(this);

  private sessionContext;
  private kernel?: Kernel.IKernelConnection;
  private comm?: IComm;
  private cmdPromises = new Map<
    (msg: KernelMessage.ICommMsgMsg) => boolean,
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
    const msg = await this.wait_for(
      'get',
      { name, uuid },
      msg => msg.metadata.uuid === uuid && msg.content.data.method === 'upload'
    );
    console.log(msg);
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
    const promise = new PromiseDelegate<KernelMessage.ICommMsgMsg>();
    this.cmdPromises.set(check, promise);
    setTimeout(() => {
      promise.reject(new Error('timeout'));
      this.cmdPromises.delete(check);
    }, 10000);
    await this.comm.send(payload, { action }).done;
    return promise.promise;
  }

  /**
   * Kernel event handler.
   * @param msg Message from the kernel.
   */
  private onCommMsg(msg: KernelMessage.ICommMsgMsg) {
    console.log('onCommMsg', msg);
    for (const [check, promise] of this.cmdPromises.entries()) {
      if (check(msg)) {
        promise.resolve(msg);
        this.cmdPromises.delete(check);
      }
    }
  }
}

/**
 * Store signal React hook.
 * @param store Store to be used.
 * @param callback
 */
export function useStoreSignal(
  store: ITLabStore,
  callback: (store: ITLabStore) => void
) {
  useEffect(() => {
    store.signal.connect(callback);
    return () => {
      store.signal.disconnect(callback);
    };
  }, [callback, store.signal]);
}
