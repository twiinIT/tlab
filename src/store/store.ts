// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { SessionContext, sessionContextDialogs } from '@jupyterlab/apputils';
import { Kernel, KernelMessage } from '@jupyterlab/services';
import { IComm } from '@jupyterlab/services/lib/kernel/kernel';
import { JSONObject, PromiseDelegate, UUID } from '@lumino/coreutils';
import { Signal } from '@lumino/signaling';
import { useEffect } from 'react';
import { ITLabStoreManager } from './manager';

const TARGET_NAME = 'tlab';

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
    const { data, modelId }: any = await this.command('get', name);
    console.log({ data, modelId });
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
  private async command(name: string, data: any) {
    if (!this.comm) {
      throw new Error('no comm');
    }
    const req_id = UUID.uuid4();
    const promise = new PromiseDelegate<KernelMessage.ICommMsgMsg>();
    this.cmdPromises.set(req_id, promise);
    const meta: ICommMsgMeta = { name, req_id };
    await this.comm.send(data, meta as unknown as JSONObject).done;
    return promise.promise;
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
