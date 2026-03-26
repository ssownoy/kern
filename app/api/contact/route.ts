import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, phone, company, module, comment } = await req.json()

    await resend.emails.send({
      from: 'Kern <onboarding@resend.dev>',
      to: 'ssownoy@gmail.com',
      subject: `Новая заявка от ${name} — ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 8px;">Kern<span style="color: #C09070;">.</span></h1>
          <p style="color: #6E6A5E; font-size: 13px; margin-bottom: 32px;">Новая заявка с сайта</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #E4E0D4;">
              <td style="padding: 12px 0; color: #6E6A5E; font-size: 13px; width: 140px;">Имя</td>
              <td style="padding: 12px 0; font-size: 14px; font-weight: 600;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E4E0D4;">
              <td style="padding: 12px 0; color: #6E6A5E; font-size: 13px;">Телефон</td>
              <td style="padding: 12px 0; font-size: 14px; font-weight: 600;">${phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E4E0D4;">
              <td style="padding: 12px 0; color: #6E6A5E; font-size: 13px;">Компания</td>
              <td style="padding: 12px 0; font-size: 14px; font-weight: 600;">${company}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E4E0D4;">
              <td style="padding: 12px 0; color: #6E6A5E; font-size: 13px;">Модуль</td>
              <td style="padding: 12px 0; font-size: 14px; font-weight: 600;">${module}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #6E6A5E; font-size: 13px;">Комментарий</td>
              <td style="padding: 12px 0; font-size: 14px;">${comment || '—'}</td>
            </tr>
          </table>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact error:', error)
    return NextResponse.json({ error: 'Ошибка отправки' }, { status: 500 })
  }
}
