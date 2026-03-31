'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function QualityPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QualityResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

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

      const res = await fetch('/api/quality', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      
      if (user) {
        await supabase.from('quality_checks').insert({
          user_id: user.id,
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

  const severityConfig = {
    low: { label: 'Низкая', color: '#6E6A5E', bg: 'rgba(110,106,94,0.1)', border: 'rgba(110,106,94,0.3)' },
    medium: { label: 'Средняя', color: '#C09070', bg: 'rgba(192,144,112,0.1)', border: 'rgba(192,144,112,0.3)' },
    high: { label: 'Высокая', color: '#E8A050', bg: 'rgba(232,160,80,0.1)', border: 'rgba(232,160,80,0.3)' },
    critical: { label: 'Критическая', color: '#E85050', bg: 'rgba(232,80,80,0.1)', border: 'rgba(232,80,80,0.3)' },
  }

  const statusConfig = {
    ok: { label: 'Нарушений не обнаружено', color: '#6E9E6E', bg: 'rgba(110,158,110,0.1)', border: 'rgba(110,158,110,0.3)' },
    warning: { label: 'Обнаружены нарушения', color: '#C09070', bg: 'rgba(192,144,112,0.1)', border: 'rgba(192,144,112,0.3)' },
    critical: { label: 'Критические нарушения', color: '#E85050', bg: 'rgba(232,80,80,0.1)', border: 'rgba(232,80,80,0.3)' },
  }

  if (!mounted) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .quality-nav { padding: 14px 16px !important; }
          .quality-container { padding: 90px 16px 60px !important; }
        }
      `}</style>

      <nav className="quality-nav" style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 52px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'22px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>
          Kern<span style={{color:'var(--accent)'}}>.</span>
        </a>
        <button onClick={toggleTheme} style={{width:'42px',height:'23px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'12px',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}}>
          <span style={{fontSize:'10px',position:'absolute',pointerEvents:'none',left:'5px'}}>🌙</span>
          <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'var(--accent)',transition:'transform 0.3s',flexShrink:0,transform:theme==='light'?'translateX(19px)':'translateX(0)'}}></div>
          <span style={{fontSize:'10px',position:'absolute',pointerEvents:'none',right:'4px'}}>☀️</span>
        </button>
      </nav>

      <div className="quality-container" style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",padding:'120px 52px 80px'}}>
        <div style={{maxWidth:'900px',margin:'0 auto'}}>

          <a href="/" style={{color:'var(--muted)',fontSize:'14px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'6px',marginBottom:'48px'}}>← Назад</a>

          <span style={{fontSize:'11px',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'14px',display:'block'}}>Модуль 02</span>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(36px,5vw,64px)',fontWeight:800,letterSpacing:'-0.03em',lineHeight:1,marginBottom:'16px'}}>Контроль качества</h1>
          <p style={{color:'var(--muted)',fontSize:'17px',fontWeight:300,marginBottom:'52px',maxWidth:'500px'}}>Загрузите фото строительного объекта — AI найдёт дефекты и нарушения норм.</p>

          <div
            style={{border:'1px dashed var(--border2)',borderRadius:'8px',padding:'48px',textAlign:'center',marginBottom:'16px',background:'var(--card-bg)',cursor:'pointer'}}
            onClick={() => document.getElementById('photoInput')?.click()}
          >
            <input id="photoInput" type="file" accept="image/*" style={{display:'none'}} onChange={e => setFile(e.target.files?.[0] || null)} />
            {file ? (
              <div>
                {file.type.startsWith('image/') && (
                  <img src={URL.createObjectURL(file)} alt="preview" style={{maxHeight:'240px',maxWidth:'100%',borderRadius:'6px',objectFit:'contain',marginBottom:'12px'}} />
                )}
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'4px'}}>{file.name}</div>
                <div style={{color:'var(--muted)',fontSize:'13px',marginBottom:'8px'}}>{(file.size / 1024).toFixed(0)} KB</div>
                <button onClick={e => { e.stopPropagation(); setFile(null); const input = document.getElementById('photoInput') as HTMLInputElement; if(input) input.value='' }} style={{fontSize:'12px',color:'var(--muted)',background:'none',border:'1px solid var(--border2)',borderRadius:'4px',padding:'4px 12px',cursor:'pointer'}}>Удалить</button>
              </div>
            ) : (
              <div>
                <div style={{fontSize:'40px',marginBottom:'12px'}}>📸</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'8px'}}>Загрузите фото объекта</div>
                <div style={{color:'var(--muted)',fontSize:'13px'}}>PNG, JPG — фото строительных работ, конструкций, материалов</div>
              </div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={!file || loading} style={{width:'100%',padding:'16px',borderRadius:'4px',background:file && !loading ? 'var(--accent)' : 'var(--border2)',color:file && !loading ? 'var(--btn-text)' : 'var(--muted)',border:'none',fontFamily:"'Syne',sans-serif",fontSize:'15px',fontWeight:700,cursor:file && !loading ? 'pointer' : 'not-allowed',transition:'all 0.2s',marginBottom:'48px'}}>
            {loading ? (
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                <span style={{width:'18px',height:'18px',border:'2px solid var(--btn-text)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}></span>
                Анализируем фото...
              </span>
            ) : 'Проверить качество'}
          </button>

          {error && (
            <div style={{background:'rgba(255,80,80,0.1)',border:'1px solid rgba(255,80,80,0.3)',borderRadius:'6px',padding:'16px',color:'#ff8080',marginBottom:'32px'}}>
              {error}
            </div>
          )}

          {result && (
            <div>
              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'32px',marginBottom:'24px'}}>
                <div style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Объект</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:'18px',fontWeight:700,marginBottom:'16px'}}>{result.object_description}</div>
                <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'8px 16px',borderRadius:'4px',background:statusConfig[result.overall_status].bg,border:`1px solid ${statusConfig[result.overall_status].border}`}}>
                  <span style={{width:'8px',height:'8px',borderRadius:'50%',background:statusConfig[result.overall_status].color,flexShrink:0}}></span>
                  <span style={{color:statusConfig[result.overall_status].color,fontSize:'14px',fontWeight:600}}>{statusConfig[result.overall_status].label}</span>
                </div>
              </div>

              {result.defects.length === 0 ? (
                <div style={{textAlign:'center',padding:'48px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',marginBottom:'24px'}}>
                  <div style={{fontSize:'48px',marginBottom:'16px'}}>✅</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:'20px',fontWeight:700}}>Дефектов не обнаружено</div>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'16px',marginBottom:'24px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>Обнаруженные дефекты</span>
                    <span style={{fontFamily:"'Syne',sans-serif",fontSize:'14px',fontWeight:700,color:'var(--accent)'}}>{result.defects.length} {result.defects.length === 1 ? 'дефект' : result.defects.length < 5 ? 'дефекта' : 'дефектов'}</span>
                  </div>
                  {result.defects.map((defect, i) => {
                    const cfg = severityConfig[defect.severity]
                    return (
                      <div key={i} style={{border:`1px solid ${cfg.border}`,borderRadius:'8px',padding:'24px',background:cfg.bg}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px',marginBottom:'12px'}}>
                          <div style={{fontFamily:"'Syne',sans-serif",fontSize:'16px',fontWeight:700}}>{defect.title}</div>
                          <span style={{fontSize:'11px',color:cfg.color,border:`1px solid ${cfg.border}`,padding:'3px 10px',borderRadius:'2px',whiteSpace:'nowrap',letterSpacing:'0.06em',textTransform:'uppercase',flexShrink:0}}>{cfg.label}</span>
                        </div>
                        <p style={{color:'var(--muted)',fontSize:'14px',lineHeight:1.6,marginBottom:'12px'}}>{defect.description}</p>
                        {defect.location && (
                          <div style={{fontSize:'13px',color:'var(--muted)',marginBottom:'8px'}}>
                            <span style={{color:'var(--text)',fontWeight:500}}>Расположение:</span> {defect.location}
                          </div>
                        )}
                        <div style={{fontSize:'13px',color:'var(--muted)',paddingTop:'12px',borderTop:`1px solid ${cfg.border}`}}>
                          <span style={{color:'var(--text)',fontWeight:500}}>Рекомендация:</span> {defect.recommendation}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'24px 32px',marginBottom:'24px'}}>
                <div style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Заключение</div>
                <div style={{fontSize:'15px',lineHeight:1.7}}>{result.summary}</div>
              </div>

              {result.notes && (
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'24px 32px'}}>
                  <div style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Примечания</div>
                  <div style={{color:'var(--muted)',fontSize:'14px',lineHeight:1.6,fontWeight:300}}>{result.notes}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
