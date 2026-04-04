'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const docTypes = [
  { id: 'contract', label: 'Договор подряда', desc: 'По ГК РФ, глава 37' },
  { id: 'act', label: 'Акт КС-2', desc: 'Приёмка выполненных работ' },
  { id: 'defect', label: 'Дефектная ведомость', desc: 'Ведомость дефектов' },
  { id: 'tz', label: 'Техническое задание', desc: 'ТЗ на строительство' },
]

const docFields: Record<string, { key: string; label: string; placeholder: string; type?: string }[]> = {
  contract: [
    { key: 'customer', label: 'Заказчик', placeholder: 'ООО "Заказчик", ИНН 1234567890' },
    { key: 'contractor', label: 'Подрядчик', placeholder: 'ООО "Подрядчик", ИНН 0987654321' },
    { key: 'object', label: 'Объект строительства', placeholder: 'Жилой дом по адресу...' },
    { key: 'scope', label: 'Виды работ', placeholder: 'Возведение фундамента, кладка стен...' },
    { key: 'price', label: 'Стоимость работ', placeholder: '5 000 000 рублей' },
    { key: 'start_date', label: 'Дата начала', placeholder: '01.05.2026', type: 'date' },
    { key: 'end_date', label: 'Дата окончания', placeholder: '01.11.2026', type: 'date' },
    { key: 'warranty', label: 'Гарантийный срок', placeholder: '24 месяца' },
  ],
  act: [
    { key: 'customer', label: 'Заказчик', placeholder: 'ООО "Заказчик"' },
    { key: 'contractor', label: 'Подрядчик', placeholder: 'ООО "Подрядчик"' },
    { key: 'object', label: 'Объект', placeholder: 'Жилой дом...' },
    { key: 'contract_number', label: 'Номер договора', placeholder: '№ 123 от 01.01.2026' },
    { key: 'period', label: 'Отчётный период', placeholder: 'Апрель 2026' },
    { key: 'works', label: 'Выполненные работы', placeholder: 'Кладка кирпича — 120 м³...' },
    { key: 'total', label: 'Общая стоимость', placeholder: '660 000 рублей' },
  ],
  defect: [
    { key: 'object', label: 'Объект', placeholder: 'Жилой дом по адресу...' },
    { key: 'date', label: 'Дата осмотра', placeholder: '01.04.2026', type: 'date' },
    { key: 'commission', label: 'Члены комиссии', placeholder: 'Иванов И.И. — прораб' },
    { key: 'defects', label: 'Выявленные дефекты', placeholder: 'Трещины в стенах...' },
    { key: 'deadline', label: 'Срок устранения', placeholder: '30 дней' },
    { key: 'responsible', label: 'Ответственный', placeholder: 'Подрядчик ООО "Строй"' },
  ],
  tz: [
    { key: 'customer', label: 'Заказчик', placeholder: 'ООО "Заказчик"' },
    { key: 'object', label: 'Объект', placeholder: 'Жилой дом 2 этажа' },
    { key: 'location', label: 'Адрес', placeholder: 'Московская область' },
    { key: 'purpose', label: 'Назначение', placeholder: 'Постоянное проживание' },
    { key: 'area', label: 'Площадь', placeholder: '250 кв.м.' },
    { key: 'materials', label: 'Материалы', placeholder: 'Кирпич, железобетон' },
    { key: 'requirements', label: 'Особые требования', placeholder: 'Тёплый пол...' },
    { key: 'deadline', label: 'Срок выполнения', placeholder: '12 месяцев' },
  ],
}

