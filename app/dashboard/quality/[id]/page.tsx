'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const severityConfig = {
  low: { label: 'Низкая', color: '#6E6A5E', bg: 'rgba(110,106,94,0.08)', border: 'rgba(110,106,94,0.2)' },
  medium: { label: 'Средняя', color: '#C09070', bg: 'rgba(192,144,112,0.08)', border: 'rgba(192,144,112,0.25)' },
  high: { label: 'Высокая', color: '#E8A050', bg: 'rgba(232,160,80,0.08)', border: 'rgba(232,160,80,0.25)' },
  critical: { label: 'Критическая', color: '#E85050', bg: 'rgba(232,80,80,0.08)', border: 'rgba(232,80,80,0.25)' },
}

const statusConfig = {
  ok: { label: 'Нарушений не обнаружено', color: '#5E9E6E', bg: 'rgba(94,158,110,0.08)', border: 'rgba(94,158,110,0.25)' },
  warning: { label: 'Обнаружены нарушения', color: '#C09070', bg: 'rgba(192,144,112,0.08)', border: 'rgba(192,144,112,0.25)' },
  critical: { label: 'Критические нарушения', color: '#E85050', bg: 'rgba(232,80,80,0.08)', border: 'rgba(232,80,80,0.25)' },
}

export default function QualityDetailPage({ params }: { params: { id: string } }) {
  const [check, setCheck] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('dark')
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    loadCheck()
  }, [])

  const loadCheck = async () => {
    const { data } = await supabase
      .from('quality_checks')
      .select('*')
      .eq('id', params.id)
      .single()
    if (data) setCheck(data)
    setLoading(false)
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('kern-theme', next)
  }

  const downloadReport = () => {
    if (!check) return
    const defects = check.defects || []
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Отчёт контроля качества</title><style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family: Arial, sans-serif; font-size: 12px; color: #1C1A14; padding: 32px; line-height: 1.6; } .header { display: flex; justify-content: space-between; margin-bottom: 24px; border-bottom: 2px solid #C09070; padding-bottom: 16px; } .logo { font-size: 24px; font-weight: 900; } .logo span { color: #C09070; } .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 16px; } .defect { border: 1px solid #E4E0D4; border-radius: 6px; padding: 14px; margin-bottom: 12px; } .defect-title { font-weight: 700; font-size: 13px; margin-bottom: 6px; } .defect-badge { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 3px; margin-left: 8px; } .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #6E6A5E; margin-bottom: 6px; margin-top: 16px; }</style></head><body>
    <div class="header"><div class="logo">Kern<span>.</span></div><div style="font-size:11px;color:#6E6A5E;text-align:right"><div>kern-eight.vercel.app</div><div>Акт осмотра</div><div>${new Date(check.created_at).toLocaleDateString('ru-RU')}</div></div></div>
    <div class="section-title">Объект</div>
    <div style="font-size:14px;font-weight:600;margin-bottom:12px">${check.object_description}</div>
    <div class="section-title">Статус</div>
    <div style="margin-bottom:16px;font-weight:600;color:${check.overall_status === 'ok' ? '#5E9E6E' : check.overall_status === 'critical' ? '#E85050' : '#C09070'}">${statusConfig[check.overall_status as keyof typeof statusConfig]?.label}</div>
    ${defects.length > 0 ? `<div class="section-title">Дефекты (${defects.length})</div>${defects.map((d: any) => `<div class="defect"><div class="defect-title">${d.title}<span class="defect-badge" style="background:${d.severity === 'critical' ? '#fef2f2' : '#fef9f0'};color:${d.severity === 'critical' ? '#E85050' : '#C09070'}">${severityConfig[d.severity as keyof typeof severityConfig]?.label || d.severity}</span></div><p style="color:#6E6A5E;font-size:11px;margin-bottom:6px">${d.description}</p>${d.location ? `<div style="font-size:11px"><b>Расположение:</b> ${d.location}</div>` : ''}<div style="font-size:11px;margin-top:6px;padding-top:6px;border-top:1px solid #E4E0D4"><b>Рекомендация:</b> ${d.recommendation}</div></div>`).join('')}` : '<div style="color:#5E9E6E;font-weight:600">Дефектов не обнаружено</div>'}
    <div class="section-title" style="margin-top:20px">Заключение</div>
    <p>${check.summary}</p>
    ${check.notes ? `<div class="section-title" style="margin-top:12px">Примечания</div><p style="color:#6E6A5E">${check.notes}</p>` : ''}
    </body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',color:'var(--muted)',fontFamily:"'DM Sans',sans-serif",fontSize:'14px'}}>Загружаем...</div>
  if (!check) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',color:'var(--muted)',fontFamily:"'DM Sans',sans-serif",fontSize:'14px'}}>Проверка не найдена</div>

  const defects = check.defects || []
  const status = statusConfig[check.overall_status as keyof typeof statusConfig]

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'20px',fontWeight:800,color:'var(--text)',textDecoration:'none'}}>Kern<span style={{color:'var(--accent)'}}>.</span></a>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <a href="/dashboard" style={{color:'var(--text)',fontSize:'13px',textDecoration:'none',border:'1px solid var(--border2)',borderRadius:'4px',padding:'6px 14px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--text)'}}>Кабинет</a>
          <button onClick={toggleTheme} style={{width:'42px',height:'23px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'12px',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}}>
            <span style={{fontSize:'10px',position:'absolute',left:'5px',pointerEvents:'none'}}>🌙</span>
            <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'var(--accent)',transition:'transform 0.3s',flexShrink:0,transform:theme==='light'?'translateX(19px)':'translateX(0)'}}></div>
            <span style={{fontSize:'10px',position:'absolute',right:'4px',pointerEvents:'none'}}>☀️</span>
          </button>
        </div>
      </nav>

      <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",padding:'80px 40px 80px',maxWidth:'900px',margin:'0 auto'}}>
        <a href="/dashboard" style={{color:'var(--muted)',fontSize:'13px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'5px',marginBottom:'40px'}}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Кабинет
        </a>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'16px',marginBottom:'32px',flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'8px'}}>Контроль качества</div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(20px,3vw,28px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'6px',lineHeight:1.2}}>{check.object_description}</h1>
            <div style={{color:'var(--muted)',fontSize:'13px'}}>{new Date(check.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</div>
          </div>
          <button onClick={downloadReport} style={{background:'var(--accent)',color:'var(--btn-text)',border:'none',borderRadius:'4px',padding:'10px 20px',fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:700,cursor:'pointer',flexShrink:0}}>
            Скачать PDF
          </button>
        </div>

        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px',marginBottom:'20px'}}>
          <div style={{fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'10px'}}>Общий статус</div>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'8px 16px',borderRadius:'4px',background:status?.bg,border:`1px solid ${status?.border}`}}>
            <div style={{width:'7px',height:'7px',borderRadius:'50%',background:status?.color,flexShrink:0}}></div>
            <span style={{color:status?.color,fontSize:'14px',fontWeight:600}}>{status?.label}</span>
          </div>
        </div>

        {defects.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',marginBottom:'20px'}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'16px',fontWeight:700,color:'#5E9E6E'}}>Дефектов не обнаружено</div>
          </div>
        ) : (
          <div style={{marginBottom:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>Дефекты</span>
              <span style={{fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:700,color:'var(--accent)'}}>{defects.length} {defects.length === 1 ? 'дефект' : defects.length < 5 ? 'дефекта' : 'дефектов'}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {defects.map((defect: any, i: number) => {
                const cfg = severityConfig[defect.severity as keyof typeof severityConfig]
                return (
                  <div key={i} style={{border:`1px solid ${cfg?.border}`,borderRadius:'8px',padding:'18px 20px',background:cfg?.bg}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px',marginBottom:'8px'}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'14px',fontWeight:700}}>{defect.title}</div>
                      <span style={{fontSize:'11px',color:cfg?.color,border:`1px solid ${cfg?.border}`,padding:'2px 8px',borderRadius:'3px',whiteSpace:'nowrap',letterSpacing:'0.05em',textTransform:'uppercase',flexShrink:0}}>{cfg?.label}</span>
                    </div>
                    <p style={{color:'var(--muted)',fontSize:'13px',lineHeight:1.55,marginBottom:'10px'}}>{defect.description}</p>
                    {defect.location && <div style={{fontSize:'12px',color:'var(--muted)',marginBottom:'6px'}}><span style={{color:'var(--text)',fontWeight:500}}>Расположение:</span> {defect.location}</div>}
                    <div style={{fontSize:'12px',color:'var(--muted)',paddingTop:'10px',borderTop:`1px solid ${cfg?.border}`}}><span style={{color:'var(--text)',fontWeight:500}}>Рекомендация:</span> {defect.recommendation}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px',marginBottom:'16px'}}>
          <div style={{fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Заключение</div>
          <div style={{fontSize:'14px',lineHeight:1.65}}>{check.summary}</div>
        </div>

        {check.notes && (
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px'}}>
            <div style={{fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Примечания</div>
            <div style={{color:'var(--muted)',fontSize:'13px',lineHeight:1.6}}>{check.notes}</div>
          </div>
        )}
      </div>
    </>
  )
}
