// src/lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCachedOrCompute<T>(
  key: string,
  ttl: number,
  computeFn: () => Promise<T>
): Promise<T> {
  try {
    // 1. Vérifier si le cache est activé
    if (process.env.CACHE_ENABLED !== 'true') {
      console.log('Cache disabled, computing directly');
      return computeFn();
    }

    // 2. Vérifier le cache
    const cached = await redis.get<T>(key);
    if (cached) {
      console.log(`Cache HIT: ${key}`);
      return cached;
    }
    
    console.log(`Cache MISS: ${key}`);
    
    // 3. Calculer si pas en cache
    const result = await computeFn();
    
    // 4. Stocker en cache avec TTL
    await redis.setex(key, ttl, result);
    
    return result;
  } catch (error) {
    console.error('Cache error:', error);
    // En cas d'erreur Redis, on calcule directement
    return computeFn();
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    // Upstash ne supporte pas les patterns, on doit gérer autrement
    console.log(`Cache invalidation for pattern: ${pattern}`);
    // Pour l'instant, on ne fait rien
    // TODO: Implémenter une vraie stratégie d'invalidation
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

export default redis;