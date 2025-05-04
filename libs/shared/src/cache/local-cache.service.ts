export class LocalCacheService {
  private readonly cache: Map<string, { value: any; expiresAt: number }> =
    new Map();

  /**
   * Set a value in the cache with a TTL.
   * @param key - The key to store the value under.
   * @param value - The value to store.
   * @param ttl - Time to live in milliseconds.
   */
  set(key: string, value: any, ttl = 3600000): void {
    const expiresAt = Date.now() + ttl; // default to 1 hour if ttl not specified
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get a value from the cache.
   * @param key - The key to retrieve the value for.
   * @returns The cached value, or null if it doesn't exist or has expired.
   */
  get(key: string): any {
    const cached = this.cache.get(key);
    if (!cached || cached.expiresAt < Date.now()) {
      // Automatically remove expired entries from the cache
      this.cache.delete(key);
      return null;
    }
    return cached.value;
  }

  /**
   * Delete a value from the cache.
   * @param key - The key to delete.
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
}
