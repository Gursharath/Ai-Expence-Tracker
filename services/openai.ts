import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateFinancialInsights(data: any) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a financial AI assistant.'
      },
      {
        role: 'user',
        content: `Analyze this expense data: ${JSON.stringify(data)}`
      }
    ]
  })

  return completion.choices[0].message.content
}