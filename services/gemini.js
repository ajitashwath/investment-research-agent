import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { getGeminiKey } from './keys.js'

export function getGeminiFlash(config) {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash-lite',
    apiKey: getGeminiKey(config),
    temperature: 0.3,
    maxOutputTokens: 8192,
  })
}

export function getGeminiPro(config, customModel) {
  return new ChatGoogleGenerativeAI({
    model: customModel || 'gemini-2.5-flash-lite',
    apiKey: getGeminiKey(config),
    temperature: 0.2,
    maxOutputTokens: 8192,
  })
}

export async function callGemini(model, systemPrompt, userMessage, retries = 3, initialDelay = 1000) {
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
      const isRateLimit = err.message?.includes('429') || err.message?.includes('Quota exceeded') || err.message?.includes('Too Many Requests')
      console.warn(`Gemini call failed (attempt ${attempt}/${retries}): ${err.message}`)
      if (attempt < retries) {
        // If rate limit/quota failure, backoff for 15 seconds to allow requests-per-minute quota to refresh
        const delay = isRateLimit ? 15000 : (initialDelay * Math.pow(2, attempt - 1))
        console.warn(`Rate limit/error backoff: waiting ${delay}ms before retrying Gemini...`)
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
