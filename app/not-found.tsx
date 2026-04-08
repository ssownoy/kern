'use client'

import { useEffect, useState } from 'react'

export default function NotFound() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',textAlign:'center'}}>
        
        <div style={{marginBottom:'32px'}}>
          <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'24px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>
            Kern<span style={{color:'var(--accent)'}}>.</span>
          </a>
        </div>

        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(80px,15vw,140px)',fontWeight:800,color:'var(--accent)',lineHeight:1,letterSpacing:'-0.04em',marginBottom:'8px'}}>404</div>
        
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(20px,3vw,28px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'12px'}}>404</h1>
        
        <p style={{color:'var(--muted)',fontSize:'15px',fontWeight:300,marginBottom:'40px',maxWidth:'360px',lineHeight:1.6}}>Âîçìîæíî, ññûëêà óñòàðåëà èëè ñòðàíèöà áûëà óäàëåíà</p>

        <div style={{display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center',marginBottom:'48px'}}>
          <a href="/" style={{background:'var(--accent)',color:'var(--btn-text)',padding:'12px 28px',borderRadius:'4px',textDecoration:'none',fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'14px'}}>Íà ãëàâíóþ</a>
          <a href="/estimate" style={{color:'var(--muted)',padding:'12px 28px',borderRadius:'4px',textDecoration:'none',fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'14px',border:'1px solid var(--border2)'}}>AI-ñìåò÷èê</a>
        </div>

        <div style={{display:'flex',gap:'24px',flexWrap:'wrap',justifyContent:'center'}}>
          {[
            { href:'/estimate', label:'AI-ñìåò÷èê' },
            { href:'/quality', label:'Êîíòðîëü êà÷åñòâà' },
            { href:'/documents', label:'Äîêóìåíòû' },
            { href:'/dashboard', label:'Êàáèíåò' },
          ].map(link => (
            <a key={link.href} href={link.href} style={{color:'var(--muted)',fontSize:'13px',textDecoration:'none',transition:'color 0.2s'}} onMouseOver={e=>e.currentTarget.style.color='var(--accent)'} onMouseOut={e=>e.currentTarget.style.color='var(--muted)'}>{link.label}</a>
          ))}
        </div>
      </div>
    </>
  )
}
