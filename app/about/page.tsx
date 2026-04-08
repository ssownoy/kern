'use client'

import { useState, useEffect } from 'react'

export default function AboutPage() {
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)

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

  if (!mounted) return null

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); @media (max-width:600px) { .about-container { padding: 80px 20px 60px !important; } .about-hero h1 { font-size: 36px !important; } .values-grid { grid-template-columns: 1fr !important; } .timeline-item { flex-direction: column !important; gap: 8px !important; } .timeline-date { width: auto !important; } }`}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Unbounded',sans-serif",fontSize:'20px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>Kern<span style={{color:'var(--accent)'}}>.</span></a>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <a href="/dashboard" style={{display:'flex',alignItems:'center',gap:'6px',color:'var(--text)',fontSize:'13px',textDecoration:'none',border:'1px solid var(--border2)',borderRadius:'4px',padding:'6px 14px',fontFamily:"'Unbounded',sans-serif",fontWeight:600,transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--text)'}}>
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

      <div className="about-container" style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",padding:'80px 40px 80px'}}>
        <div style={{maxWidth:'760px',margin:'0 auto'}}>

          <a href="/" style={{color:'var(--muted)',fontSize:'13px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'5px',marginBottom:'48px'}}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            На главную
          </a>

          {/* Hero */}
          <div className="about-hero" style={{marginBottom:'64px'}}>
            <div style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'16px'}}>О проекте</div>
            <h1 style={{fontFamily:"'Unbounded',sans-serif",fontSize:'clamp(36px,5vw,56px)',fontWeight:800,letterSpacing:'-0.03em',lineHeight:1.05,marginBottom:'24px'}}>
              Строительство становится<br />точнее с AI
            </h1>
            <p style={{fontSize:'17px',color:'var(--muted)',lineHeight:1.7,fontWeight:300,maxWidth:'580px'}}>
              Kern — AI-платформа для автоматизации рутинных задач строительных компаний России. Мы делаем профессиональные инструменты доступными для каждого специалиста отрасли.
            </p>
          </div>

          <div style={{borderTop:'1px solid var(--border)',marginBottom:'64px'}}></div>

          {/* Mission */}
          <div style={{marginBottom:'64px'}}>
            <div style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'16px'}}>Миссия</div>
            <h2 style={{fontFamily:"'Unbounded',sans-serif",fontSize:'clamp(22px,3vw,30px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'16px'}}>Почему мы делаем Kern</h2>
            <p style={{fontSize:'15px',color:'var(--muted)',lineHeight:1.75,marginBottom:'16px'}}>Строительная отрасль России — одна из крупнейших в экономике, но при этом одна из наименее цифровизированных. Сметчики тратят дни на расчёты, которые AI делает за минуты. Прорабы вручную составляют документы по шаблонам из 90-х. Контроль качества ведётся на бумаге.</p>
            <p style={{fontSize:'15px',color:'var(--muted)',lineHeight:1.75}}>Kern создан чтобы изменить это. Не заменить специалистов — а дать им инструменты, которые в десятки раз ускоряют рутину и позволяют сосредоточиться на главном.</p>
          </div>

          <div style={{borderTop:'1px solid var(--border)',marginBottom:'64px'}}></div>

          {/* Values */}
          <div style={{marginBottom:'64px'}}>
            <div style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'16px'}}>Принципы</div>
            <h2 style={{fontFamily:"'Unbounded',sans-serif",fontSize:'clamp(22px,3vw,30px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'32px'}}>На чём строится платформа</h2>
            <div className="values-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
              {[
                { num:'01', title:'Российские стандарты', desc:'ГОСТ, СНиП, ФЕР, ТЕР — все нормативы встроены в платформу. Документы соответствуют требованиям законодательства РФ.' },
                { num:'02', title:'Скорость без потери качества', desc:'Смета за 30 секунд — не значит плохая смета. AI анализирует чертёж и применяет региональные цены и коэффициенты.' },
                { num:'03', title:'Доступность', desc:'Базовые функции бесплатно навсегда. Kern должен быть доступен малому бизнесу и частным специалистам — не только корпорациям.' },
                { num:'04', title:'Простота', desc:'Никаких сложных настроек и обучения. Загрузил — получил результат. Профессиональный инструмент с простым интерфейсом.' },
              ].map(v => (
                <div key={v.num} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'24px'}}>
                  <div style={{fontSize:'11px',letterSpacing:'0.1em',color:'var(--muted)',marginBottom:'10px'}}>{v.num}</div>
                  <div style={{fontFamily:"'Unbounded',sans-serif",fontSize:'15px',fontWeight:700,marginBottom:'8px'}}>{v.title}</div>
                  <div style={{color:'var(--muted)',fontSize:'13px',lineHeight:1.6}}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{borderTop:'1px solid var(--border)',marginBottom:'64px'}}></div>

          {/* Timeline */}
          <div style={{marginBottom:'64px'}}>
            <div style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'16px'}}>История</div>
            <h2 style={{fontFamily:"'Unbounded',sans-serif",fontSize:'clamp(22px,3vw,30px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'32px'}}>Как развивается Kern</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'1px',background:'var(--border)',border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden'}}>
              {[
                { date:'Янв 2026', title:'Идея и концепция', desc:'Формирование концепции AI-платформы для строительной отрасли России.' },
                { date:'Фев 2026', title:'Разработка MVP', desc:'Создание AI-сметчика — первого и ключевого модуля платформы.' },
                { date:'Март 2026', title:'Запуск платформы', desc:'Публичный запуск Kern с тремя модулями: сметчик, контроль качества, генератор документов.' },
                { date:'Апр 2026', title:'Рост и улучшения', desc:'Редизайн модулей, мобильная версия, личный кабинет, публичные ссылки на сметы.' },
                { date:'2026', title:'Тендерная платформа', desc:'Запуск модуля тендеров с верифицированными подрядчиками — в разработке.', soon: true },
                { date:'2026', title:'Монетизация', desc:'Платные тарифы для профессионального использования.', soon: true },
              ].map((item, i) => (
                <div key={i} className="timeline-item" style={{display:'flex',gap:'24px',padding:'18px 24px',background:'var(--bg)',borderBottom: i < 5 ? '1px solid var(--border)' : 'none',opacity:item.soon ? 0.5 : 1}}>
                  <div className="timeline-date" style={{width:'80px',flexShrink:0,fontFamily:"'Unbounded',sans-serif",fontSize:'12px',fontWeight:600,color:'var(--accent)',paddingTop:'2px'}}>{item.date}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                      <div style={{fontFamily:"'Unbounded',sans-serif",fontSize:'14px',fontWeight:700}}>{item.title}</div>
                      {item.soon && <span style={{fontSize:'10px',color:'var(--muted)',border:'1px solid var(--border2)',padding:'1px 7px',borderRadius:'2px',letterSpacing:'0.05em'}}>Скоро</span>}
                    </div>
                    <div style={{color:'var(--muted)',fontSize:'13px',lineHeight:1.5}}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{borderTop:'1px solid var(--border)',marginBottom:'64px'}}></div>

          {/* Ecosystem */}
          <div style={{marginBottom:'64px'}}>
            <div style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'16px'}}>Экосистема</div>
            <h2 style={{fontFamily:"'Unbounded',sans-serif",fontSize:'clamp(22px,3vw,30px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'16px'}}>Kern — это больше чем SaaS</h2>
            <p style={{fontSize:'15px',color:'var(--muted)',lineHeight:1.75,marginBottom:'32px'}}>Kern AI — первый продукт в экосистеме. В будущем платформа объединит несколько направлений строительной индустрии.</p>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {[
                { name:'Kern AI', desc:'SaaS-платформа с AI-инструментами для строительных компаний', status:'Доступно', live:true },
                { name:'Kern Materials', desc:'Маркетплейс строительных материалов с прямыми поставками', status:'Скоро', live:false },
                { name:'Kern Build', desc:'Строительная компания частных домов под управлением AI', status:'Скоро', live:false },
              ].map(product => (
                <div key={product.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px',padding:'18px 24px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px'}}>
                  <div>
                    <div style={{fontFamily:"'Unbounded',sans-serif",fontSize:'15px',fontWeight:700,marginBottom:'4px'}}>{product.name}</div>
                    <div style={{color:'var(--muted)',fontSize:'13px'}}>{product.desc}</div>
                  </div>
                  <span style={{fontSize:'11px',fontFamily:"'Unbounded',sans-serif",fontWeight:600,color:product.live?'var(--accent)':'var(--muted)',border:`1px solid ${product.live?'var(--tag-border)':'var(--border2)'}`,background:product.live?'var(--tag-bg)':'transparent',padding:'3px 10px',borderRadius:'3px',whiteSpace:'nowrap',flexShrink:0,letterSpacing:'0.05em'}}>{product.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'10px',padding:'40px',textAlign:'center'}}>
            <div style={{fontFamily:"'Unbounded',sans-serif",fontSize:'22px',fontWeight:700,marginBottom:'10px'}}>Попробуйте Kern бесплатно</div>
            <p style={{color:'var(--muted)',fontSize:'14px',marginBottom:'24px',lineHeight:1.6}}>Загрузите чертёж и получите смету за 30 секунд.<br />Никакой оплаты — сразу начать работу.</p>
            <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
              <a href="/estimate" style={{background:'var(--accent)',color:'var(--btn-text)',padding:'12px 28px',borderRadius:'4px',textDecoration:'none',fontFamily:"'Unbounded',sans-serif",fontWeight:700,fontSize:'14px'}}>AI-сметчик →</a>
              <a href="mailto:kern.platform@yandex.ru" style={{color:'var(--muted)',padding:'12px 28px',borderRadius:'4px',textDecoration:'none',fontFamily:"'Unbounded',sans-serif",fontWeight:600,fontSize:'14px',border:'1px solid var(--border2)'}}>Написать нам</a>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
