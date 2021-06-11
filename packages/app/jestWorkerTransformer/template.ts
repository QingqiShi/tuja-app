/* {% WORKER_IMPORTS %} */

interface Event {
  data: any;
}

class Worker {
  listeners: ((ev: Event) => any)[] = [];

  constructor() {
    this.listeners = [];
  }

  addEventListener(_type: 'message', listener: (ev: Event) => any) {
    this.listeners.push(listener);
  }

  removeEventListener(_type: 'message', listener: (ev: Event) => any) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  terminate() {
    this.listeners = [];
  }

  postMessage(payload: any) {
    const addEventListener = async (
      _type: 'message',
      handler: (event: Event) => void | Promise<any>
    ) => {
      await handler({ data: payload });
    };
    const postMessage = (payload: any) =>
      this.listeners.forEach((handler) => handler({ data: payload }));
    const self = { addEventListener, postMessage };

    /* {% WORKER_CODE %} */

    return void self;
  }
}

export default Worker;
