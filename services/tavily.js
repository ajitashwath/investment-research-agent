const TAVILY_API_URL = 'https://api.tavily.com/search'

export async function tavilySearch(query, options = {}) {
  const {
    maxResults = 5,
    searchDepth = 'advanced',
    includeAnswer = true,
    includeRawContent = false,
    days = 30,
  } = options

  const body = {
    api_key: process.env.TAVILY_API_KEY,
    query,
    max_results: maxResults,
    search_depth: searchDepth,
    include_answer: includeAnswer,
    include_raw_content: includeRawContent,
    days,
  }

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
}

export async function tavilySearchMultiple(queries, options = {}) {
  const results = await Promise.allSettled(
    queries.map((q) => tavilySearch(q, options))
  )

  const allResults = []
  let combinedAnswer = ''

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allResults.push(...result.value.results)
      if (result.value.answer) combinedAnswer += result.value.answer + '\n'
    }
  }

  const seen = new Set()
  const deduped = allResults.filter((r) => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })

  return { answer: combinedAnswer.trim(), results: deduped }
}
