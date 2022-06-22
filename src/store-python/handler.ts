import { Kernel } from '@jupyterlab/services';
import { IKernelStoreHandler } from '../store/handler';

export class PythonKernelStoreHandler implements IKernelStoreHandler {
  private comm: Kernel.IComm | undefined;

  constructor(private kernel: Kernel.IKernelConnection) {
    this.initComm();
  }

  private async initComm() {
    // https://jupyter-notebook.readthedocs.io/en/stable/comms.html#opening-a-comm-from-the-frontend
    // TODO: handshake
    const code = `
    def target_func(comm, open_msg):
        # comm is the kernel Comm instance
        # msg is the comm_open message

        # Register handler for later messages
        @comm.on_msg
        def _recv(msg):
            # Use msg['content']['data'] for the data in the message
            comm.send({'echo': msg['content']['data']})

        # Send data to the frontend on creation
        comm.send({'foo': 5})

    get_ipython().kernel.comm_manager.register_target('twiinit_lab', target_func)
    `;
    await this.kernel.requestExecute({ code }).done;

    this.comm = this.kernel.createComm('twiinit_lab');
    await this.comm.open({ foo: 6 }).done;

    // Register a handler
    this.comm.onMsg = msg => {
      console.log(msg);
    };

    // Send data
    await this.comm.send({ foo: 7 }).done;
    await this.comm.send({ foo: 7 }).done;
    await this.comm.send({ foo: 7 }).done;
  }
}
