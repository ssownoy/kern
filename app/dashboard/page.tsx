'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface EstimateRecord {
  id: string
  summary: string
  total_rub: number
  with_materials: boolean
  created_at: string
}

export default function DashboardPage() {
  const [estimates, setEstimates] = useState<EstimateRecord[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth')
        return
      }
      setUser(session.user)
      loadEstimates(session.user.id)
    })
  }, [])

  const loadEstimates = async (userId: string) => {
    const { data } = await supabase
      .from('estimates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (data) setEstimates(data)
    setLoading(false)
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('kern-theme', next)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const deleteEstimate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Удалить смету?')) return
    await supabase.from('estimates').delete().eq('id', id)
    setEstimates(estimates.filter(est => est.id !== id))
  }

  if (!mounted) return null

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 52px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'22px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>
          Kern<span style={{color:'var(--accent)'}}>.</span>
        </a>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <a href="/estimate" style={{color:'var(--muted)',fontSize:'14px',textDecoration:'none',transition:'color 0.2s'}}>Новая смета</a>
          <span style={{color:'var(--muted)',fontSize:'13px'}}>{user?.email}</span>
          <button onClick={handleSignOut} style={{color:'var(--muted)',fontSize:'13px',background:'none',border:'none',cursor:'pointer'}}>Выйти</button>
          <button onClick={toggleTheme} style={{width:'42px',height:'23px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'12px',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}}>
            <span style={{fontSize:'10px',position:'absolute',pointerEvents:'none',left:'5px'}}>🌙</span>
            <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'var(--accent)',transition:'transform 0.3s',flexShrink:0,transform:theme==='light'?'translateX(19px)':'translateX(0)'}}></div>
            <span style={{fontSize:'10px',position:'absolute',pointerEvents:'none',right:'4px'}}>☀️</span>
          </button>
        </div>
      </nav>

      <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",padding:'120px 52px 80px'}}>
        <div style={{maxWidth:'900px',margin:'0 auto'}}>
          
          <span style={{fontSize:'11px',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'14px',display:'block'}}>Личный кабинет</span>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(32px,4vw,52px)',fontWeight:800,letterSpacing:'-0.02em',marginBottom:'48px'}}>Мои сметы</h1>

          {loading ? (
            <div style={{color:'var(--muted)',fontSize:'15px'}}>Загрузка...</div>
          ) : estimates.length === 0 ? (
            <div style={{textAlign:'center',padding:'80px 0'}}>
              <div style={{fontSize:'48px',marginBottom:'20px'}}>📐</div>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:'22px',fontWeight:700,marginBottom:'12px'}}>Смет пока нет</h2>
              <p style={{color:'var(--muted)',fontSize:'15px',marginBottom:'32px'}}>Загрузите чертёж и получите первую смету за 30 секунд</p>
              <a href="/estimate" style={{background:'var(--accent)',color:'var(--btn-text)',padding:'14px 32px',borderRadius:'4px',textDecoration:'none',fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'15px'}}>
                Создать смету
              </a>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'1px',background:'var(--border)',border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden'}}>
              {estimates.map((est, i) => (
                <div key={est.id} onClick={() => router.push(`/dashboard/${est.id}`)} style={{background:'var(--bg)',padding:'24px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'24px',transition:'background 0.2s',cursor:'pointer'}}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--card-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = 'var(--bg)'}
                >
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:'15px',fontWeight:700,marginBottom:'6px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {est.summary || 'Без описания'}
                    </div>
                    <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
                      <span style={{color:'var(--muted)',fontSize:'13px'}}>
                        {new Date(est.created_at).toLocaleDateString('ru-RU', {day:'numeric',month:'long',year:'numeric'})}
                      </span>
                      {est.with_materials && (
                        <span style={{fontSize:'11px',color:'var(--accent)',border:'1px solid var(--tag-border)',background:'var(--tag-bg)',padding:'2px 8px',borderRadius:'2px',letterSpacing:'0.06em'}}>
                          С материалами
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:'20px',fontWeight:800,color:'var(--accent)',whiteSpace:'nowrap'}}>
                      {est.total_rub?.toLocaleString('ru-RU')} ₽
                    </div>
                    <button
                      onClick={(e) => deleteEstimate(est.id, e)}
                      style={{background:'none',border:'1px solid var(--border2)',borderRadius:'4px',color:'var(--muted)',cursor:'pointer',fontSize:'12px',padding:'4px 10px',fontFamily:"'Syne',sans-serif",flexShrink:0,transition:'all 0.2s'}}
                      onMouseOver={e => { e.currentTarget.style.borderColor='#ff8080'; e.currentTarget.style.color='#ff8080' }}
                      onMouseOut={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.color='var(--muted)' }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {estimates.length > 0 && (
            <div style={{marginTop:'32px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{color:'var(--muted)',fontSize:'14px'}}>Всего смет: {estimates.length}</span>
              <a href="/estimate" style={{background:'var(--accent)',color:'var(--btn-text)',padding:'12px 28px',borderRadius:'4px',textDecoration:'none',fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'14px'}}>
                Новая смета
              </a>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
