'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function EstimateDetailPage() {
  const [estimate, setEstimate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      loadEstimate(params.id as string)
    })
  }, [])

  const loadEstimate = async (id: string) => {
    const { data } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', id)
      .single()
    if (data) setEstimate(data)
    setLoading(false)
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('kern-theme', next)
  }

  const downloadPDF = () => {
    if (!estimate) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Смета Kern</title>
    <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; font-size: 12px; color: #1C1A14; padding: 32px; } .header { display: flex; justify-content: space-between; margin-bottom: 24px; border-bottom: 2px solid #C09070; padding-bottom: 16px; } .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; } .logo span { color: #C09070; } .date { color: #6E6A5E; font-size: 11px; text-align: right; } .summary { background: #F5F2EA; padding: 16px; border-radius: 6px; margin-bottom: 24px; } .summary-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6E6A5E; margin-bottom: 6px; } .summary-text { font-size: 13px; font-weight: 600; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } th { background: #C09070; color: #13120F; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; } td { padding: 8px 10px; border-bottom: 1px solid #E4E0D4; font-size: 11px; } tr:nth-child(even) td { background: #F5F2EA; } td:last-child, th:last-child { text-align: right; } td:nth-child(3), th:nth-child(3), td:nth-child(4), th:nth-child(4) { text-align: right; } .total { display: flex; justify-content: space-between; align-items: center; background: #13120F; color: #EAE6DC; padding: 16px 20px; border-radius: 6px; margin-bottom: 16px; } .total-label { font-size: 14px; font-weight: 600; } .total-amount { font-size: 24px; font-weight: 900; color: #C09070; } .notes { background: #F5F2EA; padding: 14px; border-radius: 6px; font-size: 10px; color: #6E6A5E; line-height: 1.6; } .notes-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }</style></head>
    <body>
    <div class="header"><div class="logo">Kern<span>.</span></div><div class="date"><div>AI-платформа для строительства</div><div>${new Date(estimate.created_at).toLocaleDateString('ru-RU')}</div></div></div>
    <div class="summary"><div class="summary-label">Объект</div><div class="summary-text">${estimate.summary}</div></div>
    <table><thead><tr><th>Наименование</th><th>Ед.</th><th>Кол-во</th><th>Цена (₽)</th><th>Сумма (₽)</th></tr></thead>
    <tbody>${estimate.items?.map((item: any) => `<tr><td>${item.name}</td><td>${item.unit}</td><td>${item.qty}</td><td>${item.price?.toLocaleString('ru-RU')}</td><td>${item.total?.toLocaleString('ru-RU')}</td></tr>`).join('')}</tbody></table>
    <div class="total"><div class="total-label">Итого</div><div class="total-amount">${estimate.total_rub?.toLocaleString('ru-RU')} ₽</div></div>
    ${estimate.notes ? `<div class="notes"><div class="notes-label">Замечания</div>${estimate.notes}</div>` : ''}
    </body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  if (!mounted || loading) return null

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 52px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'22px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>Kern<span style={{color:'var(--accent)'}}>.</span></a>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <a href="/dashboard" style={{color:'var(--muted)',fontSize:'14px',textDecoration:'none',transition:'color 0.2s'}}>← Мои сметы</a>
          <button onClick={toggleTheme} style={{width:'42px',height:'23px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'12px',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}}>
            <span style={{fontSize:'10px',position:'absolute',pointerEvents:'none',left:'5px'}}>🌙</span>
            <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'var(--accent)',transition:'transform 0.3s',flexShrink:0,transform:theme==='light'?'translateX(19px)':'translateX(0)'}}></div>
            <span style={{fontSize:'10px',position:'absolute',pointerEvents:'none',right:'4px'}}>☀️</span>
          </button>
        </div>
      </nav>

      <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",padding:'120px 52px 80px'}}>
        <div style={{maxWidth:'900px',margin:'0 auto'}}>
          
          <span style={{fontSize:'11px',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'14px',display:'block'}}>Смета</span>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(24px,3vw,36px)',fontWeight:800,letterSpacing:'-0.02em',marginBottom:'8px'}}>{estimate.summary}</h1>
          <p style={{color:'var(--muted)',fontSize:'14px',marginBottom:'48px'}}>{new Date(estimate.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</p>

          <div style={{border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden',marginBottom:'24px'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'14px'}}>
              <thead>
                <tr style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}>
                  <th style={{padding:'14px 20px',textAlign:'left',color:'var(--muted)',fontWeight:500,fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Наименование</th>
                  <th style={{padding:'14px 20px',textAlign:'center',color:'var(--muted)',fontWeight:500,fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Ед.</th>
                  <th style={{padding:'14px 20px',textAlign:'right',color:'var(--muted)',fontWeight:500,fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Кол-во</th>
                  <th style={{padding:'14px 20px',textAlign:'right',color:'var(--muted)',fontWeight:500,fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Цена</th>
                  <th style={{padding:'14px 20px',textAlign:'right',color:'var(--muted)',fontWeight:500,fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items?.map((item: any, i: number) => (
                  <tr key={i} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'var(--bg)':'var(--bg2)'}}>
                    <td style={{padding:'14px 20px',color:'var(--text)'}}>{item.name}</td>
                    <td style={{padding:'14px 20px',textAlign:'center',color:'var(--muted)'}}>{item.unit}</td>
                    <td style={{padding:'14px 20px',textAlign:'right',color:'var(--muted)'}}>{item.qty}</td>
                    <td style={{padding:'14px 20px',textAlign:'right',color:'var(--muted)'}}>{item.price?.toLocaleString('ru-RU')} ₽</td>
                    <td style={{padding:'14px 20px',textAlign:'right',color:'var(--text)',fontWeight:500}}>{item.total?.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'24px 32px',marginBottom:'24px'}}>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:'16px',fontWeight:700}}>Итого</span>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:'28px',fontWeight:800,color:'var(--accent)'}}>{estimate.total_rub?.toLocaleString('ru-RU')} ₽</span>
          </div>

          {estimate.notes && (
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'24px 32px',marginBottom:'24px'}}>
              <div style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Замечания</div>
              <div style={{color:'var(--muted)',fontSize:'14px',lineHeight:1.6,fontWeight:300}}>{estimate.notes}</div>
            </div>
          )}

          <button onClick={downloadPDF} style={{width:'100%',padding:'14px',borderRadius:'4px',background:'transparent',color:'var(--accent)',border:'1px solid var(--accent)',fontFamily:"'Syne',sans-serif",fontSize:'15px',fontWeight:600,cursor:'pointer',transition:'all 0.2s'}}>
            Скачать PDF
          </button>
        </div>
      </div>
    </>
  )
}
