// Redis - Cache pour les scores de matching & sessions
// Évite de recalculer l'IA à chaque requête
// ⚠️  Si REDIS_URL n'est pas défini, on utilise un cache in-memory
//     pour ne pas crasher en production sans Redis configuré.

// ─── In-memory fallback ────────────────────────────────────────────
interface MemEntry { value: string; expiresAt: number | null }
class MemoryCache {
  private store = new Map<string, MemEntry>()

  private isExpired(entry: MemEntry): boolean {
    return entry.expiresAt !== null && Date.now() > entry.expiresAt
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key)
    if (!entry || this.isExpired(entry)) { this.store.delete(key); return null }
    return entry.value
  }

  async set(key: string, value: string, mode?: string, ttl?: number): Promise<void> {
    const expiresAt = (mode === 'EX' && ttl) ? Date.now() + ttl * 1000 : null
    this.store.set(key, { value, expiresAt })
  }

  async del(key: string): Promise<void> { this.store.delete(key) }

  async incr(key: string): Promise<number> {
    const entry = this.store.get(key)
    const current = entry && !this.isExpired(entry) ? parseInt(entry.value, 10) : 0
    const next = current + 1
    const expiresAt = entry?.expiresAt ?? null
    this.store.set(key, { value: String(next), expiresAt })
    return next
  }

  async expire(key: string, seconds: number): Promise<void> {
    const entry = this.store.get(key)
    if (entry) this.store.set(key, { ...entry, expiresAt: Date.now() + seconds * 1000 })
  }

  async keys(pattern: string): Promise<string[]> {
    // Support basique du wildcard *
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    return [...this.store.keys()].filter(k => regex.test(k))
  }
}

// ─── Sélection du client ──────────────────────────────────────────
type CacheClient = {
  get(key: string): Promise<string | null>
  set(key: string, value: string, mode?: string, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  incr(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<void>
  keys(pattern: string): Promise<string[]>
}

let _client: CacheClient | null = null

function getCacheClient(): CacheClient {
  if (_client) return _client

  if (process.env.REDIS_URL) {
    // Redis réel — uniquement si REDIS_URL est configuré
    const { Redis } = require('ioredis')
    const redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times: number) => Math.min(times * 100, 3000),
      lazyConnect: true,
    })

    redisClient.on('error', (err: Error) => {
      console.warn('[Redis] Connexion error, falling back to memory cache:', err.message)
      _client = new MemoryCache()
    })

    _client = {
      get: (key) => redisClient.get(key),
      set: (key, value, mode, ttl) =>
        mode === 'EX' && ttl
          ? redisClient.set(key, value, mode, ttl)
          : redisClient.set(key, value),
      del: (key) => redisClient.del(key),
      incr: (key) => redisClient.incr(key),
      expire: (key, seconds) => redisClient.expire(key, seconds),
      keys: (pattern) => redisClient.keys(pattern),
    }
  } else {
    // Pas de Redis configuré — in-memory silencieux
    if (process.env.NODE_ENV !== 'production') {
      console.info('[Redis] REDIS_URL non défini — cache in-memory activé (dev/staging)')
    }
    _client = new MemoryCache()
  }

  return _client
}

// ─── Helpers Cache ──────────────────────────────────────────────────
export const CACHE_TTL = {
  MATCH_SCORES:     60 * 60 * 2,      // 2h — scores de compatibilité
  USER_PROFILE:     60 * 15,          // 15min — profil utilisateur
  SUGGESTIONS:      60 * 60 * 24,     // 24h — suggestions du jour
  SESSION:          60 * 60 * 24 * 7, // 7j — sessions auth
  RATE_LIMIT:       60,               // 1min — rate limiting
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await getCacheClient().get(key)
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttl = 3600): Promise<void> {
  try {
    await getCacheClient().set(key, JSON.stringify(value), 'EX', ttl)
  } catch {
    // Le cache n'est pas critique — on laisse passer silencieusement
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await getCacheClient().del(key)
  } catch {}
}

export async function cacheKeys(pattern: string): Promise<string[]> {
  try {
    return await getCacheClient().keys(pattern)
  } catch {
    return []
  }
}

// ─── Rate limiting ─────────────────────────────────────────────────
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const client = getCacheClient()
    const current = await client.incr(key)
    if (current === 1) {
      await client.expire(key, windowSeconds)
    }
    return {
      allowed: current <= maxRequests,
      remaining: Math.max(0, maxRequests - current),
    }
  } catch {
    // Fail open — ne jamais bloquer à cause du cache
    return { allowed: true, remaining: maxRequests }
  }
}
