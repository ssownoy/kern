import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('photo') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Фото не загружено' }, { status: 400 })
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
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Ты эксперт по строительному контролю качества в России. Проанализируй фото строительного объекта.

Найди все видимые дефекты, нарушения и отклонения от норм. Для каждого дефекта укажи степень критичности.

Верни ТОЛЬКО валидный JSON без markdown:
{
  "object_description": "краткое описание что на фото",
  "overall_status": "ok" | "warning" | "critical",
  "defects": [
    {
      "title": "название дефекта",
      "description": "подробное описание",
      "severity": "low" | "medium" | "high" | "critical",
      "location": "где на фото",
      "recommendation": "что делать"
    }
  ],
  "summary": "общее заключение",
  "notes": "дополнительные замечания"
}

Если дефектов нет — верни пустой массив defects и overall_status "ok".`
              },
              {
                type: 'image_url',
                image_url: { url: `data:${file.type};base64,${base64}` }
              }
            ]
          }
        ]
      })
    })

    const data = await response.json()
    const text = data.choices[0].message.content.replace(/```json|```/g, '').trim()
    const result = JSON.parse(text)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Quality check error:', error)
    return NextResponse.json({ error: 'Ошибка при анализе фото' }, { status: 500 })
  }
}
