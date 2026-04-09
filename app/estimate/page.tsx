'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface EstimateItem {
  name: string
  unit: string
  qty: number
  price: number
  total: number
}

interface Section {
  title: string
  items: EstimateItem[]
  section_total: number
}

interface Estimate {
  summary: string
  sections?: Section[]
  items?: EstimateItem[]
  total_rub: number
  notes: string
}

const cities = [
  { name: 'Москва', climate: 'II', soil: 'II' },
  { name: 'Санкт-Петербург', climate: 'II', soil: 'II' },
  { name: 'Новосибирск', climate: 'I', soil: 'III' },
  { name: 'Екатеринбург', climate: 'I', soil: 'II' },
  { name: 'Казань', climate: 'II', soil: 'II' },
  { name: 'Нижний Новгород', climate: 'II', soil: 'II' },
  { name: 'Челябинск', climate: 'I', soil: 'II' },
  { name: 'Самара', climate: 'II', soil: 'II' },
  { name: 'Уфа', climate: 'I', soil: 'II' },
  { name: 'Ростов-на-Дону', climate: 'III', soil: 'II' },
  { name: 'Краснодар', climate: 'III', soil: 'II' },
  { name: 'Красноярск', climate: 'I', soil: 'III' },
  { name: 'Воронеж', climate: 'II', soil: 'II' },
  { name: 'Пермь', climate: 'I', soil: 'II' },
  { name: 'Волгоград', climate: 'II', soil: 'II' },
  { name: 'Иркутск', climate: 'I', soil: 'III' },
  { name: 'Хабаровск', climate: 'I', soil: 'III' },
  { name: 'Владивосток', climate: 'II', soil: 'III' },
  { name: 'Якутск', climate: 'I', soil: 'IV' },
  { name: 'Сыктывкар', climate: 'I', soil: 'III' },
  { name: 'Архангельск', climate: 'I', soil: 'III' },
  { name: 'Мурманск', climate: 'I', soil: 'IV' },
  { name: 'Тюмень', climate: 'I', soil: 'III' },
  { name: 'Омск', climate: 'I', soil: 'II' },
  { name: 'Барнаул', climate: 'I', soil: 'II' },
]

