import { tavilySearch } from '../../services/tavily.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { NEWS_ANALYSIS_PROMPT } from '../../prompts/index.js'

export async function newsAgentNode(state, config) {
  const { company, ticker, companyData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'news', status: 'running', message: 'Scanning latest news...' })

  try {
    const resolvedTicker = ticker || companyData?.ticker || ''

    // Single query, basic depth (was 'advanced'), fewer results (4 not 6)
    const { results, warning } = await tavilySearch(
      `${company} ${resolvedTicker} latest news earnings analyst ratings`,
      {
        maxResults: 4,
        searchDepth: 'basic',
        days: 30,
        topic: 'news',
        config,
      }
    )

    const context = `
Company: ${company} (${resolvedTicker})

News Articles:
${results.map((r, i) => `Article ${i + 1}:
Title: ${r.title}
URL: ${r.url}
Published: ${r.publishedDate || 'Recent'}
Content: ${r.content?.slice(0, 500)}`).join('\n\n---\n\n')}`

    const llm = getGeminiFlash(config, 1536)
    const raw = await callGemini(llm, NEWS_ANALYSIS_PROMPT, context)
    const newsData = extractJSON(raw)

    if (!Array.isArray(newsData.articles)) newsData.articles = []

    newsData.articles = newsData.articles.map((a, i) => ({
      ...a,
      url: a.url || results[i]?.url || '#',
      source: a.source || (() => { try { return new URL(results[i]?.url || '').hostname.replace('www.', '') } catch { return 'Unknown' } })(),
    }))

    const sources = results.slice(0, 4).map(r => ({
      title: r.title,
      url: r.url,
      source: (() => { try { return new URL(r.url).hostname.replace('www.', '') } catch { return 'Unknown' } })(),
    }))

    const warnings = warning ? [warning] : []
    onProgress?.({ agent: 'news', status: warnings.length ? 'warning' : 'done', message: 'News analysis complete' })
    return { newsData, sources, errors: warnings }
  } catch (err) {
    onProgress?.({ agent: 'news', status: 'error', message: err.message })
    return { errors: [`News: ${err.message}`] }
  }
}
