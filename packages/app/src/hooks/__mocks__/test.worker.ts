/* eslint-disable no-restricted-globals */
import 'path';

self.addEventListener('message', async (event) => {
  const result = await handler(event.data);
  self.postMessage(result);
});

async function handler(num: number) {
  return factorial(num);
}

function factorial(n: number): number {
  if (typeof n !== 'number' || isNaN(n)) return -1;
  if (n === 1) return 1;
  if (n === 2) return 2;
  return n * factorial(n - 1);
}
