import fs from 'fs';
import path from 'path';

const code = fs.readFileSync(path.join(__dirname, '../processor.worker.ts'));

class ProcessorWorker {
  constructor() {
    return new Worker(URL.createObjectURL(new Blob([code])));
  }
}

export default ProcessorWorker;
