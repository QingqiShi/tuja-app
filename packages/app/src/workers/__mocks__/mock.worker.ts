class ProcessorWorker {
  constructor() {
    // return new Worker(URL.createObjectURL(new Blob([code])));
    return new Worker(
      URL.createObjectURL(
        new Blob(["addEventListener('message', async (event) => {});"])
      )
    );
  }
}

export default ProcessorWorker;
