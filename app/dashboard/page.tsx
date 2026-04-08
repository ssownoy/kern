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

type Tab = 'estimates' | 'quality' | 'documents' | 'profile'

export default function DashboardPage() {
  const [estimates, setEstimates] = useState<EstimateRecord[]>([])
  const [qualityChecks, setQualityChecks] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('estimates')
  const [showTabMenu, setShowTabMenu] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      loadAll(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadAll = async (userId: string) => {
    const [est, qual, docs, prof] = await Promise.all([
      supabase.from('estimates').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('quality_checks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('id', userId).single(),
    ])
    if (est.data) setEstimates(est.data)
    if (qual.data) setQualityChecks(qual.data)
    if (docs.data) setDocuments(docs.data)
    if (prof.data) setProfile(prof.data)
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

  const saveProfile = async () => {
    setProfileLoading(true)
    await supabase.from('profiles').update({ full_name: profile.full_name, phone: profile.phone }).eq('id', user.id)
    setProfileLoading(false)
    setEditingProfile(false)
  }

  const deleteEstimate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Удалить смету?')) return
    await supabase.from('estimates').delete().eq('id', id)
    setEstimates(estimates.filter(est => est.id !== id))
  }

  if (!mounted || loading) return null

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'estimates', label: 'Сметы', count: estimates.length },
    { key: 'quality', label: 'Контроль качества', count: qualityChecks.length },
    { key: 'documents', label: 'Документы', count: documents.length },
    { key: 'profile', label: 'Профиль', count: 0 },
  ]

  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '10px 14px', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: '14px', outline: 'none', width: '100%' }
  const labelStyle = { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--muted)', display: 'block', marginBottom: '6px' }

  const EmptyState = ({ icon, title, desc, href, linkLabel }: any) => (
    <div style={{textAlign:'center',padding:'80px 0',display:'flex',flexDirection:'column',alignItems:'center',gap:'16px'}}>
      <div style={{width:'56px',height:'56px',borderRadius:'12px',background:'var(--bg2)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>
        {icon}
      </div>
      <div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'18px',fontWeight:700,marginBottom:'6px'}}>{title}</div>
        <div style={{color:'var(--muted)',fontSize:'14px'}}>{desc}</div>
      </div>
      {href && <a href={href} style={{background:'var(--accent)',color:'var(--btn-text)',padding:'12px 28px',borderRadius:'4px',textDecoration:'none',fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'14px'}}>{linkLabel}</a>}
    </div>
  )

  const RowItem = ({ children, onClick }: any) => (
    <div onClick={onClick} style={{background:'var(--bg)',padding:'14px 16px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'12px',cursor:onClick?'pointer':'default',transition:'background 0.15s',borderBottom:'1px solid var(--border)',overflow:'hidden'}} onMouseOver={e => { if(onClick) e.currentTarget.style.background='var(--card-hover)' }} onMouseOut={e => e.currentTarget.style.background='var(--bg)'}>
      {children}
    </div>
  )

  const DeleteBtn = ({ onClick }: any) => (
    <button onClick={onClick} style={{background:'none',border:'1px solid var(--border2)',borderRadius:'3px',color:'var(--muted)',cursor:'pointer',fontSize:'12px',padding:'3px 10px',fontFamily:"'Syne',sans-serif",transition:'all 0.15s',whiteSpace:'nowrap',flexShrink:0}} onMouseOver={e=>{e.currentTarget.style.borderColor='#ff8080';e.currentTarget.style.color='#ff8080'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--muted)'}}>Удалить</button>
  )

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); @media (max-width:600px) { .dash-nav-items { display:none!important; } .dash-tabs { overflow-x:auto; } }`}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'20px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>Kern<span style={{color:'var(--accent)'}}>.</span></a>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div className="dash-nav-items" style={{display:'flex',gap:'8px'}}>
            <a href="/estimate" style={{color:'var(--muted)',fontSize:'13px',textDecoration:'none',padding:'6px 12px',borderRadius:'4px',transition:'all 0.15s'}} onMouseOver={e=>e.currentTarget.style.color='var(--text)'} onMouseOut={e=>e.currentTarget.style.color='var(--muted)'}>Сметчик</a>
            <a href="/quality" style={{color:'var(--muted)',fontSize:'13px',textDecoration:'none',padding:'6px 12px',borderRadius:'4px',transition:'all 0.15s'}} onMouseOver={e=>e.currentTarget.style.color='var(--text)'} onMouseOut={e=>e.currentTarget.style.color='var(--muted)'}>Контроль качества</a>
            <a href="/documents" style={{color:'var(--muted)',fontSize:'13px',textDecoration:'none',padding:'6px 12px',borderRadius:'4px',transition:'all 0.15s'}} onMouseOver={e=>e.currentTarget.style.color='var(--text)'} onMouseOut={e=>e.currentTarget.style.color='var(--muted)'}>Документы</a>
          </div>
          <button onClick={toggleTheme} style={{width:'42px',height:'23px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'12px',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}}>
            <span style={{fontSize:'10px',position:'absolute',left:'5px',pointerEvents:'none'}}></span>
            <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'var(--accent)',transition:'transform 0.3s',flexShrink:0,transform:theme==='light'?'translateX(19px)':'translateX(0)'}}></div>
            <span style={{fontSize:'10px',position:'absolute',right:'4px',pointerEvents:'none'}}></span>
          </button>
        </div>
      </nav>

      <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",paddingTop:'64px'}}>
        <div style={{maxWidth:'1000px',margin:'0 auto',padding:'48px 40px 80px'}}>

          {/* User card */}
          <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'40px',padding:'20px 24px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'10px'}}>
            <div style={{width:'44px',height:'44px',borderRadius:'10px',background:'var(--tag-bg)',border:'1px solid var(--tag-border)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontSize:'16px',fontWeight:700,color:'var(--accent)',flexShrink:0}}>
              {(profile.full_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'14px',fontWeight:700,marginBottom:'2px',wordBreak:'break-word'}}>{profile.full_name || user?.email}</div>
              <div style={{color:'var(--muted)',fontSize:'11px',lineHeight:1.5}}>{estimates.length} смет · {qualityChecks.length} проверок · {documents.length} документов</div>
            </div>
            <button onClick={handleSignOut} style={{color:'var(--muted)',fontSize:'12px',background:'none',border:'1px solid var(--border2)',borderRadius:'4px',padding:'5px 12px',cursor:'pointer',fontFamily:"'Syne',sans-serif",fontWeight:600,whiteSpace:'nowrap',transition:'all 0.15s'}} onMouseOver={e=>e.currentTarget.style.borderColor='var(--accent)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border2)'}>Выйти</button>
          </div>

          {/* Tabs */}
          <div style={{marginBottom:'24px'}}>
            {/* Desktop tabs */}
            <div style={{display:'flex',gap:'1px',background:'var(--border)',border:'1px solid var(--border)',borderRadius:'6px',overflow:'hidden'}} className="desktop-tabs">
              {tabs.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{flex:1,padding:'11px 8px',background:activeTab===tab.key?'var(--accent)':'var(--bg)',color:activeTab===tab.key?'var(--btn-text)':'var(--muted)',border:'none',cursor:'pointer',fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:600,transition:'all 0.15s',whiteSpace:'nowrap',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}>
                  {tab.label}
                  {tab.count > 0 && <span style={{fontSize:'11px',opacity:0.7}}>({tab.count})</span>}
                </button>
              ))}
            </div>
            
            {/* Mobile tabs - dropdown */}
            <div style={{position:'relative'}} className="mobile-tabs">
              <button
                onClick={() => setShowTabMenu(!showTabMenu)}
                style={{width:'100%',padding:'12px 16px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',fontFamily:"'Syne',sans-serif",fontSize:'14px',fontWeight:700,color:'var(--text)'}}
              >
                <span style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--accent)',flexShrink:0}}></span>
                  {tabs.find(t => t.key === activeTab)?.label}
                  {(tabs.find(t => t.key === activeTab)?.count || 0) > 0 && <span style={{color:'var(--muted)',fontSize:'12px',fontWeight:400}}>({tabs.find(t => t.key === activeTab)?.count})</span>}
                </span>
                <span style={{color:'var(--muted)',fontSize:'12px'}}>{showTabMenu ? '▲' : '▼'}</span>
              </button>
              {showTabMenu && (
                <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'0 0 6px 6px',zIndex:50,overflow:'hidden',marginTop:'-1px'}}>
                  {tabs.map(tab => (
                    <div key={tab.key} onClick={() => { setActiveTab(tab.key); setShowTabMenu(false) }}
                      style={{padding:'13px 16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid var(--border)',background:activeTab===tab.key?'var(--tag-bg)':'transparent',transition:'background 0.15s'}}
                      onMouseOver={e => e.currentTarget.style.background='var(--card-hover)'}
                      onMouseOut={e => e.currentTarget.style.background=activeTab===tab.key?'var(--tag-bg)':'transparent'}
                    >
                      <span style={{fontFamily:"'Syne',sans-serif",fontSize:'14px',fontWeight:600,color:activeTab===tab.key?'var(--accent)':'var(--text)'}}>{tab.label}</span>
                      {tab.count > 0 && <span style={{fontSize:'12px',color:'var(--muted)'}}>{tab.count}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ESTIMATES */}
          {activeTab === 'estimates' && (
            estimates.length === 0 ? (
              <EmptyState icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>} title="Смет пока нет" desc="Загрузите чертёж и получите смету за 30 секунд" href="/estimate" linkLabel="Создать смету" />
            ) : (
              <div style={{border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden'}}>
                {estimates.map(est => (
                  <RowItem key={est.id} onClick={() => router.push(`/dashboard/${est.id}`)}>
                    <div style={{flex:1,minWidth:0,overflow:'hidden'}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:700,marginBottom:'3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{est.summary || 'Без описания'}</div>
                      <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                        <span style={{color:'var(--muted)',fontSize:'11px'}}>{new Date(est.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'short'})}</span>
                        {est.with_materials && <span style={{fontSize:'10px',color:'var(--accent)',border:'1px solid var(--tag-border)',background:'var(--tag-bg)',padding:'1px 6px',borderRadius:'2px'}}>С материалами</span>}
                      </div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'6px',flexShrink:0}}>
                        <span style={{fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:800,color:'var(--accent)',whiteSpace:'nowrap'}}>{est.total_rub?.toLocaleString('ru-RU')} ₽</span>
                        <DeleteBtn onClick={(e: any) => deleteEstimate(est.id, e)} />
                      </div>
                    </RowItem>
                  ))}
                </div>
              )
          )}

          {/* QUALITY */}
          {activeTab === 'quality' && (
            qualityChecks.length === 0 ? (
              <EmptyState icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>} title="Проверок пока нет" desc="Загрузите фото объекта для анализа" href="/quality" linkLabel="Проверить качество" />
            ) : (
              <div style={{border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden'}}>
                {qualityChecks.map(check => {
                  const statusColor = check.overall_status === 'ok' ? '#5E9E6E' : check.overall_status === 'critical' ? '#E85050' : '#C09070'
                  const statusLabel = check.overall_status === 'ok' ? 'Норма' : check.overall_status === 'critical' ? 'Критично' : 'Нарушения'
                  return (
                    <RowItem key={check.id}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'14px',fontWeight:700,marginBottom:'4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{check.object_description || 'Без описания'}</div>
                        <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                          <span style={{color:'var(--muted)',fontSize:'12px'}}>{new Date(check.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</span>
                          <span style={{fontSize:'10px',color:statusColor,border:`1px solid ${statusColor}`,padding:'1px 7px',borderRadius:'2px',opacity:0.85}}>{statusLabel}</span>
                          <span style={{color:'var(--muted)',fontSize:'12px'}}>{check.defects?.length || 0} дефектов</span>
                        </div>
                      </div>
                      <DeleteBtn onClick={async (e: any) => {
                        e.stopPropagation()
                        if (!confirm('Удалить проверку?')) return
                        await supabase.from('quality_checks').delete().eq('id', check.id)
                        setQualityChecks(qualityChecks.filter(c => c.id !== check.id))
                      }} />
                    </RowItem>
                  )
                })}
              </div>
            )
          )}

          {/* DOCUMENTS */}
          {activeTab === 'documents' && (
            documents.length === 0 ? (
              <EmptyState icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>} title="Документов пока нет" desc="Сгенерируйте договор, акт или ТЗ" href="/documents" linkLabel="Создать документ" />
            ) : (
              <div style={{border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden'}}>
                {documents.map(doc => (
                  <RowItem key={doc.id}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'14px',fontWeight:700,marginBottom:'4px'}}>{doc.doc_label}</div>
                      <span style={{color:'var(--muted)',fontSize:'12px'}}>{new Date(doc.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</span>
                    </div>
                    <DeleteBtn onClick={async (e: any) => {
                      e.stopPropagation()
                      if (!confirm('Удалить документ?')) return
                      await supabase.from('documents').delete().eq('id', doc.id)
                      setDocuments(documents.filter(d => d.id !== doc.id))
                    }} />
                  </RowItem>
                ))}
              </div>
            )
          )}

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div style={{maxWidth:'520px',display:'flex',flexDirection:'column',gap:'16px'}}>
              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'28px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:'16px',fontWeight:700}}>Личные данные</div>
                  <button onClick={() => editingProfile ? saveProfile() : setEditingProfile(true)} style={{background:editingProfile?'var(--accent)':'transparent',color:editingProfile?'var(--btn-text)':'var(--muted)',border:'1px solid',borderColor:editingProfile?'var(--accent)':'var(--border2)',borderRadius:'4px',padding:'5px 14px',cursor:'pointer',fontSize:'12px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.2s'}}>
                    {profileLoading ? 'Сохраняем...' : editingProfile ? '✓ Сохранить' : '✏ Изменить'}
                  </button>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'18px'}}>
                  <div>
                    <label style={labelStyle}>Имя и фамилия</label>
                    {editingProfile ? <input value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} placeholder="Иван Петров" style={inputStyle} /> : <div style={{fontSize:'14px',color:profile.full_name?'var(--text)':'var(--muted)'}}>{profile.full_name || 'Не указано'}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <div style={{fontSize:'14px',color:'var(--text)'}}>{user?.email}</div>
                    <div style={{fontSize:'11px',color:'var(--muted)',marginTop:'3px'}}>Для смены email: kern.platform@yandex.ru</div>
                  </div>
                  <div>
                    <label style={labelStyle}>Телефон</label>
                    {editingProfile ? <input value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+7 (999) 000-00-00" style={inputStyle} /> : <div style={{fontSize:'14px',color:profile.phone?'var(--text)':'var(--muted)'}}>{profile.phone || 'Не указано'}</div>}
                  </div>
                </div>
              </div>

              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'24px'}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:'16px',fontWeight:700,marginBottom:'16px'}}>Статистика</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                  {[{label:'Смет',value:estimates.length},{label:'Проверок',value:qualityChecks.length},{label:'Документов',value:documents.length}].map(s => (
                    <div key={s.label} style={{textAlign:'center',padding:'12px 8px',background:'var(--bg)',borderRadius:'6px',border:'1px solid var(--border)'}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'20px',fontWeight:800,color:'var(--accent)',marginBottom:'2px'}}>{s.value}</div>
                      <div style={{color:'var(--muted)',fontSize:'11px'}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}