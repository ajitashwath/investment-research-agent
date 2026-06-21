let _geminiKey = null
let _tavilyKey = null
let _depth = 'advanced'

export function setCustomKeys(geminiKey, tavilyKey, depth) {
  _geminiKey = geminiKey ? geminiKey.trim() : null
  _tavilyKey = tavilyKey ? tavilyKey.trim() : null
  if (depth) _depth = depth
}

export function getGeminiKey() {
  return _geminiKey || process.env.GEMINI_API_KEY
}

export function getTavilyKey() {
  return _tavilyKey || process.env.TAVILY_API_KEY
}

export function getSearchDepth() {
  return _depth
}
