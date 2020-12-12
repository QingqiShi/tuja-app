import type NodeCache from 'node-cache';
let cacheInstance: NodeCache;

export async function getCache<T>(namespace: string) {
  if (!cacheInstance) {
    const { default: Cache } = await import('node-cache');
    cacheInstance = new Cache();
  }
  return {
    get: (key: string) => cacheInstance.get(`${namespace}:${key}`) as T,
    set: (key: string, value: T) =>
      cacheInstance.set(`${namespace}:${key}`, value),
  };
}
