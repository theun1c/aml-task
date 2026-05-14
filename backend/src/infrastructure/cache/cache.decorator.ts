import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export function Cacheable(ttl: number = 600) {
  const cacheManagerInject = Inject(CACHE_MANAGER);

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheManager = this[CACHE_MANAGER] as Cache;
      
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

    cacheManagerInject(target, propertyKey);
    return descriptor;
  };
}
