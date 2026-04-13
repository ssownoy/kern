import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { materials, region } = body

    const prompt = `Ты эксперт по строительным материалам в России. Для каждого материала из списка дай актуальные рыночные цены в регионе ${region || 'Москва'} на 2025-2026 год.

Список материалов:
${materials.map((m: string, i: number) => `${i + 1}. ${m}`).join('\n')}

Для каждого материала укажи:
- Минимальная цена (эконом сегмент, отечественный производитель)
- Средняя цена (оптимальное соотношение цена/качество)
- Максимальная цена (премиум, импортный)
- Единица измерения
- Где купить в ${region || 'Москве'} (2-3 конкретных магазина или поставщика)
- Совет по выбору

Верни ТОЛЬКО валидный JSON без markdown:
{
  "region": "${region || 'Москва'}",
  "items": [
    {
      "name": "название материала",
      "unit": "единица измерения",
      "price_min": минимальная цена числом,
      "price_avg": средняя цена числом,
      "price_max": максимальная цена числом,
      "suppliers": ["поставщик 1", "поставщик 2"],
      "tip": "совет по выбору"
    }
  ]
}`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.choices[0].message.content.replace(/```json|```/g, '').trim()
    const result = JSON.parse(text)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Materials error:', error)
    return NextResponse.json({ error: 'Ошибка при анализе материалов' }, { status: 500 })
  }
}
