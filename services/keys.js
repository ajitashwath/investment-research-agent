let _geminiKey = null
let _tavilyKey = null
let _depth = 'basic'

export function setCustomKeys(geminiKey, tavilyKey, depth) {
  _geminiKey = geminiKey ? geminiKey.trim() : null
  _tavilyKey = tavilyKey ? tavilyKey.trim() : null
  if (depth) _depth = depth
}

export function getGeminiKey(config) {
  return config?.configurable?.geminiKey || _geminiKey || process.env.GEMINI_API_KEY
}

export function getTavilyKey(config) {
  return config?.configurable?.tavilyKey || _tavilyKey || process.env.TAVILY_API_KEY
}

export function getSearchDepth(config) {
  return config?.configurable?.depth || _depth
}

