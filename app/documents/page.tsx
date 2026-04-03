'use client'

import { useState, useEffect } from 'react'

const docTypes = [
  { id: 'contract', label: 'Договор подряда', icon: '📄', desc: 'Договор строительного подряда по ГК РФ' },
  { id: 'act', label: 'Акт КС-2', icon: '✅', desc: 'Акт о приёмке выполненных работ' },
  { id: 'defect', label: 'Дефектная ведомость', icon: '🔍', desc: 'Ведомость дефектов и недостатков' },
  { id: 'tz', label: 'Техническое задание', icon: '📋', desc: 'ТЗ на строительство объекта' },
]

const docFields: Record<string, { key: string; label: string; placeholder: string; type?: string }[]> = {
  contract: [
    { key: 'customer', label: 'Заказчик', placeholder: 'ООО "Заказчик", ИНН 1234567890' },
    { key: 'contractor', label: 'Подрядчик', placeholder: 'ООО "Подрядчик", ИНН 0987654321' },
    { key: 'object', label: 'Объект строительства', placeholder: 'Жилой дом по адресу...' },
    { key: 'scope', label: 'Виды работ', placeholder: 'Возведение фундамента, кладка стен...' },
    { key: 'price', label: 'Стоимость работ', placeholder: '5 000 000 рублей' },
    { key: 'start_date', label: 'Дата начала работ', placeholder: '01.05.2026', type: 'date' },
    { key: 'end_date', label: 'Дата окончания работ', placeholder: '01.11.2026', type: 'date' },
    { key: 'warranty', label: 'Гарантийный срок', placeholder: '24 месяца' },
  ],
  act: [
    { key: 'customer', label: 'Заказчик', placeholder: 'ООО "Заказчик"' },
    { key: 'contractor', label: 'Подрядчик', placeholder: 'ООО "Подрядчик"' },
    { key: 'object', label: 'Объект', placeholder: 'Жилой дом...' },
    { key: 'contract_number', label: 'Номер договора', placeholder: '№ 123 от 01.01.2026' },
    { key: 'period', label: 'Отчётный период', placeholder: 'Апрель 2026' },
    { key: 'works', label: 'Выполненные работы', placeholder: 'Кладка кирпича — 120 м³ по 5500 ₽...' },
    { key: 'total', label: 'Общая стоимость', placeholder: '660 000 рублей' },
  ],
  defect: [
    { key: 'object', label: 'Объект', placeholder: 'Жилой дом по адресу...' },
    { key: 'date', label: 'Дата осмотра', placeholder: '01.04.2026', type: 'date' },
    { key: 'commission', label: 'Члены комиссии', placeholder: 'Иванов И.И. — прораб, Петров П.П. — инженер' },
    { key: 'defects', label: 'Выявленные дефекты', placeholder: 'Трещины в стенах, отслоение штукатурки...' },
    { key: 'deadline', label: 'Срок устранения', placeholder: '30 дней' },
    { key: 'responsible', label: 'Ответственный', placeholder: 'Подрядчик ООО "Строй"' },
  ],
  tz: [
    { key: 'customer', label: 'Заказчик', placeholder: 'ООО "Заказчик"' },
    { key: 'object', label: 'Объект строительства', placeholder: 'Жилой дом 2 этажа' },
    { key: 'location', label: 'Адрес объекта', placeholder: 'Московская область, д. Иваново' },
    { key: 'purpose', label: 'Назначение объекта', placeholder: 'Жилой дом для постоянного проживания' },
    { key: 'area', label: 'Площадь объекта', placeholder: '250 кв.м.' },
    { key: 'materials', label: 'Основные материалы', placeholder: 'Кирпич, железобетон, металлочерепица' },
    { key: 'requirements', label: 'Особые требования', placeholder: 'Тёплый пол, панорамные окна...' },
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

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } @media (max-width: 600px) { .docs-nav { padding: 14px 16px !important; } .docs-container { padding: 90px 16px 60px !important; } .doc-types-grid { grid-template-columns: 1fr 1fr !important; } .fields-grid { grid-template-columns: 1fr !important; } }`}</style>

      <nav className="docs-nav" style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 52px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'22px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>
          Kern<span style={{color:'var(--accent)'}}>.</span>
        </a>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <a href="/dashboard" style={{display:'flex',alignItems:'center',gap:'7px',color:'var(--text)',fontSize:'13px',textDecoration:'none',border:'1px solid var(--border2)',borderRadius:'4px',padding:'6px 14px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--text)'}}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Кабинет
          </a>
          <button onClick={toggleTheme} style={{width:'42px',height:'23px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'12px',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}}>
            <span style={{fontSize:'10px',position:'absolute',pointerEvents:'none',left:'5px'}}>🌙</span>
            <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'var(--accent)',transition:'transform 0.3s',flexShrink:0,transform:theme==='light'?'translateX(19px)':'translateX(0)'}}></div>
            <span style={{fontSize:'10px',position:'absolute',pointerEvents:'none',right:'4px'}}>☀️</span>
          </button>
        </div>
      </nav>

      <div className="docs-container" style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",padding:'120px 52px 80px'}}>
        <div style={{maxWidth:'900px',margin:'0 auto'}}>

          <a href="/" style={{color:'var(--muted)',fontSize:'14px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'6px',marginBottom:'48px'}}>← Назад</a>

          <span style={{fontSize:'11px',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'14px',display:'block'}}>Модуль 03</span>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(36px,5vw,64px)',fontWeight:800,letterSpacing:'-0.03em',lineHeight:1,marginBottom:'16px'}}>Генератор документов</h1>
          <p style={{color:'var(--muted)',fontSize:'17px',fontWeight:300,marginBottom:'52px',maxWidth:'500px'}}>Выберите тип документа, заполните данные — AI сгенерирует готовый документ по российским стандартам.</p>

          <div className="doc-types-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'40px'}}>
            {docTypes.map(doc => (
              <div key={doc.id} onClick={() => { setSelectedDoc(doc.id); setResult(null); setFields({}) }}
                style={{padding:'20px',borderRadius:'8px',border:`1px solid ${selectedDoc===doc.id ? 'var(--accent)' : 'var(--border)'}`,background:selectedDoc===doc.id ? 'var(--tag-bg)' : 'var(--card-bg)',cursor:'pointer',transition:'all 0.2s',textAlign:'center'}}>
                <div style={{fontSize:'28px',marginBottom:'8px'}}>{doc.icon}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:700,marginBottom:'4px',color:selectedDoc===doc.id ? 'var(--accent)' : 'var(--text)'}}>{doc.label}</div>
                <div style={{fontSize:'11px',color:'var(--muted)',lineHeight:1.4}}>{doc.desc}</div>
              </div>
            ))}
          </div>

          {selectedDoc && (
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'32px',marginBottom:'24px'}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'16px',fontWeight:700,marginBottom:'24px'}}>
                {docTypes.find(d => d.id === selectedDoc)?.label} — заполните данные
              </div>
              <div className="fields-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                {docFields[selectedDoc]?.map(field => (
                  <div key={field.key} style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                    <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)'}}>{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      value={fields[field.key] || ''}
                      onChange={e => setFields(prev => ({...prev, [field.key]: e.target.value}))}
                      placeholder={field.placeholder}
                      style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'4px',padding:'10px 14px',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none',width:'100%'}}
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleGenerate} disabled={loading} style={{width:'100%',padding:'16px',borderRadius:'4px',background:'var(--accent)',color:'var(--btn-text)',border:'none',fontFamily:"'Syne',sans-serif",fontSize:'15px',fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,transition:'all 0.2s',marginTop:'24px'}}>
                {loading ? (
                  <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                    <span style={{width:'18px',height:'18px',border:'2px solid var(--btn-text)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}></span>
                    Генерируем документ...
                  </span>
                ) : 'Сгенерировать документ →'}
              </button>
            </div>
          )}

          {error && (
            <div style={{background:'rgba(255,80,80,0.1)',border:'1px solid rgba(255,80,80,0.3)',borderRadius:'6px',padding:'16px',color:'#ff8080',marginBottom:'32px'}}>
              {error}
            </div>
          )}

          {result && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <span style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>Готовый документ</span>
                <div style={{display:'flex',gap:'8px'}}>
                  <button onClick={downloadTXT} style={{background:'none',border:'1px solid var(--border2)',borderRadius:'4px',color:'var(--muted)',padding:'6px 16px',cursor:'pointer',fontSize:'13px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--muted)'}}>
                    Скачать TXT
                  </button>
                  <button onClick={downloadPDF} style={{background:'var(--accent)',border:'none',borderRadius:'4px',color:'var(--btn-text)',padding:'6px 16px',cursor:'pointer',fontSize:'13px',fontFamily:"'Syne",sans-serif",fontWeight:600}}>
                    Скачать PDF
                  </button>
                </div>
              </div>
              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'32px',whiteSpace:'pre-wrap',fontSize:'14px',lineHeight:1.8,color:'var(--text)',fontFamily:'Arial, sans-serif',maxHeight:'600px',overflowY:'auto'}}>
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
