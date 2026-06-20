import { tavilySearchMultiple } from '../../services/tavily.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { NEWS_ANALYSIS_PROMPT } from '../../prompts/index.js'

export async function newsAgentNode(state, config) {
  const { company, ticker, companyData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'news', status: 'running', message: 'Scanning latest news...' })

  try {
    const resolvedTicker = ticker || companyData?.ticker || ''
    const queries = [
      `${company} ${resolvedTicker} latest news 2024 2025`,
      `${company} earnings revenue analyst rating upgrade downgrade`,
      `${company} acquisition merger partnership product launch`,
      `${company} lawsuit regulation antitrust investigation`,
    ]

    const { results } = await tavilySearchMultiple(queries, {
      maxResults: 6,
      searchDepth: 'advanced',
      days: 60,
    })

    const limitedResults = results.slice(0, 8)

    const context = `
Company: ${company} (${resolvedTicker})

News Articles:
${limitedResults.map((r, i) => `Article ${i + 1}:
Title: ${r.title}
URL: ${r.url}
Published: ${r.publishedDate || 'Recent'}
Content: ${r.content}`).join('\n\n---\n\n')}
`

    const llm = getGeminiFlash()
    const raw = await callGemini(llm, NEWS_ANALYSIS_PROMPT, context)
    const newsData = extractJSON(raw)

    if (!Array.isArray(newsData.articles)) newsData.articles = []

    newsData.articles = newsData.articles.map((a, i) => ({
      ...a,
      url: a.url || limitedResults[i]?.url || '#',
      source: a.source || (() => { try { return new URL(limitedResults[i]?.url || '').hostname.replace('www.', '') } catch { return 'Unknown' } })(),
    }))

    const sources = limitedResults.slice(0, 6).map(r => ({
      title: r.title,
      url: r.url,
      source: (() => { try { return new URL(r.url).hostname.replace('www.', '') } catch { return 'Unknown' } })(),
    }))

    onProgress?.({ agent: 'news', status: 'done', message: 'News analysis complete' })

    return { newsData, sources }
  } catch (err) {
    onProgress?.({ agent: 'news', status: 'error', message: err.message })
    return { errors: [`News: ${err.message}`] }
  }
}
