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

interface Estimate {
  summary: string
  items: EstimateItem[]
  total_rub: number
  notes: string
}

export default function EstimatePage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [editableItems, setEditableItems] = useState<EstimateItem[]>([])
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [withMaterials, setWithMaterials] = useState(false)
  const [region, setRegion] = useState('Москва')
  const [soilGroup, setSoilGroup] = useState('II')
  const [workConditions, setWorkConditions] = useState('normal')
  const [climateZone, setClimateZone] = useState('II')
  const [workPeriod, setWorkPeriod] = useState('summer')
  const [includeWinter, setIncludeWinter] = useState(false)
  const [includeTempBuildings, setIncludeTempBuildings] = useState(false)
  const [estimateMethod, setEstimateMethod] = useState('resource')
  const [objectType, setObjectType] = useState('cottage')
  const [hasLandscaping, setHasLandscaping] = useState(false)
  const [specialConditions, setSpecialConditions] = useState<string[]>([])
  const [theme, setTheme] = useState('dark')
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user)
    })
  }, [])

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
      formData.append('specialConditions', specialConditions.join(', '))

      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {},
        body: formData,
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setEstimate(data)
      setEditableItems(data.items)

      if (user) {
        await supabase.from('estimates').insert({
          user_id: user.id,
          summary: data.summary,
          total_rub: data.total_rub,
          items: data.items,
          notes: data.notes,
          with_materials: withMaterials,
        })
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
    if (field === 'qty' || field === 'price') {
      updated[i].total = updated[i].qty * updated[i].price
    }
    setEditableItems(updated)
  }

  const removeItem = (i: number) => {
    setEditableItems(editableItems.filter((_, j) => j !== i))
  }

  const addItem = () => {
    setEditableItems([...editableItems, { name: 'Новая позиция', unit: 'шт', qty: 1, price: 0, total: 0 }])
  }

  const totalRub = editableItems.reduce((sum, item) => sum + (item.qty * item.price), 0)

  const downloadPDF = () => {
    if (!estimate) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Смета Kern</title>
    <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; font-size: 12px; color: #1C1A14; padding: 32px; } .header { display: flex; justify-content: space-between; margin-bottom: 24px; border-bottom: 2px solid #C09070; padding-bottom: 16px; } .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; } .logo span { color: #C09070; } .date { color: #6E6A5E; font-size: 11px; text-align: right; } .summary { background: #F5F2EA; padding: 16px; border-radius: 6px; margin-bottom: 24px; } .summary-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6E6A5E; margin-bottom: 6px; } .summary-text { font-size: 13px; font-weight: 600; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } th { background: #C09070; color: #13120F; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; } td { padding: 8px 10px; border-bottom: 1px solid #E4E0D4; font-size: 11px; } tr:nth-child(even) td { background: #F5F2EA; } td:last-child, th:last-child { text-align: right; } td:nth-child(3), th:nth-child(3), td:nth-child(4), th:nth-child(4) { text-align: right; } .total { display: flex; justify-content: space-between; align-items: center; background: #13120F; color: #EAE6DC; padding: 16px 20px; border-radius: 6px; margin-bottom: 16px; } .total-label { font-size: 14px; font-weight: 600; } .total-amount { font-size: 24px; font-weight: 900; color: #C09070; } .notes { background: #F5F2EA; padding: 14px; border-radius: 6px; font-size: 10px; color: #6E6A5E; line-height: 1.6; } .notes-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }</style></head>
    <body>
    <div class="header"><div class="logo">Kern<span>.</span></div><div class="date"><div>AI-платформа для строительства</div><div>kern-eight.vercel.app</div><div style="margin-top:4px">${new Date().toLocaleDateString('ru-RU')}</div></div></div>
    <div class="summary"><div class="summary-label">Объект</div><div class="summary-text">${estimate.summary}</div></div>
    <table><thead><tr><th>Наименование</th><th>Ед.</th><th>Кол-во</th><th>Цена (₽)</th><th>Сумма (₽)</th></tr></thead>
    <tbody>${editableItems.map(item => `<tr><td>${item.name}</td><td>${item.unit}</td><td>${item.qty}</td><td>${item.price.toLocaleString('ru-RU')}</td><td>${(item.qty * item.price).toLocaleString('ru-RU')}</td></tr>`).join('')}</tbody></table>
    <div class="total"><div class="total-label">Итого</div><div class="total-amount">${totalRub.toLocaleString('ru-RU')} ₽</div></div>
    ${estimate.notes ? `<div class="notes"><div class="notes-label">Замечания</div>${estimate.notes}</div>` : ''}
    </body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  const downloadExcel = () => {
    if (!estimate || editableItems.length === 0) return
    
    const rows = [
      ['KERN — AI-платформа для строительства'],
      ['kern-eight.vercel.app'],
      [`Дата: ${new Date().toLocaleDateString('ru-RU')}`],
      [],
      ['Объект:', estimate.summary],
      [],
      ['Наименование', 'Ед. изм.', 'Кол-во', 'Цена (₽)', 'Сумма (₽)'],
      ...editableItems.map(item => [
        item.name,
        item.unit,
        item.qty,
        item.price,
        item.qty * item.price,
      ]),
      [],
      ['', '', '', 'ИТОГО:', totalRub],
      [],
      ['Замечания:', estimate.notes || ''],
    ]

    const csvContent = rows.map(row =>
      row.map(cell => {
        const str = String(cell ?? '')
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"` 
          : str
      }).join(';')
    ).join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kern-smeta-${Date.now()}.csv` 
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!mounted) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 52px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'22px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>
          Kern<span style={{color:'var(--accent)'}}>.</span>
        </a>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          {user && <a href="/dashboard" style={{color:'var(--muted)',fontSize:'14px',textDecoration:'none'}}>Мои сметы</a>}
          {user && <span style={{color:'var(--muted)',fontSize:'13px'}}>{user.email}</span>}
          {user && <button onClick={handleSignOut} style={{color:'var(--muted)',fontSize:'13px',background:'none',border:'none',cursor:'pointer'}}>Выйти</button>}
          <button onClick={toggleTheme} style={{width:'42px',height:'23px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'12px',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}}>
            <span style={{fontSize:'10px',position:'absolute',pointerEvents:'none',left:'5px'}}>🌙</span>
            <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'var(--accent)',transition:'transform 0.3s',flexShrink:0,transform:theme==='light'?'translateX(19px)':'translateX(0)'}}></div>
            <span style={{fontSize:'10px',position:'absolute',pointerEvents:'none',right:'4px'}}>☀️</span>
          </button>
        </div>
      </nav>

      <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",padding:'120px 52px 80px'}}>
        <div style={{maxWidth:'900px',margin:'0 auto'}}>

          <a href="/" style={{color:'var(--muted)',fontSize:'14px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'6px',marginBottom:'48px'}}>← Назад</a>

          <span style={{fontSize:'11px',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'14px',display:'block'}}>Модуль 01</span>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(36px,5vw,64px)',fontWeight:800,letterSpacing:'-0.03em',lineHeight:1,marginBottom:'16px'}}>AI-сметчик</h1>
          <p style={{color:'var(--muted)',fontSize:'17px',fontWeight:300,marginBottom:'52px',maxWidth:'500px'}}>Загрузите чертёж или фото объекта — получите готовую смету в рублях за 30 секунд.</p>

          <div
            style={{border:'1px dashed var(--border2)',borderRadius:'8px',padding:'48px',textAlign:'center',marginBottom:'16px',background:'var(--card-bg)',cursor:'pointer'}}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input id="fileInput" type="file" accept="image/*,.pdf" style={{display:'none'}} value="" onChange={e => { setFile(e.target.files?.[0] || null); }} />
            {file ? (
              <div>
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} alt="preview" style={{maxHeight:'200px',maxWidth:'100%',borderRadius:'6px',objectFit:'contain',marginBottom:'12px'}} />
                ) : (
                  <div style={{fontSize:'32px',marginBottom:'12px'}}>📄</div>
                )}
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'4px'}}>{file.name}</div>
                <div style={{color:'var(--muted)',fontSize:'13px',marginBottom:'8px'}}>{(file.size / 1024).toFixed(0)} KB</div>
                <button onClick={e => { 
  e.stopPropagation(); 
  setFile(null);
  const input = document.getElementById('fileInput') as HTMLInputElement;
  if (input) input.value = '';
}} style={{fontSize:'12px',color:'var(--muted)',background:'none',border:'1px solid var(--border2)',borderRadius:'4px',padding:'4px 12px',cursor:'pointer'}}>Удалить</button>
              </div>
            ) : (
              <div>
                <div style={{fontSize:'32px',marginBottom:'12px'}}>📐</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'8px'}}>Загрузите чертёж или фото</div>
                <div style={{color:'var(--muted)',fontSize:'13px'}}>PNG, JPG, PDF — до 10 МБ</div>
              </div>
            )}
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'7px',marginBottom:'16px'}}>
            <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)'}}>Регион</label>
            <input type="text" value={region} onChange={e => setRegion(e.target.value)} placeholder="Например: Москва, Краснодар, Иркутск..." style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'4px',padding:'11px 14px',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",fontSize:'15px',outline:'none',width:'100%'}} />
          </div>

          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'28px',marginBottom:'16px'}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'15px',fontWeight:700,marginBottom:'20px'}}>Параметры сметы</div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
              
              <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)'}}>Группа грунтов</label>
                <select value={soilGroup} onChange={e => setSoilGroup(e.target.value)} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'4px',padding:'10px 14px',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none'}}>
                  <option value="I">I — Песок, супесь</option>
                  <option value="II">II — Суглинок лёгкий</option>
                  <option value="III">III — Суглинок тяжёлый, глина</option>
                  <option value="IV">IV — Тяжёлая глина, сланцы</option>
                  <option value="V">V — Скальный грунт</option>
                </select>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)'}}>Климатический район</label>
                <select value={climateZone} onChange={e => setClimateZone(e.target.value)} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'4px',padding:'10px 14px',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none'}}>
                  <option value="I">I — Крайний Север</option>
                  <option value="II">II — Умеренный</option>
                  <option value="III">III — Тёплый</option>
                  <option value="IV">IV — Жаркий</option>
                </select>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)'}}>Условия производства работ</label>
                <select value={workConditions} onChange={e => setWorkConditions(e.target.value)} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'4px',padding:'10px 14px',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none'}}>
                  <option value="normal">Нормальные</option>
                  <option value="cramped">Стеснённые (к=1.15)</option>
                  <option value="height">На высоте более 15м (к=1.25)</option>
                  <option value="wet">Мокрый грунт (к=1.1)</option>
                  <option value="aggressive">Агрессивная среда (к=1.3)</option>
                </select>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)'}}>Метод составления сметы</label>
                <select value={estimateMethod} onChange={e => setEstimateMethod(e.target.value)} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'4px',padding:'10px 14px',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none'}}>
                  <option value="resource">Ресурсный (ГЭСН)</option>
                  <option value="base-index">Базисно-индексный (ФЕР/ТЕР)</option>
                  <option value="analogues">По аналогам</option>
                  <option value="market">По рыночным ценам</option>
                </select>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)'}}>Тип объекта</label>
                <select value={objectType} onChange={e => setObjectType(e.target.value)} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'4px',padding:'10px 14px',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none'}}>
                  <option value="cottage">Жилой коттедж</option>
                  <option value="apartment">Многоквартирный дом</option>
                  <option value="commercial">Общественное здание</option>
                  <option value="industrial">Промышленный объект</option>
                  <option value="renovation">Реконструкция/ремонт</option>
                  <option value="infrastructure">Инфраструктура</option>
                </select>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)'}}>Период выполнения работ</label>
                <select value={workPeriod} onChange={e => setWorkPeriod(e.target.value)} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'4px',padding:'10px 14px',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none'}}>
                  <option value="summer">Лето (апрель–октябрь)</option>
                  <option value="winter">Зима (ноябрь–март)</option>
                  <option value="year">Круглогодично</option>
                </select>
              </div>

            </div>

            <div style={{marginTop:'20px',display:'flex',flexDirection:'column',gap:'12px'}}>
              
              {[
                { key: 'includeWinter', value: includeWinter, setter: setIncludeWinter, label: 'Зимнее удорожание (Приказ №325/пр)', desc: 'Доп. затраты на производство работ в зимнее время' },
                { key: 'includeTempBuildings', value: includeTempBuildings, setter: setIncludeTempBuildings, label: 'Временные здания и сооружения (Приказ №332/пр)', desc: 'Для сводного сметного расчёта' },
                { key: 'hasLandscaping', value: hasLandscaping, setter: setHasLandscaping, label: 'Озеленение и благоустройство (ГЭСН 47)', desc: 'Газоны, цветники, посадка деревьев' },
              ].map(({ key, value, setter, label, desc }) => (
                <div key={key} style={{display:'flex',alignItems:'flex-start',gap:'12px',cursor:'pointer'}} onClick={() => setter(!value)}>
                  <div style={{width:'20px',height:'20px',borderRadius:'4px',border:`2px solid ${value ? 'var(--accent)' : 'var(--border2)'}`,background:value ? 'var(--accent)' : 'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'2px',transition:'all 0.2s'}}>
                    {value && <span style={{color:'var(--btn-text)',fontSize:'12px',fontWeight:700}}>✓</span>}
                  </div>
                  <div>
                    <div style={{fontSize:'14px',fontWeight:500}}>{label}</div>
                    <div style={{fontSize:'12px',color:'var(--muted)',marginTop:'2px'}}>{desc}</div>
                  </div>
                </div>
              ))}

              <div style={{marginTop:'8px'}}>
                <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:'10px'}}>Особые условия</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                  {['Работы на высоте >15м','Мокрый грунт','Агрессивная среда','Стеснённые условия','Сейсмическая зона','Вечная мерзлота','Подземные воды'].map(cond => (
                    <div key={cond} onClick={() => setSpecialConditions(prev => prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond])}
                      style={{padding:'6px 14px',borderRadius:'4px',border:`1px solid ${specialConditions.includes(cond) ? 'var(--accent)' : 'var(--border2)'}`,background:specialConditions.includes(cond) ? 'var(--tag-bg)' : 'transparent',color:specialConditions.includes(cond) ? 'var(--accent)' : 'var(--muted)',fontSize:'13px',cursor:'pointer',transition:'all 0.2s'}}>
                      {cond}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px',padding:'20px 24px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',cursor:'pointer'}} onClick={() => setWithMaterials(!withMaterials)}>
            <div style={{width:'20px',height:'20px',borderRadius:'4px',border:`2px solid ${withMaterials ? 'var(--accent)' : 'var(--border2)'}`,background:withMaterials ? 'var(--accent)' : 'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s'}}>
              {withMaterials && <span style={{color:'var(--btn-text)',fontSize:'12px',fontWeight:700}}>✓</span>}
            </div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'15px',marginBottom:'2px'}}>Подбор материалов</div>
              <div style={{color:'var(--muted)',fontSize:'13px',fontWeight:300}}>AI подберёт конкретные материалы и включит их стоимость в смету</div>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={!file || loading} style={{width:'100%',padding:'16px',borderRadius:'4px',background:file && !loading ? 'var(--accent)' : 'var(--border2)',color:file && !loading ? 'var(--btn-text)' : 'var(--muted)',border:'none',fontFamily:"'Syne',sans-serif",fontSize:'15px',fontWeight:700,cursor:file && !loading ? 'pointer' : 'not-allowed',transition:'all 0.2s',marginBottom:'48px'}}>
            {loading ? (
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                <span style={{width:'18px',height:'18px',border:'2px solid var(--btn-text)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}></span>
                Анализируем чертёж...
              </span>
            ) : 'Составить смету'}
          </button>

          {error && (
            <div style={{background:'rgba(255,80,80,0.1)',border:'1px solid rgba(255,80,80,0.3)',borderRadius:'6px',padding:'16px',color:'#ff8080',marginBottom:'32px'}}>
              {error}
            </div>
          )}

          {estimate && (
            <div>
              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'32px',marginBottom:'24px'}}>
                <div style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Объект</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:'18px',fontWeight:700}}>{estimate.summary}</div>
              </div>

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                <span style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>Позиции сметы</span>
                <button
                  onClick={() => setEditMode(!editMode)}
                  style={{display:'flex',alignItems:'center',gap:'6px',background:editMode ? 'var(--accent)' : 'transparent',color:editMode ? 'var(--btn-text)' : 'var(--muted)',border:'1px solid',borderColor:editMode ? 'var(--accent)' : 'var(--border2)',borderRadius:'4px',padding:'6px 14px',cursor:'pointer',fontSize:'13px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.2s'}}
                >
                  {editMode ? '✓ Готово' : '✏ Редактировать'}
                </button>
              </div>

              <div style={{border:'1px solid var(--border)',borderRadius:'8px',overflow:'auto',marginBottom:'24px'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'14px',minWidth:'600px'}}>
                  <thead>
                    <tr style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}>
                      <th style={{padding:'14px 20px',textAlign:'left',color:'var(--muted)',fontWeight:500,fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Наименование</th>
                      <th style={{padding:'14px 20px',textAlign:'center',color:'var(--muted)',fontWeight:500,fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Ед.</th>
                      <th style={{padding:'14px 20px',textAlign:'right',color:'var(--muted)',fontWeight:500,fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',whiteSpace:'nowrap'}}>Кол-во</th>
                      <th style={{padding:'14px 20px',textAlign:'right',color:'var(--muted)',fontWeight:500,fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Цена</th>
                      <th style={{padding:'14px 20px',textAlign:'right',color:'var(--muted)',fontWeight:500,fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableItems.map((item, i) => (
                      <tr key={i} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'var(--bg)':'var(--bg2)'}}>
                        <td style={{padding:'12px 20px'}}>
                          {editMode
                            ? <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} style={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'4px',color:'var(--text)',width:'100%',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',padding:'4px 8px',outline:'none'}} />
                            : <span style={{color:'var(--text)'}}>{item.name}</span>
                          }
                        </td>
                        <td style={{padding:'12px 20px',textAlign:'center'}}>
                          {editMode
                            ? <input value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} style={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'4px',color:'var(--muted)',width:'52px',textAlign:'center',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',padding:'4px 6px',outline:'none'}} />
                            : <span style={{color:'var(--muted)'}}>{item.unit}</span>
                          }
                        </td>
                        <td style={{padding:'12px 20px',textAlign:'right'}}>
                          {editMode
                            ? <input type="number" value={item.qty} onChange={e => updateItem(i, 'qty', Number(e.target.value))} style={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'4px',color:'var(--muted)',width:'70px',textAlign:'right',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',padding:'4px 8px',outline:'none'}} />
                            : <span style={{color:'var(--muted)'}}>{item.qty}</span>
                          }
                        </td>
                        <td style={{padding:'12px 20px',textAlign:'right'}}>
                          {editMode
                            ? <input type="number" value={item.price} onChange={e => updateItem(i, 'price', Number(e.target.value))} style={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'4px',color:'var(--muted)',width:'100px',textAlign:'right',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',padding:'4px 8px',outline:'none'}} />
                            : <span style={{color:'var(--muted)'}}>{item.price.toLocaleString('ru-RU')} ₽</span>
                          }
                        </td>
                        <td style={{padding:'12px 20px',textAlign:'right'}}>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:'10px'}}>
                            <span style={{color:'var(--text)',fontWeight:500,whiteSpace:'nowrap'}}>{(item.qty*item.price).toLocaleString('ru-RU')} ₽</span>
                            {editMode && (
                              <button onClick={() => removeItem(i)} style={{background:'none',border:'1px solid var(--border2)',borderRadius:'4px',color:'var(--muted)',cursor:'pointer',fontSize:'12px',padding:'3px 8px',fontFamily:"'Syne',sans-serif",transition:'all 0.2s',whiteSpace:'nowrap'}}
                                onMouseOver={e => { e.currentTarget.style.borderColor='#ff8080'; e.currentTarget.style.color='#ff8080' }}
                                onMouseOut={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.color='var(--muted)' }}
                              >Удалить</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {editMode && (
                  <div style={{padding:'12px 20px',borderTop:'1px solid var(--border)'}}>
                    <button onClick={addItem} style={{background:'none',border:'1px dashed var(--border2)',borderRadius:'4px',color:'var(--muted)',padding:'8px 16px',cursor:'pointer',fontSize:'13px',fontFamily:"'Syne',sans-serif",fontWeight:600,width:'100%'}}>
                      + Добавить позицию
                    </button>
                  </div>
                )}
              </div>

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'24px 32px',marginBottom:'24px'}}>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:'16px',fontWeight:700}}>Итого</span>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:'28px',fontWeight:800,color:'var(--accent)'}}>{totalRub.toLocaleString('ru-RU')} ₽</span>
              </div>

              {estimate.notes && (
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'24px 32px',marginBottom:'24px'}}>
                  <div style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>Замечания</div>
                  <div style={{color:'var(--muted)',fontSize:'14px',lineHeight:1.6,fontWeight:300}}>{estimate.notes}</div>
                </div>
              )}

              <button onClick={downloadPDF} style={{width:'100%',padding:'14px',borderRadius:'4px',background:'transparent',color:'var(--accent)',border:'1px solid var(--accent)',fontFamily:"'Syne',sans-serif",fontSize:'15px',fontWeight:600,cursor:'pointer',transition:'all 0.2s'}}>
                Скачать PDF
              </button>
              <button onClick={downloadExcel} style={{width:'100%',padding:'14px',borderRadius:'4px',background:'transparent',color:'var(--muted)',border:'1px solid var(--border2)',fontFamily:"'Syne',sans-serif",fontSize:'15px',fontWeight:600,cursor:'pointer',transition:'all 0.2s',marginTop:'12px'}}>
                Скачать Excel (CSV)
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}