import { tavilySearchMultiple } from '../../services/tavily.js'
import { getGeminiFlash, callGemini, extractJSON } from '../../services/gemini.js'
import { NEWS_ANALYSIS_PROMPT } from '../../prompts/index.js'

export async function newsAgentNode(state, config) {
  const { company, ticker, companyData } = state
  const onProgress = config?.configurable?.onProgress

  onProgress?.({ agent: 'news', status: 'running', message: 'Scanning latest news...' })

  try {
    const resolvedTicker = ticker || companyData?.ticker || ''
    const currentYear = new Date().getFullYear()
    const prevYear = currentYear - 1
    const queries = [
      `${company} ${resolvedTicker} latest news ${prevYear} ${currentYear}`,
      `${company} earnings revenue analyst rating upgrade downgrade`,
      `${company} acquisition merger partnership product launch`,
      `${company} lawsuit regulation antitrust investigation`,
    ]

    const { results, warnings } = await tavilySearchMultiple(queries, {
      maxResults: 6,
      searchDepth: 'advanced',
      days: 30,
      topic: 'news',
      config,
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

    const llm = getGeminiFlash(config)
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

    const hasWarnings = warnings && warnings.length > 0
    onProgress?.({
      agent: 'news',
      status: hasWarnings ? 'warning' : 'done',
      message: hasWarnings ? 'News analysis completed with search warnings' : 'News analysis complete'
    })

    return { newsData, sources, errors: warnings || [] }
  } catch (err) {
    onProgress?.({ agent: 'news', status: 'error', message: err.message })
    return { errors: [`News: ${err.message}`] }
  }
}
