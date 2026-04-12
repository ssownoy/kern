'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [theme, setTheme] = useState('dark')
  const [scrolled, setScrolled] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formCompany, setFormCompany] = useState('')
  const [formModule, setFormModule] = useState('')
  const [formComment, setFormComment] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formLoading, setFormLoading] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    { q: 'Насколько точны сметы от AI?', a: 'AI анализирует видимые элементы чертежа и применяет актуальные рыночные цены региона. Точность зависит от качества чертежа — для детальных чертежей погрешность составляет 10-20%. Смету можно отредактировать вручную после генерации.' },
    { q: 'Какие форматы файлов поддерживаются?', a: 'AI-сметчик принимает PNG, JPG и PDF. Контроль качества работает с PNG и JPG. Рекомендуем загружать чёткие изображения с хорошим разрешением для лучшего результата.' },
    { q: 'Мои данные в безопасности?', a: 'Загружаемые файлы используются только для анализа и не хранятся на наших серверах дольше необходимого. История смет и документов хранится в зашифрованной базе данных и доступна только вам.' },
    { q: 'Сколько смет можно создать бесплатно?', a: 'На бесплатном тарифе доступно 5 смет в месяц. Контроль качества и генератор документов пока без ограничений. Для снятия лимитов напишите на kern.platform@yandex.ru.' },
    { q: 'Соответствуют ли документы российским стандартам?', a: 'Да — договор подряда составляется по ГК РФ главе 37, акт КС-2 по форме Госкомстата, техническое задание по ГОСТ. Документы готовы к подписанию, но рекомендуем проверить с юристом для крупных сделок.' },
    { q: 'Можно ли поделиться сметой с клиентом?', a: 'Да — в личном кабинете в каждой смете есть кнопка «Публичная ссылка». Клиент откроет смету по ссылке без регистрации и сможет скачать PDF.' },
  ]

  const handleSubmit = async () => {
    const errors: Record<string, string> = {}
    if (!formName.trim()) errors.name = 'Введите имя'
    if (!formPhone || formPhone.length < 18) errors.phone = 'Введите корректный номер'
    if (formEmail && !formEmail.includes('@')) errors.email = 'Введите корректный email'
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setFormLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, phone: formPhone, email: formEmail, company: formCompany, module: formModule, comment: formComment }),
      })
      if (res.ok) setSubmitted(true)
    } catch (e) { console.error(e) }
    finally { setFormLoading(false) }
  }

  useEffect(() => {
    const saved = localStorage.getItem('kern-theme')
    if (saved) setTheme(saved)
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('kern-theme', theme)
  }, [theme])

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    reveals.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      {/* NAV */}
      <nav id="nav" className={scrolled ? 'scrolled' : ''}>
        <a href="#" className="logo">Kern<span className="logo-dot">.</span></a>
        <ul className="nav-links">
          <li><a onClick={() => goTo('modules')}>Модули</a></li>
          <li><a onClick={() => goTo('advantages')}>Преимущества</a></li>
          <li><a onClick={() => goTo('pricing')}>Тарифы</a></li>
          <li><a onClick={() => goTo('contact')}>Контакты</a></li>
        </ul>
        <div className="nav-right">
          <button className="theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} aria-label="Сменить тему">
            <div className={`theme-knob${theme === 'light' ? ' light' : ''}`}></div>
          </button>
          <a href="/dashboard" className="nav-cabinet-inverted">Кабинет</a>
          <a onClick={() => goTo('contact')} className="nav-cta">Начать</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-glow"></div>
        <div className="hero-inner">
          <h1>AI- instruments<br />for construction<br /><em>companies of Russia.</em></h1>
          <p className="hero-sub">Estimates from drawings in 30 seconds. Quality control by photo. Contracts and acts according to Russian standards. Everything is free.</p>
          <div className="hero-actions">
            <a onClick={() => goTo('contact')} className="btn-primary">Начать бесплатно</a>
            <a onClick={() => goTo('modules')} className="btn-ghost">Смотреть модули <span className="arr">→</span></a>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">5×</span><div className="stat-label">Быстрее составление смет</div></div>
            <div className="stat"><span className="stat-num">3</span><div className="stat-label">Модуля доступно</div></div>
            <div className="stat"><span className="stat-num">0 ₽</span><div className="stat-label">Для старта</div></div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* MODULES */}
      <section id="modules">
        <div className="container">
          <div className="modules-head">
            <span className="sec-label">Платформа</span>
            <h2>Инструменты для<br />строительной компании</h2>
            <p className="sec-intro">Каждый модуль решает конкретную задачу — от сметы до контроля качества на объекте.</p>
          </div>
          <div className="modules-grid reveal">

            <div className="module-card" style={{cursor:'pointer',display:'flex',flexDirection:'column'}} onClick={() => window.location.href='/estimate'}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
                <div className="module-num">01</div>
                <span className="module-badge badge-live">Доступно</span>
              </div>
              <div className="module-icon">📐</div>
              <h3>AI-сметчик</h3>
              <p>Загрузите чертёж или фото объекта — получите готовую смету в рублях по актуальным рыночным ценам. Поддержка PDF, DWG, PNG.</p>
              <div style={{marginTop:'auto',paddingTop:'20px',display:'flex',alignItems:'center',gap:'6px',color:'var(--accent)',fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:600}}>Попробовать →</div>
            </div>

            <div className="module-card" style={{cursor:'pointer',display:'flex',flexDirection:'column'}} onClick={() => window.location.href='/quality'}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
                <div className="module-num">02</div>
                <span className="module-badge badge-live">Доступно</span>
              </div>
              <div className="module-icon">🔍</div>
              <h3>Контроль качества</h3>
              <p>Фото строительного объекта анализируется нейросетью. AI определяет дефекты, отклонения от норм и формирует акт осмотра.</p>
              <div style={{marginTop:'auto',paddingTop:'20px',display:'flex',alignItems:'center',gap:'6px',color:'var(--accent)',fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:600}}>Попробовать →</div>
            </div>

            <div className="module-card" style={{display:'flex',flexDirection:'column',cursor:'pointer'}} onClick={() => window.location.href='/documents'}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
                <div className="module-num">03</div>
                <span className="module-badge badge-live">Доступно</span>
              </div>
              <div className="module-icon">📋</div>
              <h3>Генератор документов</h3>
              <p>Контракты, разрешения и акты по российским стандартам (ГОСТ, СНиП). Генерация за 30 секунд, готово к подписанию.</p>
              <div style={{marginTop:'auto',paddingTop:'20px',display:'flex',alignItems:'center',gap:'6px',color:'var(--accent)',fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:600}}>Попробовать →</div>
            </div>

            <div className="module-card" style={{display:'flex',flexDirection:'column'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
                <div className="module-num">04</div>
                <span className="module-badge badge-soon">Скоро</span>
              </div>
              <div className="module-icon">🏗️</div>
              <h3>Тендерная платформа</h3>
              <p>Размещайте тендеры и получайте заявки от верифицированных подрядчиков. AI оценивает каждую заявку и ранжирует исполнителей.</p>
            </div>

          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* PROFESSIONALS */}
      <section id="professionals" className="prof-section">
        <div className="container">
          <div className="prof-inner">
            <div className="prof-left">
              <span className="sec-label">Раздел специалистов</span>
              <h2>Проверенные профессионалы строительной отрасли</h2>
              <p className="sec-intro">Архитекторы, инженеры, прорабы, сметчики — каждый профиль подтверждён документами и историей реальных объектов.</p>
              <div className="prof-features">
                <div className="prof-feat"><span className="prof-feat-icon">✓</span><div><strong>Верификация документов</strong><p>Квалификация, лицензии и допуски СРО проверяются вручную перед публикацией профиля.</p></div></div>
                <div className="prof-feat"><span className="prof-feat-icon">✓</span><div><strong>История объектов</strong><p>Каждый специалист прикрепляет завершённые проекты с фото, документацией и контактами заказчиков.</p></div></div>
                <div className="prof-feat"><span className="prof-feat-icon">✓</span><div><strong>Рейтинг и отзывы</strong><p>Оценки только от верифицированных заказчиков — без накрутки и анонимных комментариев.</p></div></div>
              </div>
              <span className="module-badge badge-soon" style={{marginTop:'32px',display:'inline-block'}}>Скоро</span>
            </div>
            <div className="prof-right">
              <div className="prof-card-demo">
                <div className="pcd-header">
                  <div className="pcd-avatar">АК</div>
                  <div><div className="pcd-name">Алексей Краснов</div><div className="pcd-role">Главный инженер-конструктор</div></div>
                  <div className="pcd-badge">✓ Верифицирован</div>
                </div>
                <div className="pcd-divider"></div>
                <div className="pcd-stats">
                  <div className="pcd-stat"><span className="pcd-num">14</span><span className="pcd-lbl">лет опыта</span></div>
                  <div className="pcd-stat"><span className="pcd-num">47</span><span className="pcd-lbl">объектов</span></div>
                  <div className="pcd-stat"><span className="pcd-num">4.9</span><span className="pcd-lbl">рейтинг</span></div>
                </div>
                <div className="pcd-divider"></div>
                <div className="pcd-tags-label">Специализация</div>
                <div className="pcd-tags">
                  <span className="pcd-tag">Жилые комплексы</span>
                  <span className="pcd-tag">Промышленные здания</span>
                  <span className="pcd-tag">Реконструкция</span>
                </div>
                <div className="pcd-divider"></div>
                <div className="pcd-docs-label">Документы</div>
                <div className="pcd-docs">
                  <div className="pcd-doc">📄 Диплом МГСУ — подтверждён</div>
                  <div className="pcd-doc">📄 Допуск СРО — действителен до 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ADVANTAGES */}
      <section id="advantages" className="adv-section">
        <div className="container">
          <span className="sec-label">Почему Kern</span>
          <h2>Создан для<br />российского рынка</h2>
          <div className="adv-grid">
            <div className="adv-item reveal"><div className="adv-num">01</div><h3>Российские стандарты</h3><p>ГОСТ, СНиП, ФЕР, ТЕР — все нормативы встроены. Сметы и документы соответствуют требованиям законодательства РФ.</p></div>
            <div className="adv-item reveal rd1"><div className="adv-num">02</div><h3>Скорость работы</h3><p>Смета, которая занимала рабочий день, готова за 3 минуты. AI работает круглосуточно без ошибок в расчётах.</p></div>
            <div className="adv-item reveal rd2"><div className="adv-num">03</div><h3>Безопасность данных</h3><p>Данные хранятся на российских серверах. Чертежи и документы компании полностью конфиденциальны.</p></div>
            <div className="adv-item reveal"><div className="adv-num">04</div><h3>Прозрачные цены</h3><p>Freemium-модель: базовые функции бесплатно навсегда. Никаких скрытых комиссий и обязательных подписок.</p></div>
            <div className="adv-item reveal rd1"><div className="adv-num">05</div><h3>Верифицированные специалисты</h3><p>База проверенных профессионалов с историей объектов и рейтингом. Только реальные люди с подтверждёнными документами.</p></div>
            <div className="adv-item reveal rd2"><div className="adv-num">06</div><h3>Аналитика проектов</h3><p>Дашборд по каждому объекту: бюджет, сроки, качество. Полная картина без Excel-таблиц в одном интерфейсе.</p></div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* PRICING */}
      <section id="pricing">
        <div className="container">
          <span className="sec-label">Тарифы</span>
          <h2>Доступ на период<br />раннего запуска</h2>
          <p style={{color:'var(--muted)',fontSize:'17px',marginTop:'12px',fontWeight:300}}>Сейчас платформа полностью бесплатна. Платные тарифы появятся позже.</p>
          <div className="pricing-grid reveal">
            <div className="price-card">
              <div className="price-plan">Старт</div>
              <div className="price-amount">Бесплатно</div>
              <p className="price-desc">Для малого бизнеса и частных специалистов.</p>
              <div className="price-divider"></div>
              <ul className="price-features">
                <li>AI-сметчик</li>
                <li>Контроль качества по фото</li>
                <li>История смет и проверок</li>
                <li>Скачать PDF и Excel</li>
              </ul>
              <button className="price-btn" onClick={() => goTo('contact')}>Начать бесплатно</button>
            </div>
            <div className="price-card featured">
              <div className="featured-label">Скоро</div>
              <div className="price-plan">Профи</div>
              <div className="price-amount" style={{fontSize:'26px',paddingTop:'8px'}}>Скоро</div>
              <p className="price-desc">Расширенный функционал — в разработке.</p>
              <div className="price-divider"></div>
              <ul className="price-features">
                <li>Безлимитные сметы</li>
                <li>Генератор документов</li>
                <li>Тендерная платформа</li>
                <li>До 5 пользователей</li>
                <li>Приоритетная поддержка</li>
              </ul>
              <button className="price-btn" onClick={() => goTo('contact')}>Оставить заявку</button>
            </div>
            <div className="price-card">
              <div className="price-plan">Корпоратив</div>
              <div className="price-amount" style={{fontSize:'26px',paddingTop:'8px'}}>По запросу</div>
              <p className="price-desc">Для девелоперов и крупных холдингов.</p>
              <div className="price-divider"></div>
              <ul className="price-features">
                <li>Все модули платформы</li>
                <li>Неограниченные пользователи</li>
                <li>Интеграция с 1С и Битрикс</li>
                <li>Выделенный менеджер</li>
                <li>SLA 99.9%</li>
              </ul>
              <button className="price-btn" onClick={() => goTo('contact')}>Обсудить условия</button>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      <section id="faq">
        <div className="container">
          <span className="sec-label">FAQ</span>
          <h2>Частые вопросы</h2>
          <div style={{maxWidth:'720px',marginTop:'40px',display:'flex',flexDirection:'column',gap:'1px',background:'var(--border)',border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden'}}>
            {faqs.map((item, i) => (
              <div key={i} style={{background:'var(--bg)'}}>
                <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{padding:'20px 24px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'16px'}} onMouseOver={e=>e.currentTarget.style.background='var(--card-hover)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{fontFamily:"'Syne',sans-serif",fontSize:'15px',fontWeight:600}}>{item.q}</span>
                  <span style={{color:'var(--muted)',fontSize:'20px',flexShrink:0,transition:'transform 0.2s',display:'block',transform:openFaq===i?'rotate(45deg)':'rotate(0deg)'}}>+</span>
                </div>
                {openFaq === i && (
                  <div style={{padding:'0 24px 20px',color:'var(--muted)',fontSize:'14px',lineHeight:1.7,borderTop:'1px solid var(--border)'}}>{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / CONTACT */}
      <section id="contact" className="cta-section">
        <div className="cta-glow"></div>
        <div className="container">
          <span className="sec-label">Ранний доступ</span>
          <h2>Начните работать<br />с Kern сегодня</h2>
          <p className="cta-lead">Оставьте заявку — свяжемся в течение 24 часов и настроим платформу под ваши задачи.</p>
          <div className="form-wrap reveal">
            <div style={{marginBottom:'28px'}}>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:'20px',fontWeight:700,marginBottom:'6px'}}>Оставьте заявку</h3>
              <p style={{color:'var(--muted)',fontSize:'14px',fontWeight:300}}>Свяжемся в течение 24 часов</p>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Имя *</label>
                <input type="text" value={formName} onChange={e => { setFormName(e.target.value); if(formErrors.name) setFormErrors(p=>({...p,name:''})) }} placeholder="Иван Петров" style={{borderColor:formErrors.name?'#ff8080':undefined}} />
                {formErrors.name && <span style={{color:'#ff8080',fontSize:'12px',marginTop:'4px',display:'block'}}>{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Телефон *</label>
                <input type="tel" value={formPhone} onChange={e => {
                  let val = e.target.value.replace(/\D/g, '')
                  if (val.startsWith('7') || val.startsWith('8')) val = val.slice(1)
                  val = val.slice(0, 10)
                  let formatted = '+7'
                  if (val.length > 0) formatted += ' (' + val.slice(0, 3)
                  if (val.length >= 3) formatted += ') ' + val.slice(3, 6)
                  if (val.length >= 6) formatted += '-' + val.slice(6, 8)
                  if (val.length >= 8) formatted += '-' + val.slice(8, 10)
                  setFormPhone(formatted)
                  if(formErrors.phone) setFormErrors(p=>({...p,phone:''}))
                }} placeholder="+7 (999) 000-00-00" style={{borderColor:formErrors.phone?'#ff8080':undefined}} />
                {formErrors.phone && <span style={{color:'#ff8080',fontSize:'12px',marginTop:'4px',display:'block'}}>{formErrors.phone}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formEmail} onChange={e => { setFormEmail(e.target.value); if(formErrors.email) setFormErrors(p=>({...p,email:''})) }} onBlur={e => { if(e.target.value && !e.target.value.includes('@')) setFormErrors(p=>({...p,email:'Введите корректный email'})) }} placeholder="ivan@company.ru" style={{borderColor:formErrors.email?'#ff8080':undefined}} />
              {formErrors.email && <span style={{color:'#ff8080',fontSize:'12px',marginTop:'4px',display:'block'}}>{formErrors.email}</span>}
            </div>
            <div className="form-group">
              <label>Компания</label>
              <input type="text" value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="ООО Строй Групп" />
            </div>
            <div className="form-group">
              <label>Интересует модуль</label>
              <select value={formModule} onChange={e => setFormModule(e.target.value)}>
                <option value="">Выберите...</option>
                <option>AI-сметчик</option>
                <option>Контроль качества</option>
                <option>Генератор документов</option>
                <option>Тендерная платформа</option>
                <option>Весь функционал</option>
              </select>
            </div>
            <div className="form-group">
              <label>Комментарий</label>
              <textarea value={formComment} onChange={e => setFormComment(e.target.value)} placeholder="Расскажите о вашей задаче..." />
            </div>
            <button className="form-submit" onClick={handleSubmit} disabled={formLoading || submitted}>
              {formLoading ? 'Отправляем...' : submitted ? 'Заявка отправлена ✓' : 'Отправить заявку →'}
            </button>
            <p className="form-note">Нажимая кнопку, вы соглашаетесь с <a href="/privacy" style={{color:'var(--accent)'}}>политикой конфиденциальности</a></p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container" style={{maxWidth:'1100px',margin:'0 auto',display:'flex',flexDirection:'column',gap:'40px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'40px',flexWrap:'wrap'}}>
            <div>
              <div className="footer-logo">Kern<span className="logo-dot">.</span></div>
              <p style={{color:'var(--muted)',fontSize:'13px',marginTop:'10px',maxWidth:'220px',lineHeight:1.6,fontWeight:300}}>AI-платформа для строительной индустрии России</p>
            </div>
            <div style={{display:'flex',gap:'60px',flexWrap:'wrap'}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:'12px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'16px'}}>Платформа</div>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  <a onClick={() => goTo('modules')} style={{color:'var(--text)',textDecoration:'none',fontSize:'14px',cursor:'pointer'}}>Модули</a>
                  <a onClick={() => goTo('advantages')} style={{color:'var(--text)',textDecoration:'none',fontSize:'14px',cursor:'pointer'}}>Преимущества</a>
                  <a onClick={() => goTo('pricing')} style={{color:'var(--text)',textDecoration:'none',fontSize:'14px',cursor:'pointer'}}>Тарифы</a>
                </div>
              </div>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:'12px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'16px'}}>Инструменты</div>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  <a href="/estimate" style={{color:'var(--text)',textDecoration:'none',fontSize:'14px'}}>AI-сметчик</a>
                  <a href="/quality" style={{color:'var(--text)',textDecoration:'none',fontSize:'14px'}}>Контроль качества</a>
                  <a href="/dashboard" style={{color:'var(--text)',textDecoration:'none',fontSize:'14px'}}>Личный кабинет</a>
                </div>
              </div>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:'12px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'16px'}}>Компания</div>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  <a href="/privacy" style={{color:'var(--text)',textDecoration:'none',fontSize:'14px'}}>Конфиденциальность</a>
                  <a href="/about" style={{color:'var(--text)',textDecoration:'none',fontSize:'14px'}}>О проекте</a>
                  <a href="/terms" style={{color:'var(--text)',textDecoration:'none',fontSize:'14px'}}>Соглашение</a>
                  <a onClick={() => goTo('contact')} style={{color:'var(--text)',textDecoration:'none',fontSize:'14px',cursor:'pointer'}}>Контакты</a>
                </div>
              </div>
            </div>
          </div>
          <div style={{borderTop:'1px solid var(--border)',paddingTop:'24px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
            <span style={{fontSize:'13px',color:'var(--muted)'}}>© 2026 Kern. Все права защищены.</span>
            <span style={{fontSize:'13px',color:'var(--muted)'}}>kern.platform@yandex.ru</span>
          </div>
        </div>
      </footer>
    </>
  )
}
