import { listener } from '../processor';

class ProcessorWorker {
  listeners: ((ev: MessageEvent<any>) => any)[] = [];

  constructor() {
    this.listeners = [];
  }

  addEventListener(_type: 'message', listener: (ev: MessageEvent<any>) => any) {
    this.listeners.push(listener);
  }

  removeEventListener(
    _type: 'message',
    listener: (ev: MessageEvent<any>) => any
  ) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  terminate() {
    this.listeners = [];
  }

  postMessage(message: any) {
    listener(message, (responseMsg) =>
      this.listeners.forEach((handler) => handler(responseMsg))
    );
  }
}

export default ProcessorWorker;
