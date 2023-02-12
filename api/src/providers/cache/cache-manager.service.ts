import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  getManager() {
    return this.cacheManager;
  }

  async getIfCached<T>(
    key: string,
    ttl: number,
    realTimeDataCb: () => Promise<T>,
  ) {
    const updateCacheAndGetData = async () => {
      const newData = (await realTimeDataCb()) as T;
      await this.cacheManager.set(key, JSON.stringify(newData), { ttl });
      return newData;
    };

    const [cachedData, exisitingTtl] = await Promise.all([
      this.cacheManager.get(key),
      this.cacheManager.store.ttl(key) as Promise<number>,
    ]);

    // console.log({ exisitingTtl });

    if (!!cachedData && typeof cachedData === 'string') {
      if (exisitingTtl < Math.max(10, Math.ceil(ttl / 10)))
        updateCacheAndGetData();
      return JSON.parse(cachedData) as T;
    }

    return await updateCacheAndGetData();
  }

  async cachedFetch({ ttl, url }: { ttl: number; url: string }) {
    return await this.getIfCached(url, ttl, async () => {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
      throw response.json();
    });
  }
}
