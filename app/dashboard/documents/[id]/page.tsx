'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const [doc, setDoc] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('dark')
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    loadDoc()
  }, [])

  const loadDoc = async () => {
    const { data } = await supabase.from('documents').select('*').eq('id', params.id).single()
    if (data) setDoc(data)
    setLoading(false)
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('kern-theme', next)
  }

  const downloadPDF = () => {
    if (!doc) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${doc.doc_label}</title><style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family: Arial, sans-serif; font-size: 13px; color: #1C1A14; padding: 40px; line-height: 1.8; } .header { border-bottom: 2px solid #C09070; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; } .logo { font-size: 22px; font-weight: 900; } .logo span { color: #C09070; } .content { white-space: pre-wrap; }</style></head><body><div class="header"><div class="logo">Kern<span>.</span></div><div style="font-size:11px;color:#6E6A5E;text-align:right"><div>kern-eight.vercel.app</div><div>${new Date(doc.created_at).toLocaleDateString('ru-RU')}</div></div></div><div class="content">${(doc.content || '').replace(/\n/g, '<br/>')}</div></body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  const downloadTXT = () => {
    if (!doc) return
    const blob = new Blob([doc.content || ''], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kern-${doc.doc_type}-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',color:'var(--muted)',fontFamily:"'DM Sans',sans-serif",fontSize:'14px'}}>Загружаем...</div>
  if (!doc) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',color:'var(--muted)',fontFamily:"'DM Sans',sans-serif",fontSize:'14px'}}>Документ не найден</div>

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); @media(max-width:600px){.doc-container{padding:80px 16px 60px!important}}`}</style>
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

      <div className="doc-container" style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",padding:'80px 40px 80px',maxWidth:'900px',margin:'0 auto'}}>
        <a href="/dashboard" style={{color:'var(--muted)',fontSize:'13px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'5px',marginBottom:'40px'}}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Кабинет
        </a>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'16px',marginBottom:'32px',flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'8px'}}>Документ</div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(20px,3vw,28px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'6px'}}>{doc.doc_label}</h1>
            <div style={{color:'var(--muted)',fontSize:'13px'}}>{new Date(doc.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</div>
          </div>
          <div style={{display:'flex',gap:'8px',flexShrink:0}}>
            <button onClick={downloadTXT} style={{background:'none',border:'1px solid var(--border2)',borderRadius:'4px',color:'var(--muted)',padding:'9px 16px',cursor:'pointer',fontSize:'13px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--muted)'}}>TXT</button>
            <button onClick={downloadPDF} style={{background:'var(--accent)',color:'var(--btn-text)',border:'none',borderRadius:'4px',padding:'9px 16px',cursor:'pointer',fontSize:'13px',fontFamily:"'Syne',sans-serif",fontWeight:700}}>PDF</button>
          </div>
        </div>

        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'32px',whiteSpace:'pre-wrap',fontSize:'14px',lineHeight:1.8,color:'var(--text)',fontFamily:'Arial, sans-serif'}}>
          {doc.content || 'Содержимое документа недоступно'}
        </div>
      </div>
    </>
  )
}