export default function EstimatePage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [editableItems, setEditableItems] = useState<EstimateItem[]>([])
  const [editableSections, setEditableSections] = useState<Section[]>([])
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [withMaterials, setWithMaterials] = useState(false)
  const [region, setRegion] = useState('Москва')
  const [cityQuery, setCityQuery] = useState('Москва')
  const [showCityList, setShowCityList] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [showParams, setShowParams] = useState(false)
  const [soilGroup, setSoilGroup] = useState('')
  const [climateZone, setClimateZone] = useState('')
  const [workConditions, setWorkConditions] = useState('')
  const [estimateMethod, setEstimateMethod] = useState('')
  const [objectType, setObjectType] = useState('')
  const [workPeriod, setWorkPeriod] = useState('')
  const [includeWinter, setIncludeWinter] = useState(false)
  const [includeTempBuildings, setIncludeTempBuildings] = useState(false)
  const [hasLandscaping, setHasLandscaping] = useState(false)
  const router = useRouter()

  const filteredCities = cities.filter(c => c.name.toLowerCase().startsWith(cityQuery.toLowerCase()))

  const selectCity = (city: typeof cities[0]) => {
    setCityQuery(city.name)
    setRegion(city.name)
    setClimateZone(city.climate)
    setSoilGroup(city.soil)
    setShowCityList(false)
  }

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
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
    setEstimate(null)
    setEditableItems([])
    setEditMode(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const formData = new FormData()
      formData.append('drawing', file)
      formData.append('withMaterials', withMaterials.toString())
      formData.append('region', region)
      formData.append('soilGroup', soilGroup)
      formData.append('workConditions', workConditions)
      formData.append('climateZone', climateZone)
      formData.append('workPeriod', workPeriod)
      formData.append('includeWinter', includeWinter.toString())
      formData.append('includeTempBuildings', includeTempBuildings.toString())
      formData.append('estimateMethod', estimateMethod)
      formData.append('objectType', objectType)
      formData.append('hasLandscaping', hasLandscaping.toString())
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {},
        body: formData,
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setEstimate(data)
      if (data.sections) {
        setEditableSections(data.sections)
        setEditableItems(data.sections.flatMap((s: Section) => s.items))
      } else {
        setEditableItems(data.items || [])
      }
      if (session?.user) {
        const { error: insertError } = await supabase.from('estimates').insert({
          user_id: session.user.id,
          summary: data.summary,
          total_rub: data.total_rub,
          items: data.sections ? data.sections.flatMap((s: any) => s.items || []) : data.items,
          sections: data.sections || null,
          notes: data.notes,
          with_materials: withMaterials,
        })
        if (insertError) {
          console.error('Save error:', insertError)
          setError('Смета создана, но не сохранена в историю: ' + insertError.message)
        }
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const updateItem = (i: number, field: string, value: any) => {
    const updated = [...editableItems]
    updated[i] = { ...updated[i], [field]: value }
    if (field === 'qty' || field === 'price') updated[i].total = updated[i].qty * updated[i].price
    setEditableItems(updated)
  }

  const removeItem = (i: number) => setEditableItems(editableItems.filter((_, j) => j !== i))
  const addItem = () => setEditableItems([...editableItems, { name: 'Новая позиция', unit: 'шт', qty: 1, price: 0, total: 0 }])
  const totalRub = editableSections.length > 0
  ? editableSections.reduce((sum, s) => sum + s.items.reduce((ss, i) => ss + i.qty * i.price, 0), 0)
  : editableItems.reduce((sum, item) => sum + item.qty * item.price, 0)

  const downloadPDF = () => {
    if (!estimate) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Смета Kern</title><style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family: Arial, sans-serif; font-size: 12px; color: #1C1A14; padding: 32px; } .header { display: flex; justify-content: space-between; margin-bottom: 24px; border-bottom: 2px solid #C09070; padding-bottom: 16px; } .logo { font-size: 24px; font-weight: 900; } .logo span { color: #C09070; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } th { background: #C09070; color: #13120F; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; } td { padding: 8px 10px; border-bottom: 1px solid #E4E0D4; font-size: 11px; } tr:nth-child(even) td { background: #F5F2EA; } td:last-child, th:last-child { text-align: right; } td:nth-child(3), td:nth-child(4) { text-align: right; } .total { display: flex; justify-content: space-between; background: #13120F; color: #EAE6DC; padding: 16px 20px; border-radius: 6px; margin-bottom: 16px; } .total-amount { font-size: 22px; font-weight: 900; color: #C09070; } .notes { background: #F5F2EA; padding: 14px; border-radius: 6px; font-size: 10px; color: #6E6A5E; }</style></head><body><div class="header"><div class="logo">Kern<span>.</span></div><div style="font-size:11px;color:#6E6A5E;text-align:right"><div>kern-eight.vercel.app</div><div>${new Date().toLocaleDateString('ru-RU')}</div><div>${region}</div></div></div><div style="background:#F5F2EA;padding:16px;border-radius:6px;margin-bottom:20px"><div style="font-size:10px;text-transform:uppercase;color:#6E6A5E;margin-bottom:6px">Объект</div><div style="font-size:13px;font-weight:600">${estimate.summary}</div></div><table><thead><tr><th>Наименование</th><th>Ед.</th><th>Кол-во</th><th>Цена (₽)</th><th>Сумма (₽)</th></tr></thead><tbody>${editableItems.map(item => `<tr><td>${item.name}</td><td>${item.unit}</td><td>${item.qty}</td><td>${item.price.toLocaleString('ru-RU')}</td><td>${(item.qty * item.price).toLocaleString('ru-RU')}</td></tr>`).join('')}</tbody></table><div class="total"><div style="font-size:14px;font-weight:600">Итого</div><div class="total-amount">${totalRub.toLocaleString('ru-RU')} ₽</div></div>${estimate.notes ? `<div class="notes"><div style="font-size:9px;text-transform:uppercase;margin-bottom:6px">Замечания</div>${estimate.notes}</div>` : ''}</body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  const downloadExcel = () => {
    if (!estimate || editableItems.length === 0) return
    const rows = [
      ['KERN — AI-платформа для строительства'],
      [`Регион: ${region}`],
      [`Дата: ${new Date().toLocaleDateString('ru-RU')}`],
      [],
      ['Объект:', estimate.summary],
      [],
      ['Наименование', 'Ед. изм.', 'Кол-во', 'Цена (₽)', 'Сумма (₽)'],
      ...editableItems.map(item => [item.name, item.unit, item.qty, item.price, item.qty * item.price]),
      [],
      ['', '', '', 'ИТОГО:', totalRub],
      [],
      ['Замечания:', estimate.notes || ''],
    ]
    const csv = rows.map(row => row.map(cell => { const s = String(cell ?? ''); return s.includes(';') ? `"${s}"` : s }).join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kern-smeta-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!mounted) return null

  const selectStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '9px 12px', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: '14px', outline: 'none', width: '100%' }
  const labelStyle = { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--muted)', display: 'block', marginBottom: '6px' }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } @media (max-width:768px) { .est-layout { flex-direction: column !important; } .est-sidebar { width: 100% !important; } }`}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'clamp(12px, 2vw, 16px) clamp(16px, 4vw, 40px)',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
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
            <div style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'10px'}}>Модуль 01</div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(28px,4vw,44px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'10px',lineHeight:1.1}}>AI-сметчик</h1>
            <p style={{color:'var(--muted)',fontSize:'15px',fontWeight:300,maxWidth:'480px',lineHeight:1.6}}>Загрузите чертёж или фото объекта — получите готовую смету в рублях с учётом региональных цен.</p>
          </div>

          <div className="est-layout" style={{display:'flex',gap:'24px',alignItems:'flex-start'}}>

            {/* LEFT — форма */}
            <div style={{flex:'0 0 380px',display:'flex',flexDirection:'column',gap:'12px'}}>

              {/* Upload zone */}
              <div
                onClick={() => document.getElementById('fileInput')?.click()}
                style={{border:'1px solid var(--border)',borderRadius:'8px',padding:'32px 24px',textAlign:'center',background:'var(--bg2)',cursor:'pointer',transition:'border-color 0.2s'}}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <input id="fileInput" type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e => setFile(e.target.files?.[0] || null)} />
                {file ? (
                  <div>
                    {file.type.startsWith('image/') && <img src={URL.createObjectURL(file)} alt="preview" style={{maxHeight:'160px',maxWidth:'100%',borderRadius:'4px',objectFit:'contain',marginBottom:'10px'}} />}
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'13px',marginBottom:'4px'}}>{file.name}</div>
                    <div style={{color:'var(--muted)',fontSize:'12px',marginBottom:'10px'}}>{(file.size / 1024).toFixed(0)} KB</div>
                    <button onClick={e => { e.stopPropagation(); setFile(null); const inp = document.getElementById('fileInput') as HTMLInputElement; if(inp) inp.value='' }} style={{fontSize:'12px',color:'var(--muted)',background:'none',border:'1px solid var(--border2)',borderRadius:'3px',padding:'3px 10px',cursor:'pointer'}}>Удалить</button>
                  </div>
                ) : (
                  <div>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{margin:'0 auto 12px',display:'block',color:'var(--muted)'}}>
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'14px',marginBottom:'4px'}}>Загрузить чертёж или фото</div>
                    <div style={{color:'var(--muted)',fontSize:'12px'}}>PNG, JPG, PDF — до 10 МБ</div>
                  </div>
                )}
              </div>

              {/* City */}
              <div style={{position:'relative'}}>
                <label style={labelStyle}>Город</label>
                <input type="text" value={cityQuery} onChange={e => { setCityQuery(e.target.value); setRegion(e.target.value); setShowCityList(true) }} onFocus={() => setShowCityList(true)} onBlur={() => setTimeout(() => setShowCityList(false), 150)} placeholder="Начните вводить..." style={{...selectStyle}} />
                {showCityList && filteredCities.length > 0 && (
                  <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'4px',zIndex:50,maxHeight:'180px',overflowY:'auto',marginTop:'2px'}}>
                    {filteredCities.map(city => (
                      <div key={city.name} onMouseDown={() => selectCity(city)} style={{padding:'9px 12px',cursor:'pointer',fontSize:'13px',color:'var(--text)',borderBottom:'1px solid var(--border)',transition:'background 0.1s'}} onMouseOver={e => e.currentTarget.style.background='var(--card-hover)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>{city.name}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Params collapsible */}
              <div>
                <button onClick={() => setShowParams(!showParams)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:showParams?'6px 6px 0 0':'6px',padding:'12px 16px',cursor:'pointer',fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:600,color:'var(--text)'}}>
                  <span>Параметры сметы</span>
                  <span style={{color:'var(--muted)',fontSize:'12px',fontWeight:400,display:'flex',alignItems:'center',gap:'6px'}}>необязательно <span>{showParams ? '▲' : '▼'}</span></span>
                </button>
                {showParams && (
                  <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderTop:'none',borderRadius:'0 0 6px 6px',padding:'16px'}}>
                    <div className="params-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
                      {[
                        { label: 'Группа грунтов', value: soilGroup, setter: setSoilGroup, options: [['','— Не указано'],['I','I — Песок'],['II','II — Суглинок'],['III','III — Глина'],['IV','IV — Тяжёлая глина'],['V','V — Скала']] },
                        { label: 'Климатический район', value: climateZone, setter: setClimateZone, options: [['','— Не указано'],['I','I — Крайний Север'],['II','II — Умеренный'],['III','III — Тёплый'],['IV','IV — Жаркий']] },
                        { label: 'Условия работ', value: workConditions, setter: setWorkConditions, options: [['','— Не указано'],['normal','Нормальные'],['cramped','Стеснённые'],['height','На высоте >15м'],['wet','Мокрый грунт'],['aggressive','Агрессивная среда']] },
                        { label: 'Метод составления', value: estimateMethod, setter: setEstimateMethod, options: [['','— Не указано'],['resource','Ресурсный'],['base-index','Базисно-индексный'],['analogues','По аналогам'],['market','По рыночным ценам']] },
                        { label: 'Тип объекта', value: objectType, setter: setObjectType, options: [['','— Не указано'],['cottage','Жилой коттедж'],['apartment','Многоквартирный дом'],['commercial','Общественное здание'],['industrial','Промышленный объект'],['renovation','Реконструкция']] },
                        { label: 'Период работ', value: workPeriod, setter: setWorkPeriod, options: [['','— Не указано'],['summer','Лето'],['winter','Зима'],['year','Круглогодично']] },
                      ].map(({ label, value, setter, options }) => (
                        <div key={label}>
                          <label style={{...labelStyle,fontSize:'10px'}}>{label}</label>
                          <select value={value} onChange={e => setter(e.target.value)} style={selectStyle}>
                            {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    {[
                      { key: 'winter', value: includeWinter, setter: setIncludeWinter, label: 'Зимнее удорожание' },
                      { key: 'temp', value: includeTempBuildings, setter: setIncludeTempBuildings, label: 'Временные здания и сооружения' },
                      { key: 'land', value: hasLandscaping, setter: setHasLandscaping, label: 'Озеленение и благоустройство' },
                    ].map(({ key, value, setter, label }) => (
                      <div key={key} style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',marginBottom:'8px'}} onClick={() => setter(!value)}>
                        <div style={{width:'16px',height:'16px',borderRadius:'3px',border:`1.5px solid ${value ? 'var(--accent)' : 'var(--border2)'}`,background:value ? 'var(--accent)' : 'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.15s'}}>
                          {value && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="var(--btn-text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span style={{fontSize:'13px'}}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Materials */}
              <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 16px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'6px',cursor:'pointer'}} onClick={() => setWithMaterials(!withMaterials)}>
                <div style={{width:'16px',height:'16px',borderRadius:'3px',border:`1.5px solid ${withMaterials ? 'var(--accent)' : 'var(--border2)'}`,background:withMaterials ? 'var(--accent)' : 'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.15s'}}>
                  {withMaterials && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="var(--btn-text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'13px',marginBottom:'2px'}}>Подбор материалов</div>
                  <div style={{color:'var(--muted)',fontSize:'12px'}}>AI включит стоимость материалов в смету</div>
                </div>
              </div>

              {/* Submit */}
              <button onClick={handleSubmit} disabled={!file || loading} style={{width:'100%',padding:'14px',borderRadius:'6px',background:file && !loading ? 'var(--accent)' : 'var(--border2)',color:file && !loading ? 'var(--btn-text)' : 'var(--muted)',border:'none',fontFamily:"'Syne',sans-serif",fontSize:'14px',fontWeight:700,cursor:file && !loading ? 'pointer' : 'not-allowed',transition:'all 0.2s'}}>
                {loading ? (
                  <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                    <span style={{width:'16px',height:'16px',border:'2px solid var(--btn-text)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}></span>
                    Анализируем...
                  </span>
                ) : 'Составить смету'}
              </button>

              {error && <div style={{background:'rgba(255,80,80,0.08)',border:'1px solid rgba(255,80,80,0.25)',borderRadius:'6px',padding:'12px',color:'#ff8080',fontSize:'13px'}}>{error}</div>}
            </div>

            {/* RIGHT — результат или подсказка */}
            <div style={{flex:1,minWidth:0}}>
              {!estimate && !loading && (
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'32px',height:'100%',minHeight:'300px',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center',gap:'16px'}}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{color:'var(--border2)'}}>
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:'15px',marginBottom:'6px'}}>Здесь появится смета</div>
                    <div style={{color:'var(--muted)',fontSize:'13px',lineHeight:1.5}}>Загрузите чертёж или фото объекта<br />и нажмите «Составить смету»</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'8px',width:'100%',maxWidth:'240px',marginTop:'8px'}}>
                    {['Загрузите файл','Укажите город','Нажмите кнопку'].map((step, i) => (
                      <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',textAlign:'left'}}>
                        <div style={{width:'20px',height:'20px',borderRadius:'50%',background:'var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:600,color:'var(--muted)',flexShrink:0}}>{i+1}</div>
                        <span style={{fontSize:'13px',color:'var(--muted)'}}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {estimate && (
                <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                  <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px'}}>
                    <div style={{fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'6px'}}>Объект</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:'15px',fontWeight:700}}>{estimate.summary}</div>
                  </div>

                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>Позиции сметы</span>
                    <button onClick={() => setEditMode(!editMode)} style={{display:'flex',alignItems:'center',gap:'5px',background:editMode?'var(--accent)':'transparent',color:editMode?'var(--btn-text)':'var(--muted)',border:'1px solid',borderColor:editMode?'var(--accent)':'var(--border2)',borderRadius:'4px',padding:'5px 12px',cursor:'pointer',fontSize:'12px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.2s'}}>
                      {editMode ? (
                        <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Готово</>
                      ) : (
                        <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5a1.414 1.414 0 012 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>Редактировать</>
                      )}
                    </button>
                  </div>

                  {editableSections.length > 0 ? (
  <div style={{display:'flex',flexDirection:'column',gap:'0',border:'1px solid var(--border)',borderRadius:'8px',overflow:'auto'}}>
    {editableSections.map((section, si) => {
      const sectionTotal = section.items.reduce((s, i) => s + i.qty * i.price, 0)
      return (
        <div key={si}>
          <div style={{background:'var(--bg2)',padding:'10px 16px',borderBottom:'1px solid var(--border)',borderTop: si > 0 ? '2px solid var(--border)' : 'none',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:'12px',fontWeight:700,letterSpacing:'0.05em',textTransform:'uppercase',color:'var(--text)'}}>{section.title}</span>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:700,color:'var(--accent)'}}>{sectionTotal.toLocaleString('ru-RU')} ₽</span>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'520px'}}>
            <tbody>
              {section.items.map((item, i) => {
                const globalIndex = editableSections.slice(0, si).reduce((s, sec) => s + sec.items.length, 0) + i
                return (
                  <tr key={i} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'var(--bg)':'var(--bg2)'}}>
                    <td style={{padding:'9px 16px',color:'var(--text)'}}>{editMode ? <input value={item.name} onChange={e => updateItem(globalIndex,'name',e.target.value)} style={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'3px',color:'var(--text)',width:'100%',fontFamily:"'DM Sans',sans-serif",fontSize:'13px',padding:'3px 7px',outline:'none'}} /> : item.name}</td>
                    <td style={{padding:'9px 16px',textAlign:'right',color:'var(--muted)'}}>{item.unit}</td>
                    <td style={{padding:'9px 16px',textAlign:'right',color:'var(--muted)'}}>{item.qty}</td>
                    <td style={{padding:'9px 16px',textAlign:'right',color:'var(--muted)',whiteSpace:'nowrap'}}>{item.price.toLocaleString('ru-RU')} ₽</td>
                    <td style={{padding:'9px 16px',textAlign:'right',color:'var(--text)',fontWeight:500,whiteSpace:'nowrap'}}>{(item.qty*item.price).toLocaleString('ru-RU')} ₽</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
    })}
    <div style={{background:'var(--bg2)',borderTop:'2px solid var(--border)',padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <span style={{color:'var(--muted)',fontSize:'12px'}}>Разделов: {editableSections.length} · Позиций: {editableItems.length}</span>
      <span style={{fontFamily:"'Syne',sans-serif",fontSize:'14px',fontWeight:700}}>Итого: {totalRub.toLocaleString('ru-RU')} ₽</span>
    </div>
  </div>
) : (
                  <div style={{border:'1px solid var(--border)',borderRadius:'8px',overflow:'auto'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'520px'}}>
                      <thead>
                        <tr style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}>
                          {['Наименование','Ед.','Кол-во','Цена','Сумма'].map(h => (
                            <th key={h} style={{padding:'11px 16px',textAlign:h==='Наименование'?'left':'right',color:'var(--muted)',fontWeight:500,fontSize:'10px',letterSpacing:'0.08em',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {editableItems.map((item, i) => (
                          <tr key={i} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'var(--bg)':'var(--bg2)'}}>
                            <td style={{padding:'10px 16px'}}>
                              {editMode ? <input value={item.name} onChange={e => updateItem(i,'name',e.target.value)} style={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'3px',color:'var(--text)',width:'100%',fontFamily:"'DM Sans',sans-serif",fontSize:'13px',padding:'3px 7px',outline:'none'}} /> : <span style={{color:'var(--text)'}}>{item.name}</span>}
                            </td>
                            <td style={{padding:'10px 16px',textAlign:'right'}}>
                              {editMode ? <input value={item.unit} onChange={e => updateItem(i,'unit',e.target.value)} style={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'3px',color:'var(--muted)',width:'44px',textAlign:'center',fontFamily:"'DM Sans',sans-serif",fontSize:'13px',padding:'3px 4px',outline:'none'}} /> : <span style={{color:'var(--muted)'}}>{item.unit}</span>}
                            </td>
                            <td style={{padding:'10px 16px',textAlign:'right'}}>
                              {editMode ? <input type="number" value={item.qty} onChange={e => updateItem(i,'qty',Number(e.target.value))} style={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'3px',color:'var(--muted)',width:'60px',textAlign:'right',fontFamily:"'DM Sans',sans-serif",fontSize:'13px',padding:'3px 7px',outline:'none'}} /> : <span style={{color:'var(--muted)'}}>{item.qty}</span>}
                            </td>
                            <td style={{padding:'10px 16px',textAlign:'right'}}>
                              {editMode ? <input type="number" value={item.price} onChange={e => updateItem(i,'price',Number(e.target.value))} style={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'3px',color:'var(--muted)',width:'90px',textAlign:'right',fontFamily:"'DM Sans',sans-serif",fontSize:'13px',padding:'3px 7px',outline:'none'}} /> : <span style={{color:'var(--muted)'}}>{item.price.toLocaleString('ru-RU')} ₽</span>}
                            </td>
                            <td style={{padding:'10px 16px',textAlign:'right'}}>
                              <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:'8px'}}>
                                <span style={{color:'var(--text)',fontWeight:500,whiteSpace:'nowrap'}}>{(item.qty*item.price).toLocaleString('ru-RU')} ₽</span>
                                {editMode && <button onClick={() => removeItem(i)} style={{background:'none',border:'1px solid var(--border2)',borderRadius:'3px',color:'var(--muted)',cursor:'pointer',fontSize:'12px',padding:'2px 7px',lineHeight:1,transition:'all 0.15s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='#ff8080';e.currentTarget.style.color='#ff8080'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--muted)'}}>×</button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {editMode && (
                      <div style={{padding:'10px 16px',borderTop:'1px solid var(--border)'}}>
                        <button onClick={addItem} style={{background:'none',border:'1px dashed var(--border2)',borderRadius:'4px',color:'var(--muted)',padding:'7px 14px',cursor:'pointer',fontSize:'12px',fontFamily:"'Syne',sans-serif",fontWeight:600,width:'100%'}}>+ Добавить позицию</button>
                      </div>
                    )}
                    <div style={{background:'var(--bg2)',borderTop:'1px solid var(--border)',padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{color:'var(--muted)',fontSize:'12px'}}>Позиций: {editableItems.length}</span>
                      <span style={{fontFamily:"'Syne',sans-serif",fontSize:'14px',fontWeight:700}}>Итого: {totalRub.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>
)}

                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px'}}>
                    <span style={{fontFamily:"'Syne',sans-serif",fontSize:'15px',fontWeight:700}}>Итоговая стоимость</span>
                    <span style={{fontFamily:"'Syne',sans-serif",fontSize:'26px',fontWeight:800,color:'var(--accent)'}}>{totalRub.toLocaleString('ru-RU')} ₽</span>
                  </div>

                  {estimate.notes && (
                    <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px'}}>
                      <div style={{fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Замечания</div>
                      <div style={{color:'var(--muted)',fontSize:'13px',lineHeight:1.6}}>{estimate.notes}</div>
                    </div>
                  )}

                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={downloadPDF} style={{flex:1,padding:'12px',borderRadius:'4px',background:'var(--accent)',color:'var(--btn-text)',border:'none',fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:700,cursor:'pointer'}}>Скачать PDF</button>
                    <button onClick={downloadExcel} style={{flex:1,padding:'12px',borderRadius:'4px',background:'transparent',color:'var(--muted)',border:'1px solid var(--border2)',fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:600,cursor:'pointer',transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--muted)'}}>Скачать Excel</button>
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