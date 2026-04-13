'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const RUB = () => <span style={{fontFamily:"'DM Sans',Arial,sans-serif",fontSize:'0.9em'}}> руб.</span>

const cities = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
  'Нижний Новгород', 'Челябинск', 'Самара', 'Уфа', 'Ростов-на-Дону',
  'Краснодар', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград',
]

const presets = [
  { label: 'Фундамент', items: ['Цемент М500', 'Песок строительный', 'Щебень фракция 20-40', 'Арматура А500С 12мм', 'Опалубка фанерная'] },
  { label: 'Стены', items: ['Кирпич рядовой М150', 'Газобетонный блок D500', 'Раствор кладочный М75', 'Утеплитель минвата 100мм', 'Пеноблок D600'] },
  { label: 'Кровля', items: ['Металлочерепица', 'Профнастил С20', 'Мягкая черепица', 'Пароизоляция', 'Стропильная доска 50x150'] },
  { label: 'Отделка', items: ['Гипсокартон 12,5мм', 'Штукатурка гипсовая', 'Шпаклёвка финишная', 'Плитка керамическая', 'Ламинат 32 класс'] },
]

export default function MaterialsPage() {
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)
  const [region, setRegion] = useState('Москва')
  const [showCityList, setShowCityList] = useState(false)
  const [cityQuery, setCityQuery] = useState('Москва')
  const [inputText, setInputText] = useState('')
  const [materials, setMaterials] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const filteredCities = cities.filter(c => c.toLowerCase().startsWith(cityQuery.toLowerCase()))

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

  const addMaterial = (name: string) => {
    if (name.trim() && !materials.includes(name.trim())) {
      setMaterials([...materials, name.trim()])
    }
  }

  const addFromInput = () => {
    const lines = inputText.split('\n').map(l => l.trim()).filter(Boolean)
    const newMats = lines.filter(l => !materials.includes(l))
    setMaterials([...materials, ...newMats])
    setInputText('')
  }

  const removeMaterial = (i: number) => setMaterials(materials.filter((_, j) => j !== i))

  const addPreset = (items: string[]) => {
    const newMats = items.filter(item => !materials.includes(item))
    setMaterials([...materials, ...newMats])
  }

  const handleAnalyze = async () => {
    if (materials.length === 0) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materials, region }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadExcel = () => {
    if (!result) return
    const rows = [
      ['KERN — Анализ цен на материалы'],
      [`Регион: ${result.region}`],
      [`Дата: ${new Date().toLocaleDateString('ru-RU')}`],
      [],
      ['Материал', 'Ед.', 'Мин. цена', 'Средняя цена', 'Макс. цена', 'Поставщики', 'Совет'],
      ...result.items.map((item: any) => [
        item.name, item.unit,
        item.price_min, item.price_avg, item.price_max,
        item.suppliers?.join(', ') || '',
        item.tip || '',
      ]),
    ]
    const csv = rows.map(row => row.map(cell => {
      const s = String(cell ?? '')
      return s.includes(';') ? `"${s}"` : s
    }).join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kern-materials-${Date.now()}.csv` 
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!mounted) return null

  const inputStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '9px 12px',
    color: 'var(--text)',
    fontFamily: "'DM Sans',sans-serif",
    fontSize: '14px',
    outline: 'none',
    width: '100%',
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } @media (max-width:768px) { .mat-layout { flex-direction: column !important; } }`}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'20px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>Kern<span style={{color:'var(--accent)'}}>.</span></a>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <a href="/dashboard" style={{display:'flex',alignItems:'center',gap:'6px',color:'var(--text)',fontSize:'13px',textDecoration:'none',border:'1px solid var(--border2)',borderRadius:'4px',padding:'6px 14px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--text)'}}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Кабинет
          </a>
          <button onClick={toggleTheme} style={{width:'42px',height:'23px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'12px',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}}>
            <span style={{fontSize:'10px',position:'absolute',left:'5px',pointerEvents:'none'}}>🌙</span>
            <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'var(--accent)',transition:'transform 0.3s',flexShrink:0,transform:theme==='light'?'translateX(19px)':'translateX(0)'}}></div>
            <span style={{fontSize:'10px',position:'absolute',right:'4px',pointerEvents:'none'}}>☀️</span>
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
            <div style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'10px'}}>Модуль 05</div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(28px,4vw,44px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'10px',lineHeight:1.1}}>Цены на материалы</h1>
            <p style={{color:'var(--muted)',fontSize:'15px',fontWeight:300,maxWidth:'480px',lineHeight:1.6}}>Добавьте список материалов — AI покажет актуальные цены по вашему региону с рекомендациями по поставщикам.</p>
          </div>

          <div className="mat-layout" style={{display:'flex',gap:'24px',alignItems:'flex-start'}}>

            {/* LEFT */}
            <div style={{flex:'0 0 380px',display:'flex',flexDirection:'column',gap:'12px'}}>

              {/* City */}
              <div style={{position:'relative'}}>
                <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:'6px'}}>Регион</label>
                <input type="text" value={cityQuery} onChange={e => { setCityQuery(e.target.value); setRegion(e.target.value); setShowCityList(true) }} onFocus={() => setShowCityList(true)} onBlur={() => setTimeout(() => setShowCityList(false), 150)} placeholder="Город..." style={inputStyle} />
                {showCityList && filteredCities.length > 0 && (
                  <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'4px',zIndex:50,maxHeight:'180px',overflowY:'auto',marginTop:'2px'}}>
                    {filteredCities.map(city => (
                      <div key={city} onMouseDown={() => { setCityQuery(city); setRegion(city); setShowCityList(false) }} style={{padding:'9px 12px',cursor:'pointer',fontSize:'13px',color:'var(--text)',borderBottom:'1px solid var(--border)',transition:'background 0.1s'}} onMouseOver={e => e.currentTarget.style.background='var(--card-hover)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>{city}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Presets */}
              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'16px'}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'13px',marginBottom:'10px'}}>Быстрый выбор</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                  {presets.map(p => (
                    <button key={p.label} onClick={() => addPreset(p.items)} style={{background:'var(--bg)',border:'1px solid var(--border2)',borderRadius:'4px',color:'var(--muted)',padding:'5px 12px',cursor:'pointer',fontSize:'12px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.15s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--muted)'}}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual input */}
              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'16px'}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'13px',marginBottom:'10px'}}>Добавить вручную</div>
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Введите материалы — каждый с новой строки:&#10;Цемент М500&#10;Кирпич рядовой&#10;Арматура 12мм"
                  style={{...inputStyle, height:'100px', resize:'vertical'}}
                />
                <button onClick={addFromInput} disabled={!inputText.trim()} style={{width:'100%',marginTop:'8px',padding:'9px',borderRadius:'4px',background:inputText.trim()?'var(--accent)':'var(--border2)',color:inputText.trim()?'var(--btn-text)':'var(--muted)',border:'none',fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:600,cursor:inputText.trim()?'pointer':'not-allowed',transition:'all 0.2s'}}>
                  Добавить в список
                </button>
              </div>

              {/* Materials list */}
              {materials.length > 0 && (
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'13px'}}>Список материалов</div>
                    <span style={{color:'var(--accent)',fontSize:'12px',fontWeight:600}}>{materials.length} шт.</span>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'6px',maxHeight:'200px',overflowY:'auto'}}>
                    {materials.map((mat, i) => (
                      <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px',padding:'7px 10px',background:'var(--bg)',borderRadius:'4px',border:'1px solid var(--border)'}}>
                        <span style={{fontSize:'13px',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{mat}</span>
                        <button onClick={() => removeMaterial(i)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'14px',lineHeight:1,padding:'0 2px',flexShrink:0}} onMouseOver={e=>e.currentTarget.style.color='#ff8080'} onMouseOut={e=>e.currentTarget.style.color='var(--muted)'}>×</button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setMaterials([])} style={{width:'100%',marginTop:'10px',padding:'7px',borderRadius:'4px',background:'transparent',color:'var(--muted)',border:'1px solid var(--border2)',fontFamily:"'Syne',sans-serif",fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                    Очистить список
                  </button>
                </div>
              )}

              <button onClick={handleAnalyze} disabled={materials.length === 0 || loading} style={{width:'100%',padding:'14px',borderRadius:'6px',background:materials.length > 0 && !loading ? 'var(--accent)' : 'var(--border2)',color:materials.length > 0 && !loading ? 'var(--btn-text)' : 'var(--muted)',border:'none',fontFamily:"'Syne',sans-serif",fontSize:'14px',fontWeight:700,cursor:materials.length > 0 && !loading ? 'pointer' : 'not-allowed',transition:'all 0.2s'}}>
                {loading ? (
                  <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                    <span style={{width:'16px',height:'16px',border:'2px solid var(--btn-text)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}></span>
                    Анализируем цены...
                  </span>
                ) : 'Узнать цены →'}
              </button>

              {error && <div style={{background:'rgba(255,80,80,0.08)',border:'1px solid rgba(255,80,80,0.25)',borderRadius:'6px',padding:'12px',color:'#ff8080',fontSize:'13px'}}>{error}</div>}
            </div>

            {/* RIGHT */}
            <div style={{flex:1,minWidth:0}}>
              {!result && !loading && (
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'32px',minHeight:'300px',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center',gap:'16px'}}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{color:'var(--border2)'}}>
                    <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'15px',marginBottom:'6px'}}>Здесь появятся цены</div>
                    <div style={{color:'var(--muted)',fontSize:'13px',lineHeight:1.5}}>Добавьте материалы слева<br />и нажмите «Узнать цены»</div>
                  </div>
                </div>
              )}

              {result && (
                <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'16px',fontWeight:700}}>Цены в регионе: {result.region}</div>
                      <div style={{color:'var(--muted)',fontSize:'13px',marginTop:'2px'}}>{result.items?.length} материалов</div>
                    </div>
                    <button onClick={downloadExcel} style={{background:'none',border:'1px solid var(--border2)',borderRadius:'4px',color:'var(--muted)',padding:'7px 16px',cursor:'pointer',fontSize:'12px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--muted)'}}>
                      Скачать Excel
                    </button>
                  </div>

                  <div style={{border:'1px solid var(--border)',borderRadius:'8px',overflow:'auto'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'600px'}}>
                      <thead>
                        <tr style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}>
                          <th style={{padding:'11px 16px',textAlign:'left',color:'var(--muted)',fontWeight:500,fontSize:'10px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Материал</th>
                          <th style={{padding:'11px 16px',textAlign:'center',color:'var(--muted)',fontWeight:500,fontSize:'10px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Ед.</th>
                          <th style={{padding:'11px 16px',textAlign:'right',color:'var(--muted)',fontWeight:500,fontSize:'10px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Мин.</th>
                          <th style={{padding:'11px 16px',textAlign:'right',color:'var(--muted)',fontWeight:500,fontSize:'10px',letterSpacing:'0.08em',textTransform:'uppercase',background:'rgba(192,144,112,0.06)'}}>Средняя</th>
                          <th style={{padding:'11px 16px',textAlign:'right',color:'var(--muted)',fontWeight:500,fontSize:'10px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Макс.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.items?.map((item: any, i: number) => (
                          <tr key={i} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'var(--bg)':'var(--bg2)'}}>
                            <td style={{padding:'12px 16px'}}>
                              <div style={{color:'var(--text)',fontWeight:500,marginBottom:'3px'}}>{item.name}</div>
                              {item.suppliers?.length > 0 && (
                                <div style={{color:'var(--muted)',fontSize:'11px'}}>{item.suppliers.slice(0,2).join(', ')}</div>
                              )}
                              {item.tip && (
                                <div style={{color:'var(--accent)',fontSize:'11px',marginTop:'2px'}}>💡 {item.tip}</div>
                              )}
                            </td>
                            <td style={{padding:'12px 16px',textAlign:'center',color:'var(--muted)'}}>{item.unit}</td>
                            <td style={{padding:'12px 16px',textAlign:'right',color:'var(--muted)',fontFamily:'Arial,sans-serif',whiteSpace:'nowrap'}}>{item.price_min?.toLocaleString('ru-RU')}<RUB /></td>
                            <td style={{padding:'12px 16px',textAlign:'right',background:'rgba(192,144,112,0.04)',whiteSpace:'nowrap'}}>
                              <span style={{fontFamily:'Arial,sans-serif',fontWeight:700,color:'var(--accent)'}}>{item.price_avg?.toLocaleString('ru-RU')}<RUB /></span>
                            </td>
                            <td style={{padding:'12px 16px',textAlign:'right',color:'var(--muted)',fontFamily:'Arial,sans-serif',whiteSpace:'nowrap'}}>{item.price_max?.toLocaleString('ru-RU')}<RUB /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'16px 20px'}}>
                    <div style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Примечание</div>
                    <div style={{fontSize:'13px',color:'var(--muted)',lineHeight:1.6}}>Цены являются ориентировочными рыночными ценами на 2025-2026 год. Точные цены уточняйте у поставщиков в вашем регионе.</div>
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
