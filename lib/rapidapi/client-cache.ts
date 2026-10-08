/**
 * Resilient Cache & Circuit Breaker for RapidAPI Endpoints
 * Provides:
 * - In-memory LRU-style cache with configurable TTL
 * - Automatic circuit breaking to prevent rate-limit penalties (HTTP 429)
 * - Safe fallback execution for offline / quota-exhausted environments
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class RapidApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private failureCounts = new Map<string, number>();
  private circuitBreakers = new Map<string, number>(); // endpoint -> cooldown expiry timestamp

  private readonly FAILURE_THRESHOLD = 3;
  private readonly COOLDOWN_MS = 60_000; // 1 minute cooldown

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number = 3600): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  isCircuitOpen(endpoint: string): boolean {
    const cooldown = this.circuitBreakers.get(endpoint);
    if (!cooldown) return false;
    if (Date.now() > cooldown) {
      this.circuitBreakers.delete(endpoint);
      this.failureCounts.set(endpoint, 0);
      return false;
    }
    return true;
  }

  recordSuccess(endpoint: string): void {
    this.failureCounts.set(endpoint, 0);
    this.circuitBreakers.delete(endpoint);
  }

  recordFailure(endpoint: string): void {
    const count = (this.failureCounts.get(endpoint) || 0) + 1;
    this.failureCounts.set(endpoint, count);
    if (count >= this.FAILURE_THRESHOLD) {
      this.circuitBreakers.set(endpoint, Date.now() + this.COOLDOWN_MS);
      console.warn(`[RAPIDAPI:CIRCUIT] Tripped circuit breaker for ${endpoint}. Cooldown active.`);
    }
  }

  clear(): void {
    this.cache.clear();
    this.failureCounts.clear();
    this.circuitBreakers.clear();
  }
}

export const rapidApiCache = new RapidApiCache();

/**
 * Standard RapidAPI request helper with caching and circuit breaking
 */
export async function executeRapidApiRequest<T>(options: {
  endpoint: string;
  url: string;
  host: string;
  params?: Record<string, string>;
  ttlSeconds?: number;
  fallbackGenerator: () => T;
}): Promise<{ data: T; source: "live" | "cache" | "fallback" }> {
  const cacheKey = `${options.endpoint}:${options.url}:${JSON.stringify(options.params || {})}`;

  // 1. Check cache first
  const cached = rapidApiCache.get<T>(cacheKey);
  if (cached) {
    return { data: cached, source: "cache" };
  }

  // 2. Check circuit breaker
  if (rapidApiCache.isCircuitOpen(options.endpoint)) {
    return { data: options.fallbackGenerator(), source: "fallback" };
  }

  const apiKey = process.env.RAPIDAPI_KEY || process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  if (!apiKey) {
    return { data: options.fallbackGenerator(), source: "fallback" };
  }

  try {
    const urlObj = new URL(options.url);
    if (options.params) {
      Object.entries(options.params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          urlObj.searchParams.append(k, v);
        }
      });
    }

    const res = await fetch(urlObj.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": options.host,
      },
      next: { revalidate: options.ttlSeconds || 3600 },
    });

    if (!res.ok) {
      rapidApiCache.recordFailure(options.endpoint);
      return { data: options.fallbackGenerator(), source: "fallback" };
    }

    const json = (await res.json()) as T;
    rapidApiCache.recordSuccess(options.endpoint);
    rapidApiCache.set(cacheKey, json, options.ttlSeconds || 3600);
    return { data: json, source: "live" };
  } catch (err) {
    rapidApiCache.recordFailure(options.endpoint);
    return { data: options.fallbackGenerator(), source: "fallback" };
  }
}
