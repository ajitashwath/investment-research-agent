import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { getGeminiKey } from './keys.js'

export function getGeminiFlash(config, maxTokens = 2048) {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: getGeminiKey(config),
    temperature: 0.3,
    maxOutputTokens: maxTokens,
  })
}

// Kept for API compatibility — uses gemini-2.5-flash for higher token limit / synthesis
export function getGeminiPro(config) {
  const modelName = config?.configurable?.model || 'gemini-2.5-flash'
  return new ChatGoogleGenerativeAI({
    model: modelName,
    apiKey: getGeminiKey(config),
    temperature: 0.2,
    maxOutputTokens: 4096,
  })
}

export async function callGemini(model, systemPrompt, userMessage, retries = 2, initialDelay = 500) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'human', content: userMessage },
  ]
  let lastError
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await model.invoke(messages)
      return response.content
    } catch (err) {
      lastError = err
      const isRateLimit = err.message?.includes('429') ||
                          err.message?.includes('Quota exceeded') ||
                          err.message?.includes('Too Many Requests') ||
                          err.message?.includes('503') ||
                          err.message?.includes('Service Unavailable') ||
                          err.message?.includes('high demand')
      console.warn(`Gemini call failed (attempt ${attempt}/${retries}): ${err.message}`)

      const isDailyQuota = err.message?.includes('per day') ||
                            err.message?.includes('GenerateRequestsPerDay') ||
                            err.message?.includes('RESOURCE_EXHAUSTED')

      // Daily quota is exhausted — no point retrying, fail fast with a clear message
      if (isDailyQuota) {
        throw new Error(
          'Gemini free tier daily quota exhausted (20 requests/day). ' +
          'Your quota resets at midnight Pacific time. ' +
          'To remove this limit, add a paid API key in Settings.'
        )
      }

      if (attempt < retries) {
        // Jitter prevents all 5 parallel agents from retrying Gemini simultaneously after a 503
        const jitter = Math.random() * 3000
        const baseDelay = isRateLimit ? 5000 : (initialDelay * Math.pow(2, attempt - 1))
        const delay = baseDelay + jitter
        console.warn(`Backoff: waiting ${Math.round(delay)}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError
}

export function extractJSON(text) {
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ||
    text.match(/```\n?([\s\S]*?)\n?```/) ||
    text.match(/(\{[\s\S]*\})/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1] || jsonMatch[0])
    } catch {
      const startIdx = text.indexOf('{')
      const endIdx = text.lastIndexOf('}')
      if (startIdx !== -1 && endIdx !== -1) {
        return JSON.parse(text.slice(startIdx, endIdx + 1))
      }
    }
  }
  throw new Error('No valid JSON found in response')
}
