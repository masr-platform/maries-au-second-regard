// Redis - Cache pour les scores de matching & sessions
// Évite de recalculer l'IA à chaque requête

import { Redis } from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis }

function createRedisClient() {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times) => Math.min(times * 100, 3000),
  })

  client.on('error', (err) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Redis connexion warning:', err.message)
    }
  })

  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

// ─── Helpers Cache ──────────────────────────────────────────────────
export const CACHE_TTL = {
  MATCH_SCORES:     60 * 60 * 2,    // 2h — scores de compatibilité
  USER_PROFILE:     60 * 15,        // 15min — profil utilisateur
  SUGGESTIONS:      60 * 60 * 24,   // 24h — suggestions du jour
  SESSION:          60 * 60 * 24 * 7, // 7j — sessions auth
  RATE_LIMIT:       60,             // 1min — rate limiting
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key)
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttl = 3600): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl)
  } catch {
    // Silencieux en production — le cache n'est pas critique
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch {}
}

export async function cacheKeys(pattern: string): Promise<string[]> {
  try {
    return await redis.keys(pattern)
  } catch {
    return []
  }
}

// Rate limiting
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const current = await redis.incr(key)
    if (current === 1) {
      await redis.expire(key, windowSeconds)
    }
    return {
      allowed: current <= maxRequests,
      remaining: Math.max(0, maxRequests - current),
    }
  } catch {
    return { allowed: true, remaining: maxRequests }
  }
}
