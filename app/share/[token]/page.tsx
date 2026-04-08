'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SharePage({ params }: { params: { token: string } }) {
  const [estimate, setEstimate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadEstimate()
  }, [])

  const loadEstimate = async () => {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('public_token', params.token)
      .eq('is_public', true)
      .single()

    if (error || !data) { setNotFound(true); setLoading(false); return }
    setEstimate(data)
    setLoading(false)
  }

  const items = estimate?.items || []
  const totalRub = items.reduce((sum: number, item: any) => sum + item.qty * item.price, 0)

  const downloadPDF = () => {
    if (!estimate) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Смета Kern</title><style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family: Arial, sans-serif; font-size: 12px; color: #1C1A14; padding: 32px; } .header { display: flex; justify-content: space-between; margin-bottom: 24px; border-bottom: 2px solid #C09070; padding-bottom: 16px; } .logo { font-size: 24px; font-weight: 900; } .logo span { color: #C09070; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } th { background: #C09070; color: #13120F; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; } td { padding: 8px 10px; border-bottom: 1px solid #E4E0D4; font-size: 11px; } tr:nth-child(even) td { background: #F5F2EA; } td:last-child, th:last-child { text-align: right; } td:nth-child(3), td:nth-child(4) { text-align: right; } .total { display: flex; justify-content: space-between; background: #13120F; color: #EAE6DC; padding: 16px 20px; border-radius: 6px; } .total-amount { font-size: 22px; font-weight: 900; color: #C09070; }</style></head><body><div class="header"><div class="logo">Kern<span>.</span></div><div style="font-size:11px;color:#6E6A5E;text-align:right"><div>kern-eight.vercel.app</div><div>${new Date().toLocaleDateString('ru-RU')}</div></div></div><div style="background:#F5F2EA;padding:16px;border-radius:6px;margin-bottom:20px"><div style="font-size:10px;text-transform:uppercase;color:#6E6A5E;margin-bottom:6px">Объект</div><div style="font-size:13px;font-weight:600">${estimate.summary}</div></div><table><thead><tr><th>Наименование</th><th>Ед.</th><th>Кол-во</th><th>Цена (₽)</th><th>Сумма (₽)</th></tr></thead><tbody>${items.map((item: any) => `<tr><td>${item.name}</td><td>${item.unit}</td><td>${item.qty}</td><td>${item.price.toLocaleString('ru-RU')}</td><td>${(item.qty * item.price).toLocaleString('ru-RU')}</td></tr>`).join('')}</tbody></table><div class="total"><div style="font-size:14px;font-weight:600">Итого</div><div class="total-amount">${totalRub.toLocaleString('ru-RU')} ₽</div></div></body></html>` 
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  if (!mounted || loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{color:'var(--muted)',fontSize:'14px'}}>Загружаем смету...</div>
    </div>
  )

  if (notFound) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--bg)',fontFamily:"'DM Sans',sans-serif",gap:'16px'}}>
      <div style={{fontFamily:"'Unbounded',sans-serif",fontSize:'48px',fontWeight:800,color:'var(--accent)'}}>404</div>
      <div style={{fontFamily:"'Unbounded',sans-serif",fontSize:'20px',fontWeight:700}}>Смета не найдена</div>
      <div style={{color:'var(--muted)',fontSize:'14px'}}>Ссылка недействительна или смета была закрыта</div>
      <a href="/" style={{marginTop:'8px',color:'var(--accent)',textDecoration:'none',fontSize:'14px'}}>← На главную</a>
    </div>
  )

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); @media (max-width:600px) { .share-container { padding: 80px 16px 60px !important; } .share-table { min-width: 480px !important; } }`}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Unbounded',sans-serif",fontSize:'20px',fontWeight:800,color:'var(--text)',textDecoration:'none'}}>Kern<span style={{color:'var(--accent)'}}>.</span></a>
        <a href="/estimate" style={{color:'var(--muted)',fontSize:'13px',textDecoration:'none',border:'1px solid var(--border2)',borderRadius:'4px',padding:'6px 14px',fontFamily:"'Unbounded',sans-serif",fontWeight:600,transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--muted)'}}>Создать смету</a>
      </nav>

      <div className="share-container" style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",padding:'80px 40px 80px',maxWidth:'900px',margin:'0 auto'}}>

        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'16px',marginBottom:'32px',flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'8px'}}>Смета · Kern AI</div>
            <h1 style={{fontFamily:"'Unbounded',sans-serif",fontSize:'clamp(20px,3vw,28px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'6px',lineHeight:1.2}}>{estimate.summary}</h1>
            <div style={{color:'var(--muted)',fontSize:'13px'}}>{new Date(estimate.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</div>
          </div>
          <button onClick={downloadPDF} style={{background:'var(--accent)',color:'var(--btn-text)',border:'none',borderRadius:'4px',padding:'10px 20px',fontFamily:"'Unbounded',sans-serif",fontSize:'13px',fontWeight:700,cursor:'pointer',flexShrink:0}}>
            Скачать PDF
          </button>
        </div>

        <div style={{border:'1px solid var(--border)',borderRadius:'8px',overflow:'auto',marginBottom:'20px'}}>
          <table className="share-table" style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'480px'}}>
            <thead>
              <tr style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}>
                {['Наименование','Ед.','Кол-во','Цена','Сумма'].map(h => (
                  <th key={h} style={{padding:'11px 16px',textAlign:h==='Наименование'?'left':'right',color:'var(--muted)',fontWeight:500,fontSize:'10px',letterSpacing:'0.08em',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <tr key={i} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'var(--bg)':'var(--bg2)'}}>
                  <td style={{padding:'10px 16px',color:'var(--text)'}}>{item.name}</td>
                  <td style={{padding:'10px 16px',textAlign:'right',color:'var(--muted)'}}>{item.unit}</td>
                  <td style={{padding:'10px 16px',textAlign:'right',color:'var(--muted)'}}>{item.qty}</td>
                  <td style={{padding:'10px 16px',textAlign:'right',color:'var(--muted)',whiteSpace:'nowrap'}}>{item.price.toLocaleString('ru-RU')} ₽</td>
                  <td style={{padding:'10px 16px',textAlign:'right',color:'var(--text)',fontWeight:500,whiteSpace:'nowrap'}}>{(item.qty*item.price).toLocaleString('ru-RU')} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{background:'var(--bg2)',borderTop:'1px solid var(--border)',padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'var(--muted)',fontSize:'12px'}}>Позиций: {items.length}</span>
            <span style={{fontFamily:"'Unbounded',sans-serif",fontSize:'15px',fontWeight:700}}>Итого: {totalRub.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px',marginBottom:'20px'}}>
          <span style={{fontFamily:"'Unbounded',sans-serif",fontSize:'15px',fontWeight:700}}>Итоговая стоимость</span>
          <span style={{fontFamily:"'Unbounded',sans-serif",fontSize:'24px',fontWeight:800,color:'var(--accent)'}}>{totalRub.toLocaleString('ru-RU')} ₽</span>
        </div>

        {estimate.notes && (
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px',marginBottom:'32px'}}>
            <div style={{fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Замечания</div>
            <div style={{color:'var(--muted)',fontSize:'13px',lineHeight:1.6}}>{estimate.notes}</div>
          </div>
        )}

        <div style={{textAlign:'center',padding:'24px',borderTop:'1px solid var(--border)'}}>
          <div style={{color:'var(--muted)',fontSize:'12px',marginBottom:'8px'}}>Смета создана с помощью</div>
          <a href="/" style={{fontFamily:"'Unbounded',sans-serif",fontSize:'18px',fontWeight:800,color:'var(--text)',textDecoration:'none'}}>Kern<span style={{color:'var(--accent)'}}>.</span></a>
          <div style={{color:'var(--muted)',fontSize:'12px',marginTop:'4px'}}>AI-платформа для строительной индустрии</div>
          <a href="/estimate" style={{display:'inline-block',marginTop:'12px',background:'var(--accent)',color:'var(--btn-text)',padding:'10px 24px',borderRadius:'4px',textDecoration:'none',fontFamily:"'Unbounded',sans-serif",fontSize:'13px',fontWeight:700}}>Создать свою смету →</a>
        </div>
      </div>
    </>
  )
}
