import { createGroq } from '@ai-sdk/groq'

export function assistantModel() {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured.')
  }

  const groq = createGroq({ apiKey })
  const model = process.env.ASSISTANT_MODEL || 'llama-3.3-70b-versatile'
  return groq(model)
}
