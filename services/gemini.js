import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

export function getGeminiFlash() {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash-lite',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.3,
    maxOutputTokens: 8192,
  })
}

export function getGeminiPro() {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash-lite',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.2,
    maxOutputTokens: 8192,
  })
}

export async function callGemini(model, systemPrompt, userMessage) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'human', content: userMessage },
  ]
  const response = await model.invoke(messages)
  return response.content
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
