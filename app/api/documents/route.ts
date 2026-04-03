import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { docType, fields } = body

    const prompts: Record<string, string> = {
      contract: `Ты юрист-эксперт по российскому строительному праву. Составь договор строительного подряда на основе данных:
${JSON.stringify(fields, null, 2)}

Требования:
- Соответствие ГК РФ (глава 37)
- Все обязательные разделы: стороны, предмет, цена, сроки, права и обязанности, ответственность, порядок сдачи-приёмки, реквизиты
- Профессиональный юридический язык
- Готов к подписанию

Верни ТОЛЬКО текст договора без markdown.`,

      act: `Ты эксперт по строительной документации. Составь Акт о приёмке выполненных работ (форма КС-2) на основе данных:
${JSON.stringify(fields, null, 2)}

Требования:
- Соответствие постановлению Госкомстата России от 11.11.1999 №100
- Все обязательные поля формы КС-2
- Таблица выполненных работ с единицами измерения и стоимостью

Верни ТОЛЬКО текст акта без markdown.`,

      defect: `Ты эксперт по строительному контролю. Составь дефектную ведомость на основе данных:
${JSON.stringify(fields, null, 2)}

Требования:
- Профессиональный технический язык
- Таблица дефектов с описанием, объёмом работ и стоимостью устранения
- Подписи ответственных лиц

Верни ТОЛЬКО текст дефектной ведомости без markdown.`,

      tz: `Ты эксперт по строительному проектированию. Составь Техническое задание на строительство на основе данных:
${JSON.stringify(fields, null, 2)}

Требования:
- Соответствие ГОСТ 34.602-2020
- Все разделы: назначение объекта, требования к строительству, материалы, сроки, приёмка
- Профессиональный технический язык

Верни ТОЛЬКО текст технического задания без markdown.`,
    }

    const prompt = prompts[docType]
    if (!prompt) return NextResponse.json({ error: 'Неизвестный тип документа' }, { status: 400 })

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
    const text = data.choices[0].message.content

    return NextResponse.json({ text, docType })
  } catch (error) {
    console.error('Document generation error:', error)
    return NextResponse.json({ error: 'Ошибка при генерации документа' }, { status: 500 })
  }
}
