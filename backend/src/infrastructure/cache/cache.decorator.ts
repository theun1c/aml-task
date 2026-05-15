import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export function Cacheable(ttl: number = 600) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheManager = this.cacheManager as Cache;
      
      if (!cacheManager) {
        // If cacheManager is not available, just call the original method
        return originalMethod.apply(this, args);
      }
      
      // Генерируем ключ кеша из названия метода и аргументов
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      
      try {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          return cached;
        }
      } catch (error) {
        // Если кеш не работает, просто продолжаем
      }

      const result = await originalMethod.apply(this, args);

      try {
        await cacheManager.set(cacheKey, result, ttl * 1000);
      } catch (error) {
        // Ignore cache errors
      }

      return result;
    };

    return descriptor;
  };
}
