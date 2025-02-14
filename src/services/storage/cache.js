export class AnalysisCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 1000 * 60 * 30; // 30分钟缓存
  }

  async get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  async set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

// 装饰器工厂
export const withCache = (cache) => (target, key, descriptor) => {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args) {
    const cacheKey = `${key}-${JSON.stringify(args)}`;
    const cached = await cache.get(cacheKey);

    if (cached) return cached;

    const result = await originalMethod.apply(this, args);
    await cache.set(cacheKey, result);
    return result;
  };

  return descriptor;
};
