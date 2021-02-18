import fs from 'fs';
import path from 'path';

const code = fs.readFileSync(
  path.join(__dirname, '../../../build/processor.worker.js')
);

class ProcessorWorker {
  constructor() {
    return new Worker(URL.createObjectURL(new Blob([code])));
  }
}

export default ProcessorWorker;
