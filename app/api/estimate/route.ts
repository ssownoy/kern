import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('drawing') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Файл не загружен' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Ты опытный сметчик в России. Проанализируй этот строительный чертёж или фото объекта. Составь подробную смету в рублях по актуальным рыночным ценам 2025-2026 года. Верни ТОЛЬКО валидный JSON без markdown и комментариев: {"summary":"краткое описание объекта","items":[{"name":"наименование","unit":"ед.","qty":0,"price":0,"total":0}],"total_rub":0,"notes":"замечания"}',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${file.type};base64,${base64}`,
                },
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()
    console.log('OpenRouter response:', JSON.stringify(data))
    const text = data.choices[0].message.content.replace(/```json|```/g, '').trim()
    const estimate = JSON.parse(text)

    return NextResponse.json(estimate)
  } catch (error) {
    console.error('Estimate error:', error)
    return NextResponse.json({ error: 'Ошибка при анализе файла' }, { status: 500 })
  }
}