export default function DocumentsPage() {
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('kern-theme', next)
  }

  const handleGenerate = async () => {
    if (!selectedDoc) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: selectedDoc, fields }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.text)
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await supabase.from('documents').insert({
          user_id: session.user.id,
          doc_type: selectedDoc,
          doc_label: docTypes.find(d => d.id === selectedDoc)?.label || '',
          content: data.text,
          fields,
        })
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!result) return
    const doc = docTypes.find(d => d.id === selectedDoc)
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${doc?.label}</title><style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family: Arial, sans-serif; font-size: 13px; color: #1C1A14; padding: 40px; line-height: 1.8; } .header { border-bottom: 2px solid #C09070; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; } .logo { font-size: 22px; font-weight: 900; } .logo span { color: #C09070; } .content { white-space: pre-wrap; }</style></head><body><div class="header"><div class="logo">Kern<span>.</span></div><div style="font-size:11px;color:#6E6A5E;text-align:right"><div>kern-eight.vercel.app</div><div>${new Date().toLocaleDateString('ru-RU')}</div></div></div><div class="content">${result.replace(/\n/g, '<br/>')}</div></body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  const downloadTXT = () => {
    if (!result) return
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kern-${selectedDoc}-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!mounted) return null

  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '9px 12px', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: '13px', outline: 'none', width: '100%' }
  const labelStyle = { fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--muted)', display: 'block', marginBottom: '5px' }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } @media (max-width:768px) { .docs-layout { flex-direction: column !important; } } @media (max-width: 600px) { .docs-layout { padding: 0 !important; } .docs-layout > div:first-child { width: 100% !important; flex: none !important; } .docs-placeholder { padding: 20px !important; min-height: auto !important; } .docs-placeholder .placeholder-icon { width: 32px !important; height: 32px !important; } .docs-placeholder .placeholder-title { font-size: 13px !important; margin-bottom: 4px !important; } .docs-placeholder .placeholder-text { font-size: 12px !important; } }`}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'clamp(12px, 2vw, 16px) clamp(16px, 4vw, 40px)',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'20px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>Kern<span style={{color:'var(--accent)'}}>.</span></a>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <a href="/dashboard" style={{display:'flex',alignItems:'center',gap:'6px',color:'var(--text)',fontSize:'13px',textDecoration:'none',border:'1px solid var(--border2)',borderRadius:'4px',padding:'6px 14px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--text)'}}>
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
        <div style={{maxWidth:'1100px',margin:'0 auto',padding:'32px 16px 60px'}}>

          <a href="/" style={{color:'var(--muted)',fontSize:'13px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'5px',marginBottom:'40px'}}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Назад
          </a>

          <div style={{marginBottom:'40px'}}>
            <div style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'10px'}}>Модуль 03</div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(28px,4vw,44px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'10px',lineHeight:1.1}}>Генератор документов</h1>
            <p style={{color:'var(--muted)',fontSize:'15px',fontWeight:300,maxWidth:'480px',lineHeight:1.6}}>Заполните данные — AI сгенерирует готовый документ по российским стандартам.</p>
          </div>

          <div className="docs-layout" style={{display:'flex',gap:'24px',alignItems:'flex-start'}}>

            {/* LEFT */}
            <div style={{flex:'0 0 380px',display:'flex',flexDirection:'column',gap:'12px'}}>

              {/* Doc type selector */}
              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden'}}>
                {docTypes.map((doc, i) => (
                  <div key={doc.id} onClick={() => { setSelectedDoc(doc.id); setResult(null); setFields({}) }}
                    style={{padding:'14px 18px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',background:selectedDoc===doc.id ? 'var(--tag-bg)' : 'transparent',borderBottom:i < docTypes.length-1 ? '1px solid var(--border)' : 'none',transition:'background 0.15s'}}
                    onMouseOver={e => { if(selectedDoc!==doc.id) e.currentTarget.style.background='var(--card-hover)' }}
                    onMouseOut={e => { if(selectedDoc!==doc.id) e.currentTarget.style.background='transparent' }}
                  >
                    <div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'13px',color:selectedDoc===doc.id ? 'var(--accent)' : 'var(--text)',marginBottom:'2px'}}>{doc.label}</div>
                      <div style={{fontSize:'11px',color:'var(--muted)'}}>{doc.desc}</div>
                    </div>
                    {selectedDoc === doc.id && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="var(--accent)" strokeWidth="1.2"/><path d="M5 8l2 2 4-4" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </div>
                ))}
              </div>

              {/* Fields */}
              {selectedDoc && (
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px'}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'13px',marginBottom:'16px'}}>{docTypes.find(d => d.id === selectedDoc)?.label}</div>
                  <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    {docFields[selectedDoc]?.map(field => (
                      <div key={field.key}>
                        <label style={labelStyle}>{field.label}</label>
                        <input type={field.type || 'text'} value={fields[field.key] || ''} onChange={e => setFields(prev => ({...prev, [field.key]: e.target.value}))} placeholder={field.placeholder} style={inputStyle} />
                      </div>
                    ))}
                  </div>
                  <button onClick={handleGenerate} disabled={loading} style={{width:'100%',padding:'13px',borderRadius:'6px',background:'var(--accent)',color:'var(--btn-text)',border:'none',fontFamily:"'Syne',sans-serif",fontSize:'14px',fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,transition:'all 0.2s',marginTop:'16px'}}>
                    {loading ? (
                      <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                        <span style={{width:'16px',height:'16px',border:'2px solid var(--btn-text)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}></span>
                        Генерируем...
                      </span>
                    ) : 'Сгенерировать →'}
                  </button>
                </div>
              )}

              {error && <div style={{background:'rgba(255,80,80,0.08)',border:'1px solid rgba(255,80,80,0.25)',borderRadius:'6px',padding:'12px',color:'#ff8080',fontSize:'13px'}}>{error}</div>}
            </div>

            {/* RIGHT */}
            <div style={{flex:1,minWidth:0}}>
              {!result && !loading && (
                <div className="docs-placeholder" style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'32px',minHeight:'400px',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center',gap:'16px'}}>
                  <svg className="placeholder-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" style={{color:'var(--border2)'}}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div className="placeholder-title" style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'15px',marginBottom:'6px'}}>Выберите тип документа</div>
                    <div className="placeholder-text" style={{color:'var(--muted)',fontSize:'13px',lineHeight:1.5}}>Заполните данные слева и нажмите<br />«Сгенерировать»</div>
                  </div>
                </div>
              )}

              {result && (
                <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>Готовый документ</span>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button onClick={downloadTXT} style={{background:'none',border:'1px solid var(--border2)',borderRadius:'4px',color:'var(--muted)',padding:'6px 14px',cursor:'pointer',fontSize:'12px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--muted)'}}>TXT</button>
                      <button onClick={downloadPDF} style={{background:'var(--accent)',border:'none',borderRadius:'4px',color:'var(--btn-text)',padding:'6px 14px',cursor:'pointer',fontSize:'12px',fontFamily:"'Syne',sans-serif",fontWeight:600}}>PDF</button>
                    </div>
                  </div>
                  <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'28px',whiteSpace:'pre-wrap',fontSize:'13px',lineHeight:1.8,color:'var(--text)',fontFamily:'Arial, sans-serif',maxHeight:'640px',overflowY:'auto'}}>
                    {result}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}