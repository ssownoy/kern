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

    if (!file) {
      return NextResponse.json({ error: 'Файл не загружен' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const prompt = withMaterials
      ? 'Ты опытный сметчик в России. Проанализируй этот строительный чертёж или фото объекта. Составь подробную смету в рублях по актуальным рыночным ценам 2025-2026 года. Для каждой позиции подбери конкретные материалы с указанием марки, производителя и артикула где возможно. Включи стоимость материалов в смету отдельными строками. Верни ТОЛЬКО валидный JSON без markdown и комментариев: {"summary":"краткое описание объекта","items":[{"name":"наименование","unit":"ед.","qty":0,"price":0,"total":0}],"total_rub":0,"notes":"замечания"}'
      : 'Ты опытный сметчик в России. Проанализируй этот строительный чертёж или фото объекта. Составь подробную смету в рублях по актуальным рыночным ценам 2025-2026 года. Верни ТОЛЬКО валидный JSON без markdown и комментариев: {"summary":"краткое описание объекта","items":[{"name":"наименование","unit":"ед.","qty":0,"price":0,"total":0}],"total_rub":0,"notes":"замечания"}'

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
