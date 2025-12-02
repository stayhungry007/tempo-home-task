## Code Review

You are reviewing the following code submitted as part of a task to implement an item cache in a highly concurrent application. The anticipated load includes: thousands of reads per second, hundreds of writes per second, tens of concurrent threads.
Your objective is to identify and explain the issues in the implementation that must be addressed before deploying the code to production. Please provide a clear explanation of each issue and its potential impact on production behaviour.

```kotlin
import java.util.concurrent.ConcurrentHashMap

class SimpleCache<K, V> {
    private val cache = ConcurrentHashMap<K, CacheEntry<V>>()
    private val ttlMs = 60000 // 1 minute
    
    data class CacheEntry<V>(val value: V, val timestamp: Long)
    
    fun put(key: K, value: V) {
        cache[key] = CacheEntry(value, System.currentTimeMillis())
    }
    
    fun get(key: K): V? {
        val entry = cache[key]
        if (entry != null) {
            if (System.currentTimeMillis() - entry.timestamp < ttlMs) {
                return entry.value
            }
        }
        return null
    }
    
    fun size(): Int {
        return cache.size
    }
}
```


## issues and explanation, impact

The following issues are ordered by priority (highest risk first). Each item includes a short explanation, the potential impact in production under the anticipated load, and a concise recommended fix.

1. Expired entries are never removed — memory leak / unbounded growth
   - Explanation: Entries remain in the ConcurrentHashMap after they expire; get() returns null but does not remove the key.
   - Impact: Memory usage will grow without bound under sustained writes, risking OOM and long GC pauses.
   - Fix: Remove expired entries on access (atomically) and/or run a background cleaner; prefer a proven cache library (Caffeine).

2. No capacity limit or eviction policy — unbounded cache size
   - Explanation: There is no maximum size or eviction strategy.
   - Impact: High write rates will cause unbounded growth and severe memory pressure.
   - Fix: Implement a max size with eviction (LRU/LFU) or use a library that supports bounded caches.

3. Uses System.currentTimeMillis() for TTL checks — clock-sensitivity
   - Explanation: The code uses wall-clock time, which can jump due to NTP or manual changes.
   - Impact: Entries may appear to expire early/late after clock adjustments, causing incorrect behavior.
   - Fix: Use System.nanoTime() for elapsed-time comparisons (store insertion nanoTime and compare with ttl in nanos).

4. size() includes expired entries — inaccurate metrics
   - Explanation: size() returns the map size, which counts expired-but-not-removed entries.
   - Impact: Monitoring and capacity decisions based on size() will be misleading.
   - Fix: Either compute live size by filtering non-expired entries (expensive), maintain a live-count, or document approximate semantics; better: use a library.

5. Inefficient cleanup under heavy concurrency — throughput and latency impact
   - Explanation: Removing expired entries on every access or scanning the whole map is expensive at thousands of reads/sec.
   - Impact: High CPU usage and degraded throughput; latency spikes under contention.
   - Fix: Use a background scheduled cleaner that removes expired entries incrementally or a timing-wheel/priority queue approach (or use Caffeine which handles this efficiently).

6. Expiration removal not atomic — race conditions
   - Explanation: get() checks timestamp and returns value without removing the entry atomically when expired.
   - Impact: Concurrent threads may return expired values or perform redundant removals.
   - Fix: Use atomic map operations (computeIfPresent, remove(key, expectedValue)) to avoid races when removing expired entries.

- There are some other issues but above 6 issues are highest risks.