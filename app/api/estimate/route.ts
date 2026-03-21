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

    if (!file) {
      return NextResponse.json({ error: 'Файл не загружен' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const prompt = withMaterials
      ? `Ты профессиональный сметчик в России. Проанализируй строительный чертёж или фото объекта.

ПРАВИЛА РАСЧЁТА:
- Используй актуальные рыночные цены для региона: ${region}
- Цены должны быть реалистичными и конкретными, не округляй до миллионов
- Считай объёмы работ строго по чертежу, не преувеличивай
- Для каждой позиции укажи конкретный материал с маркой и производителем

Верни ТОЛЬКО валидный JSON без markdown:
{"summary":"описание объекта 1-2 предложения","items":[{"name":"наименование работы или материала","unit":"ед. изм.","qty":число,"price":цена за единицу в рублях,"total":итого в рублях}],"total_rub":общая сумма,"notes":"замечания"}`
      : `Ты профессиональный сметчик в России. Проанализируй строительный чертёж или фото объекта.

ПРАВИЛА РАСЧЁТА:
- Используй актуальные рыночные цены для региона: ${region}
- Цены должны быть реалистичными и конкретными, не округляй до миллионов
- Считай объёмы работ строго по чертежу, не преувеличивай
- Включай только работы которые явно видны на чертеже

Верни ТОЛЬКО валидный JSON без markdown:
{"summary":"описание объекта 1-2 предложения","items":[{"name":"наименование работы","unit":"ед. изм.","qty":число,"price":цена за единицу в рублях,"total":итого в рублях}],"total_rub":общая сумма,"notes":"замечания"}`

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
