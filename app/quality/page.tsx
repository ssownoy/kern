'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Defect {
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: string
  recommendation: string
}

interface QualityResult {
  object_description: string
  overall_status: 'ok' | 'warning' | 'critical'
  defects: Defect[]
  summary: string
  notes: string
}

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

export default function QualityPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QualityResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {})
    supabase.auth.getSession()
    return () => subscription.unsubscribe()
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('kern-theme', next)
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await fetch('/api/quality', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await supabase.from('quality_checks').insert({
          user_id: session.user.id,
          object_description: data.object_description,
          overall_status: data.overall_status,
          defects: data.defects,
          summary: data.summary,
          notes: data.notes,
        })
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } @media (max-width:768px) { .qual-layout { flex-direction: column !important; } }`}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'clamp(12px, 2vw, 16px) clamp(16px, 4vw, 40px)',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Unbounded',sans-serif",fontSize:'20px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>Kern<span style={{color:'var(--accent)'}}>.</span></a>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <a href="/dashboard" style={{display:'flex',alignItems:'center',gap:'6px',color:'var(--text)',fontSize:'13px',textDecoration:'none',border:'1px solid var(--border2)',borderRadius:'4px',padding:'6px 14px',fontFamily:"'Unbounded',sans-serif",fontWeight:600,transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--text)'}}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Кабинет
          </a>
          <button onClick={toggleTheme} style={{width:'42px',height:'23px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'12px',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}}>
            <span style={{fontSize:'10px',position:'absolute',left:'5px',pointerEvents:'none'}}></span>
            <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'var(--accent)',transition:'transform 0.3s',flexShrink:0,transform:theme==='light'?'translateX(19px)':'translateX(0)'}}></div>
            <span style={{fontSize:'10px',position:'absolute',right:'4px',pointerEvents:'none'}}></span>
          </button>
        </div>
      </nav>

      <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",paddingTop:'64px'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto',padding:'48px 40px 80px'}}>

          <a href="/" style={{color:'var(--muted)',fontSize:'13px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'5px',marginBottom:'40px'}}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Назад
          </a>

          <div style={{marginBottom:'40px'}}>
            <div style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'10px'}}>Модуль 02</div>
            <h1 style={{fontFamily:"'Unbounded',sans-serif",fontSize:'clamp(28px,4vw,44px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'10px',lineHeight:1.1}}>Контроль качества</h1>
            <p style={{color:'var(--muted)',fontSize:'15px',fontWeight:300,maxWidth:'480px',lineHeight:1.6}}>Загрузите фото строительного объекта — AI найдёт дефекты, нарушения норм и даст рекомендации.</p>
          </div>

          <div className="qual-layout" style={{display:'flex',gap:'24px',alignItems:'flex-start'}}>

            {/* LEFT */}
            <div style={{flex:'0 0 380px',display:'flex',flexDirection:'column',gap:'12px'}}>
              <div
                onClick={() => document.getElementById('photoInput')?.click()}
                style={{border:'1px solid var(--border)',borderRadius:'8px',padding:'32px 24px',textAlign:'center',background:'var(--bg2)',cursor:'pointer',transition:'border-color 0.2s'}}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <input id="photoInput" type="file" accept="image/*" style={{display:'none'}} onChange={e => setFile(e.target.files?.[0] || null)} />
                {file ? (
                  <div>
                    {file.type.startsWith('image/') && <img src={URL.createObjectURL(file)} alt="preview" style={{maxHeight:'200px',maxWidth:'100%',borderRadius:'4px',objectFit:'contain',marginBottom:'10px'}} />}
                    <div style={{fontFamily:"'Unbounded',sans-serif",fontWeight:600,fontSize:'13px',marginBottom:'4px'}}>{file.name}</div>
                    <div style={{color:'var(--muted)',fontSize:'12px',marginBottom:'10px'}}>{(file.size / 1024).toFixed(0)} KB</div>
                    <button onClick={e => { e.stopPropagation(); setFile(null); const inp = document.getElementById('photoInput') as HTMLInputElement; if(inp) inp.value='' }} style={{fontSize:'12px',color:'var(--muted)',background:'none',border:'1px solid var(--border2)',borderRadius:'3px',padding:'3px 10px',cursor:'pointer'}}>Удалить</button>
                  </div>
                ) : (
                  <div>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{margin:'0 auto 12px',display:'block',color:'var(--muted)'}}>
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <div style={{fontFamily:"'Unbounded',sans-serif",fontWeight:600,fontSize:'14px',marginBottom:'4px'}}>Загрузить фото объекта</div>
                    <div style={{color:'var(--muted)',fontSize:'12px'}}>PNG, JPG — фото строительных работ</div>
                  </div>
                )}
              </div>

              <button onClick={handleSubmit} disabled={!file || loading} style={{width:'100%',padding:'14px',borderRadius:'6px',background:file && !loading ? 'var(--accent)' : 'var(--border2)',color:file && !loading ? 'var(--btn-text)' : 'var(--muted)',border:'none',fontFamily:"'Unbounded',sans-serif",fontSize:'14px',fontWeight:700,cursor:file && !loading ? 'pointer' : 'not-allowed',transition:'all 0.2s'}}>
                {loading ? (
                  <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                    <span style={{width:'16px',height:'16px',border:'2px solid var(--btn-text)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}></span>
                    Анализируем фото...
                  </span>
                ) : 'Проверить качество'}
              </button>

              {error && <div style={{background:'rgba(255,80,80,0.08)',border:'1px solid rgba(255,80,80,0.25)',borderRadius:'6px',padding:'12px',color:'#ff8080',fontSize:'13px'}}>{error}</div>}

              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px'}}>
                <div style={{fontFamily:"'Unbounded',sans-serif",fontWeight:600,fontSize:'13px',marginBottom:'12px'}}>Что анализирует AI</div>
                {['Трещины и деформации конструкций','Нарушения технологии работ','Отклонения от проекта','Дефекты материалов','Нарушения норм безопасности'].map(item => (
                  <div key={item} style={{display:'flex',alignItems:'flex-start',gap:'8px',marginBottom:'8px'}}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,marginTop:'1px'}}>
                      <circle cx="7" cy="7" r="6" stroke="var(--accent)" strokeWidth="1.2"/>
                      <path d="M4.5 7l1.8 1.8L9.5 5" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{color:'var(--muted)',fontSize:'13px'}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div style={{flex:1,minWidth:0}}>
              {!result && !loading && (
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'32px',minHeight:'300px',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center',gap:'16px'}}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{color:'var(--border2)'}}>
                    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div style={{fontFamily:"'Unbounded',sans-serif",fontWeight:600,fontSize:'15px',marginBottom:'6px'}}>Здесь появится отчёт</div>
                    <div style={{color:'var(--muted)',fontSize:'13px',lineHeight:1.5}}>Загрузите фото строительного объекта<br />и нажмите «Проверить качество»</div>
                  </div>
                </div>
              )}

              {result && (
                <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                  <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px'}}>
                    <div style={{fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'6px'}}>Объект</div>
                    <div style={{fontFamily:"'Unbounded',sans-serif",fontSize:'15px',fontWeight:700,marginBottom:'14px'}}>{result.object_description}</div>
                    <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'7px 14px',borderRadius:'4px',background:statusConfig[result.overall_status].bg,border:`1px solid ${statusConfig[result.overall_status].border}`}}>
                      <div style={{width:'7px',height:'7px',borderRadius:'50%',background:statusConfig[result.overall_status].color,flexShrink:0}}></div>
                      <span style={{color:statusConfig[result.overall_status].color,fontSize:'13px',fontWeight:600}}>{statusConfig[result.overall_status].label}</span>
                    </div>
                  </div>

                  {result.defects.length === 0 ? (
                    <div style={{textAlign:'center',padding:'40px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px'}}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{margin:'0 auto 12px',display:'block',color:'#5E9E6E'}}>
                        <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div style={{fontFamily:"'Unbounded',sans-serif",fontSize:'16px',fontWeight:700}}>Дефектов не обнаружено</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                        <span style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>Дефекты</span>
                        <span style={{fontFamily:"'Unbounded',sans-serif",fontSize:'13px',fontWeight:700,color:'var(--accent)'}}>{result.defects.length} {result.defects.length === 1 ? 'дефект' : result.defects.length < 5 ? 'дефекта' : 'дефектов'}</span>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                        {result.defects.map((defect, i) => {
                          const cfg = severityConfig[defect.severity]
                          return (
                            <div key={i} style={{border:`1px solid ${cfg.border}`,borderRadius:'8px',padding:'18px 20px',background:cfg.bg}}>
                              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px',marginBottom:'8px'}}>
                                <div style={{fontFamily:"'Unbounded',sans-serif",fontSize:'14px',fontWeight:700}}>{defect.title}</div>
                                <span style={{fontSize:'11px',color:cfg.color,border:`1px solid ${cfg.border}`,padding:'2px 8px',borderRadius:'3px',whiteSpace:'nowrap',letterSpacing:'0.05em',textTransform:'uppercase',flexShrink:0}}>{cfg.label}</span>
                              </div>
                              <p style={{color:'var(--muted)',fontSize:'13px',lineHeight:1.55,marginBottom:'10px'}}>{defect.description}</p>
                              {defect.location && <div style={{fontSize:'12px',color:'var(--muted)',marginBottom:'6px'}}><span style={{color:'var(--text)',fontWeight:500}}>Расположение:</span> {defect.location}</div>}
                              <div style={{fontSize:'12px',color:'var(--muted)',paddingTop:'10px',borderTop:`1px solid ${cfg.border}`}}><span style={{color:'var(--text)',fontWeight:500}}>Рекомендация:</span> {defect.recommendation}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px'}}>
                    <div style={{fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Заключение</div>
                    <div style={{fontSize:'14px',lineHeight:1.65}}>{result.summary}</div>
                  </div>

                  {result.notes && (
                    <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px'}}>
                      <div style={{fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Примечания</div>
                      <div style={{color:'var(--muted)',fontSize:'13px',lineHeight:1.6}}>{result.notes}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}