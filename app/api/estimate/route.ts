import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'ssownoy@gmail.com'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const authHeader = req.headers.get('authorization')
    let userId: string | null = null
    let isAdmin = false
    let isPro = false

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        userId = user.id
        isAdmin = user.email === ADMIN_EMAIL

        if (!isAdmin) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (profile) {
            isPro = profile.is_pro

            if (!isPro) {
              const resetDate = new Date(profile.estimates_reset_at)
              const now = new Date()
              const diffDays = (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24)

              if (diffDays > 30) {
                await supabase.from('profiles').update({
                  estimates_used: 0,
                  estimates_reset_at: now.toISOString()
                }).eq('id', userId)
              } else if (profile.estimates_used >= 5) {
                return NextResponse.json({ error: 'Лимит 5 смет в месяц исчерпан. Перейдите на тариф Профи.' }, { status: 403 })
              }
            }
          }
        }
      }
    }

    const formData = await req.formData()
    const file = formData.get('drawing') as File | null
    const withMaterials = formData.get('withMaterials') === 'true'
    const region = formData.get('region') as string || 'Москва'
    const soilGroup = formData.get('soilGroup') as string || 'II'
    const workConditions = formData.get('workConditions') as string || 'normal'
    const climateZone = formData.get('climateZone') as string || 'II'
    const workPeriod = formData.get('workPeriod') as string || 'summer'
    const includeWinter = formData.get('includeWinter') === 'true'
    const includeTempBuildings = formData.get('includeTempBuildings') === 'true'
    const estimateMethod = formData.get('estimateMethod') as string || 'resource'
    const objectType = formData.get('objectType') as string || 'cottage'
    const hasLandscaping = formData.get('hasLandscaping') === 'true'
    const specialConditions = formData.get('specialConditions') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'Файл не загружен' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const params = `
ПАРАМЕТРЫ СМЕТЫ:
- Регион: ${region}
- Тип объекта: ${objectType}
- Группа грунтов: ${soilGroup}
- Климатический район: ${climateZone}
- Условия работ: ${workConditions}
- Период выполнения: ${workPeriod}
- Метод составления: ${estimateMethod}
- Зимнее удорожание (325/пр): ${includeWinter ? 'включить' : 'не включать'}
- Временные здания (332/пр): ${includeTempBuildings ? 'включить' : 'не включать'}
- Озеленение ГЭСН 47: ${hasLandscaping ? 'включить' : 'не включать'}
${specialConditions ? `- Особые условия: ${specialConditions}` : ''}
`

    const basePrompt = `Ты профессиональный сметчик с 20-летним опытом в России. Анализируй строительный чертёж или фото СТРОГО и ТОЧНО.

${params}

ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА:
1. Считай объёмы ТОЛЬКО по видимым элементам чертежа — не придумывай
2. Используй РЕАЛЬНЫЕ рыночные цены ${region} на 2025-2026 год
3. Цены должны быть КОНКРЕТНЫМИ — не округляй до сотен тысяч
4. Каждая позиция должна иметь обоснование (что именно видно на чертеже)
5. Разбивай на разделы: земляные работы, фундамент, стены, перекрытия, кровля, отделка, инженерные системы
6. Применяй коэффициенты: грунт ${params.includes('soilGroup') ? soilGroup : 'II группы'}, климат ${climateZone} района
7. НЕ завышай объёмы — лучше недооценить чем переоценить
8. Итоговая сумма должна быть РЕАЛИСТИЧНОЙ для данного типа объекта в ${region}

ФОРМАТ ОТВЕТА — ТОЛЬКО валидный JSON без markdown:
{
  "summary": "точное описание объекта — тип, этажность, площадь если видно",
  "items": [
    {
      "name": "конкретное наименование работы",
      "unit": "единица измерения",
      "qty": число,
      "price": цена за единицу в рублях,
      "total": qty * price
    }
  ],
  "total_rub": сумма всех total,
  "notes": "применённые коэффициенты, допущения, что не учтено"
}`

    const prompt = withMaterials 
      ? basePrompt + '\n\nДополнительно: для каждой позиции укажи конкретный материал с маркой и производителем.'
      : basePrompt

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
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } },
            ],
          },
        ],
      }),
    })

    const data = await response.json()
    const text = data.choices[0].message.content.replace(/```json|```/g, '').trim()
    const estimate = JSON.parse(text)

    if (userId && !isAdmin && !isPro) {
      await supabase.from('profiles')
        .update({ estimates_used: supabase.rpc('increment', { x: 1 }) })
        .eq('id', userId)

      await supabase.from('estimates').insert({
        user_id: userId,
        summary: estimate.summary,
        total_rub: estimate.total_rub,
        items: estimate.items,
        notes: estimate.notes,
        with_materials: withMaterials,
      })
    }

    return NextResponse.json(estimate)
  } catch (error) {
    console.error('Estimate error:', error)
    return NextResponse.json({ error: 'Ошибка при анализе файла' }, { status: 500 })
  }
}
