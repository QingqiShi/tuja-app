import fs from 'fs';
import path from 'path';

const code = fs.readFileSync(path.join(__dirname, '../processor.worker.ts'));
export default URL.createObjectURL(new Blob([code]));
