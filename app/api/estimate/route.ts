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

    const basePrompt = `Ты профессиональный сметчик в России. Проанализируй строительный чертёж.

${params}

ПРАВИЛА:
- Применяй региональные цены и территориальные расценки (ТЕР) для указанного региона
- Учитывай группу грунтов при расчёте земляных работ и фундаментов
- Применяй коэффициенты условий работ согласно параметрам
- Учитывай климатический район при расчёте конструкций
- Если указано зимнее удорожание — добавь соответствующие затраты по Приказу №325/пр
- Если указаны временные здания — добавь затраты по Приказу №332/пр
- Используй метод составления: ${estimateMethod}
- Цены реалистичные, не округляй до миллионов

Верни ТОЛЬКО валидный JSON без markdown:
{"summary":"описание объекта","items":[{"name":"наименование","unit":"ед.","qty":число,"price":цена,"total":итого}],"total_rub":общая сумма,"notes":"замечания и применённые коэффициенты"}`

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
