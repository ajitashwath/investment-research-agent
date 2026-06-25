import { getTavilyKey, getSearchDepth } from './keys.js'

const TAVILY_API_URL = 'https://api.tavily.com/search'

export async function tavilySearch(query, options = {}) {
  const config = options.config
  const currentDepth = getSearchDepth(config)
  const defaultDepth = currentDepth === 'basic' ? 'basic' : 'advanced'
  const defaultDays = currentDepth === 'basic' ? 30 : 60

  const {
    maxResults = 5,
    searchDepth = options.searchDepth || defaultDepth,
    includeAnswer = true,
    includeRawContent = false,
    days = options.days || defaultDays,
    topic = options.topic,
  } = options

  const body = {
    api_key: options.tavilyKey || getTavilyKey(config),
    query,
    max_results: maxResults,
    search_depth: searchDepth,
    include_answer: includeAnswer,
    include_raw_content: includeRawContent,
    days,
    ...(topic ? { topic } : {}),
  }

  let lastError
  const retries = 3
  const initialDelay = 1000

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(TAVILY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return {
        answer: data.answer || '',
        results: (data.results || []).map((r) => ({
          title: r.title,
          url: r.url,
          content: r.content,
          score: r.score,
          publishedDate: r.published_date,
        })),
      }
    } catch (err) {
      lastError = err
      console.warn(`Tavily search failed (attempt ${attempt}/${retries}): ${err.message}`)
      if (attempt < retries) {
        const delay = initialDelay * Math.pow(2, attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  // Fallback: If Tavily fails completely (e.g. rate limit, auth, network), return empty results instead of crashing the whole pipeline!
  console.error(`Tavily search failed completely: ${lastError.message}. Returning empty results as fallback.`)
  return {
    answer: '',
    results: [],
    warning: `Search API warning: ${lastError.message}`
  }
}

export async function tavilySearchMultiple(queries, options = {}) {
  const results = await Promise.allSettled(
    queries.map((q) => tavilySearch(q, options))
  )

  const allResults = []
  let combinedAnswer = ''
  const warnings = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allResults.push(...result.value.results)
      if (result.value.answer) combinedAnswer += result.value.answer + '\n'
      if (result.value.warning) warnings.push(result.value.warning)
    }
  }

  const seen = new Set()
  const deduped = allResults.filter((r) => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })

  return { 
    answer: combinedAnswer.trim(), 
    results: deduped,
    warnings: [...new Set(warnings)]
  }
}
