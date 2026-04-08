'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'ssownoy@gmail.com'

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('dark')
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }
      loadStats()
    })
  }, [])

  const loadStats = async () => {
    const [profiles, estimates, quality, documents] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('estimates').select('id, user_id, total_rub, created_at'),
      supabase.from('quality_checks').select('id, user_id, created_at'),
      supabase.from('documents').select('id, user_id, doc_label, created_at'),
    ])

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const allEstimates = estimates.data || []
    const allQuality = quality.data || []
    const allDocs = documents.data || []
    const allProfiles = profiles.data || []

    setStats({
      totalUsers: allProfiles.length,
      newUsersWeek: allProfiles.filter(p => new Date(p.created_at) > weekAgo).length,
      newUsersMonth: allProfiles.filter(p => new Date(p.created_at) > monthAgo).length,
      totalEstimates: allEstimates.length,
      estimatesWeek: allEstimates.filter(e => new Date(e.created_at) > weekAgo).length,
      totalQuality: allQuality.length,
      qualityWeek: allQuality.filter(q => new Date(q.created_at) > weekAgo).length,
      totalDocs: allDocs.length,
      docsWeek: allDocs.filter(d => new Date(d.created_at) > weekAgo).length,
      avgEstimateValue: allEstimates.length > 0
        ? Math.round(allEstimates.reduce((s, e) => s + (e.total_rub || 0), 0) / allEstimates.length)
        : 0,
    })

    const usersWithStats = allProfiles.map(p => ({
      ...p,
      estimatesCount: allEstimates.filter(e => e.user_id === p.id).length,
      qualityCount: allQuality.filter(q => q.user_id === p.id).length,
      docsCount: allDocs.filter(d => d.user_id === p.id).length,
    }))

    setUsers(usersWithStats)
    setLoading(false)
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('kern-theme', next)
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',fontFamily:"'DM Sans',sans-serif",color:'var(--muted)',fontSize:'14px'}}>
      Загружаем данные...
    </div>
  )

  const StatCard = ({ label, value, sub }: any) => (
    <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px'}}>
      <div style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>{label}</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'28px',fontWeight:800,color:'var(--accent)',marginBottom:'4px'}}>{value}</div>
      {sub && <div style={{fontSize:'12px',color:'var(--muted)'}}>{sub}</div>}
    </div>
  )

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'20px',fontWeight:800,color:'var(--text)',textDecoration:'none'}}>
          Kern<span style={{color:'var(--accent)'}}>.</span>
        </a>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--accent)',border:'1px solid var(--tag-border)',background:'var(--tag-bg)',padding:'3px 10px',borderRadius:'3px'}}>Admin</span>
          <button onClick={toggleTheme} style={{width:'42px',height:'23px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'12px',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}}>
            <span style={{fontSize:'10px',position:'absolute',left:'5px',pointerEvents:'none'}}>🌙</span>
            <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'var(--accent)',transition:'transform 0.3s',flexShrink:0,transform:theme==='light'?'translateX(19px)':'translateX(0)'}}></div>
            <span style={{fontSize:'10px',position:'absolute',right:'4px',pointerEvents:'none'}}>☀️</span>
          </button>
        </div>
      </nav>

      <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",padding:'80px 40px 80px',maxWidth:'1100px',margin:'0 auto'}}>

        <div style={{marginBottom:'32px'}}>
          <div style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'10px'}}>Панель управления</div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'32px',fontWeight:700,letterSpacing:'-0.02em'}}>Статистика Kern</h1>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'12px',marginBottom:'32px'}}>
          <StatCard label="Пользователей" value={stats.totalUsers} sub={`+${stats.newUsersWeek} за неделю`} />
          <StatCard label="Смет создано" value={stats.totalEstimates} sub={`+${stats.estimatesWeek} за неделю`} />
          <StatCard label="Проверок КК" value={stats.totalQuality} sub={`+${stats.qualityWeek} за неделю`} />
          <StatCard label="Документов" value={stats.totalDocs} sub={`+${stats.docsWeek} за неделю`} />
          <StatCard label="Средняя смета" value={`${stats.avgEstimateValue.toLocaleString('ru-RU')} ₽`} sub="по всем сметам" />
        </div>

        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'16px',fontWeight:700,marginBottom:'16px'}}>Пользователи</div>
        <div style={{border:'1px solid var(--border)',borderRadius:'8px',overflow:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'600px'}}>
            <thead>
              <tr style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}>
                {['Email','Имя','Смет','КК','Документов','Регистрация'].map(h => (
                  <th key={h} style={{padding:'11px 16px',textAlign:'left',color:'var(--muted)',fontWeight:500,fontSize:'10px',letterSpacing:'0.08em',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'var(--bg)':'var(--bg2)'}}>
                  <td style={{padding:'10px 16px',color:'var(--text)',maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.email}</td>
                  <td style={{padding:'10px 16px',color:'var(--muted)'}}>{u.full_name || '—'}</td>
                  <td style={{padding:'10px 16px',color:u.estimatesCount>0?'var(--accent)':'var(--muted)',fontWeight:u.estimatesCount>0?600:400}}>{u.estimatesCount}</td>
                  <td style={{padding:'10px 16px',color:u.qualityCount>0?'var(--accent)':'var(--muted)',fontWeight:u.qualityCount>0?600:400}}>{u.qualityCount}</td>
                  <td style={{padding:'10px 16px',color:u.docsCount>0?'var(--accent)':'var(--muted)',fontWeight:u.docsCount>0?600:400}}>{u.docsCount}</td>
                  <td style={{padding:'10px 16px',color:'var(--muted)',whiteSpace:'nowrap'}}>{new Date(u.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'short'})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
