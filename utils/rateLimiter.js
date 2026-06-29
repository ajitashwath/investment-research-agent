import fs from 'fs'
import path from 'path'

const STORE_PATH = path.join(process.cwd(), 'rate-limit-store.json')
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours
const MAX_REQUESTS = 100

class Mutex {
  constructor() {
    this.queue = Promise.resolve()
  }

  acquire() {
    let release
    const ticket = new Promise((resolve) => {
      release = resolve
    })
    const current = this.queue
    this.queue = current.then(() => ticket)
    return current.then(() => release)
  }
}

const mutex = new Mutex()

async function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = await fs.promises.readFile(STORE_PATH, 'utf8')
      return JSON.parse(data || '{}')
    }
  } catch (err) {
    console.error('Failed to load rate limit store, falling back to empty store:', err)
  }
  return {}
}

async function saveStore(store) {
  try {
    await fs.promises.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8')
  } catch (err) {
    console.error('Failed to save rate limit store:', err)
  }
}

/**
 * Checks if the identifier has exceeded the daily rate limit.
 * @param {string} identifier - The unique ID (User ID or IP Address)
 * @returns {Promise<{ allowed: boolean, remaining: number, resetTime?: number, max: number }>}
 */
export async function checkRateLimit(identifier) {
  if (!identifier) {
    return { allowed: true, remaining: MAX_REQUESTS, max: MAX_REQUESTS }
  }

  const release = await mutex.acquire()
  try {
    const store = await loadStore()
    const now = Date.now()

    // Get request timestamps for this identifier
    const requestTimes = store[identifier] || []

    // Filter out timestamps older than the sliding window
    const activeRequests = requestTimes.filter((time) => now - time < WINDOW_MS)

    if (activeRequests.length >= MAX_REQUESTS) {
      const oldestRequest = activeRequests[0]
      const resetTime = oldestRequest + WINDOW_MS

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        max: MAX_REQUESTS,
      }
    }

    // Record this request
    activeRequests.push(now)
    store[identifier] = activeRequests

    // Periodically clean up other expired keys in the store to prevent unbounded file growth
    for (const key in store) {
      if (store[key] && Array.isArray(store[key])) {
        const filtered = store[key].filter((time) => now - time < WINDOW_MS)
        if (filtered.length === 0) {
          delete store[key]
        } else {
          store[key] = filtered
        }
      }
    }

    await saveStore(store)

    return {
      allowed: true,
      remaining: MAX_REQUESTS - activeRequests.length,
      max: MAX_REQUESTS,
    }
  } catch (err) {
    console.error('Error checking rate limit, defaulting to allow:', err)
    return { allowed: true, remaining: 1, max: MAX_REQUESTS }
  } finally {
    release()
  }
}
