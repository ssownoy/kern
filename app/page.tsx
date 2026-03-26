'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [theme, setTheme] = useState('dark')
  const [scrolled, setScrolled] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formCompany, setFormCompany] = useState('')
  const [formModule, setFormModule] = useState('')
  const [formComment, setFormComment] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('kern-theme')
    if (saved) setTheme(saved)

    const handleSubmit = async () => {
  console.log('submit clicked', { formName, formPhone, formCompany, formModule, formComment })
  
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formName,
        phone: formPhone,
        company: formCompany,
        module: formModule,
        comment: formComment,
      }),
    })
    console.log('response status:', res.status)
    const data = await res.json()
    console.log('response data:', data)
    if (res.ok) setSubmitted(true)
  } catch (e) {
    console.error('fetch error:', e)
  }
}

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
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) }
      })
    }, { threshold: 0.1 })
    reveals.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* NAV */}
      <nav className={scrolled ? 'scrolled' : ''}>
        <a href="#" className="logo">Kern<span className="logo-dot">.</span></a>
        <ul className="nav-links">
          <li><a onClick={() => goTo('modules')}>Модули</a></li>
          <li><a onClick={() => goTo('advantages')}>Преимущества</a></li>
          <li><a onClick={() => goTo('pricing')}>Тарифы</a></li>
          <li><a onClick={() => goTo('contact')}>Контакты</a></li>
        </ul>
        <div className="nav-right">
          <button className="theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} aria-label="Сменить тему">
            <span className="theme-icon moon">🌙</span>
            <div className={`theme-knob${theme === 'light' ? ' light' : ''}`}></div>
            <span className="theme-icon sun">☀️</span>
          </button>
          <a onClick={() => goTo('contact')} className="nav-cta">Начать</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-glow"></div>
        <div className="hero-inner">
          <h1>Строительство.<br /><em>Точнее.</em><br />Быстрее.</h1>
          <p className="hero-sub">Kern автоматизирует сметы, контроль качества и документооборот для строительных компаний России — с помощью искусственного интеллекта.</p>
          <div className="hero-actions">
            <a onClick={() => goTo('contact')} className="btn-primary">Начать бесплатно</a>
            <a onClick={() => goTo('modules')} className="btn-ghost">Смотреть модули <span className="arr">→</span></a>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">X5</span><div className="stat-label">Быстрее составление смет</div></div>
            <div className="stat"><span className="stat-num">4</span><div className="stat-label">Модуля платформы</div></div>
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
            <h2>Четыре модуля для<br />строительной компании</h2>
            <p className="sec-intro">Каждый модуль решает конкретную задачу — от сметы до поиска проверенного специалиста.</p>
          </div>
          <div className="modules-grid reveal">
            <a href="/estimate" style={{textDecoration:'none',color:'inherit'}}>
            <div className="module-card" style={{cursor:'pointer'}}>
              <div className="module-num">01</div>
              <div className="module-icon">📐</div>
              <h3>AI-сметчик</h3>
              <p>Загрузите чертёж или фото объекта — получите готовую смету в рублях по актуальным рыночным ценам. Поддержка PDF, DWG, PNG.</p>
              <span className="module-badge badge-live">Доступно</span>
            </div>
            </a>
            <div className="module-card">
              <div className="module-num">02</div>
              <div className="module-icon">🔍</div>
              <h3>Контроль качества</h3>
              <p>Фото строительного объекта анализируется нейросетью. AI определяет дефекты, отклонения от норм и формирует акт осмотра.</p>
              <span className="module-badge badge-soon">Скоро</span>
            </div>
            <div className="module-card">
              <div className="module-num">03</div>
              <div className="module-icon">📋</div>
              <h3>Генератор документов</h3>
              <p>Контракты, разрешения и акты по российским стандартам (ГОСТ, СНиП). Генерация за 30 секунд, готово к подписанию.</p>
              <span className="module-badge badge-soon">Скоро</span>
            </div>
            <div className="module-card">
              <div className="module-num">04</div>
              <div className="module-icon">🏗️</div>
              <h3>Тендерная платформа</h3>
              <p>Размещайте тендеры и получайте заявки от верифицированных подрядчиков. AI оценивает каждую заявку и ранжирует исполнителей.</p>
              <span className="module-badge badge-dev">В разработке</span>
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
                <div className="prof-feat">
                  <span className="prof-feat-icon">✓</span>
                  <div><strong>Верификация документов</strong><p>Квалификация, лицензии и допуски СРО проверяются вручную перед публикацией профиля.</p></div>
                </div>
                <div className="prof-feat">
                  <span className="prof-feat-icon">✓</span>
                  <div><strong>История объектов</strong><p>Каждый специалист прикрепляет завершённые проекты с фото, документацией и контактами заказчиков.</p></div>
                </div>
                <div className="prof-feat">
                  <span className="prof-feat-icon">✓</span>
                  <div><strong>Рейтинг и отзывы</strong><p>Оценки только от верифицированных заказчиков — без накрутки и анонимных комментариев.</p></div>
                </div>
              </div>
              <span className="module-badge badge-dev" style={{marginTop:'32px',display:'inline-block'}}>В разработке</span>
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
          <h2>Начните бесплатно,<br />масштабируйте когда нужно</h2>
          <div className="pricing-grid reveal">
            <div className="price-card">
              <div className="price-plan">Старт</div>
              <div className="price-amount">0 <span className="price-period">₽/мес</span></div>
              <p className="price-desc">Для малого бизнеса и частных специалистов.</p>
              <div className="price-divider"></div>
              <ul className="price-features">
                <li>5 смет в месяц</li>
                <li>AI-анализ чертежей (PNG, PDF)</li>
                <li>Базовые шаблоны документов</li>
                <li>Профиль специалиста</li>
                <li>1 пользователь</li>
              </ul>
              <button className="price-btn" onClick={() => goTo('contact')}>Начать бесплатно</button>
            </div>
            <div className="price-card featured">
              <div className="featured-label">Популярный</div>
              <div className="price-plan">Профи</div>
              <div className="price-amount"><sup>от </sup>4 900 <span className="price-period">₽/мес</span></div>
              <p className="price-desc">Для строительных компаний и подрядчиков.</p>
              <div className="price-divider"></div>
              <ul className="price-features">
                <li>Безлимитные сметы</li>
                <li>Контроль качества по фото</li>
                <li>Генератор документов (ГОСТ)</li>
                <li>Тендеры и поиск специалистов</li>
                <li>До 5 пользователей</li>
                <li>Приоритетная поддержка</li>
              </ul>
              <button className="price-btn primary-btn" onClick={() => goTo('contact')}>Оставить заявку</button>
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

      {/* CTA / CONTACT */}
      <section id="contact" className="cta-section">
        <div className="cta-glow"></div>
        <div className="container">
          <span className="sec-label">Ранний доступ</span>
          <h2>Начните работать<br />с Kern сегодня</h2>
          <p className="cta-lead">Оставьте заявку — свяжемся в течение 24 часов и настроим платформу под ваши задачи.</p>
          <div className="form-wrap reveal">
            <div className="form-row">
              <div className="form-group"><label>Имя</label><input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Иван Петров" /></div>
              <div className="form-group"><label>Телефон</label><input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+7 (999) 000-00-00" /></div>
            </div>
            <div className="form-group"><label>Компания</label><input type="text" value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="ООО Строй Групп" /></div>
            <div className="form-group">
              <label>Интересует модуль</label>
              <select value={formModule} onChange={e => setFormModule(e.target.value)}>
                <option value="">Выберите...</option>
                <option>AI-сметчик</option>
                <option>Контроль качества</option>
                <option>Генератор документов</option>
                <option>Тендерная платформа</option>
                <option>Платформа профессионалов</option>
                <option>Весь функционал</option>
              </select>
            </div>
            <div className="form-group"><label>Комментарий</label><textarea value={formComment} onChange={e => setFormComment(e.target.value)} placeholder="Расскажите о задаче..." /></div>
            <button id="submitBtn" className="form-submit" onClick={handleSubmit} disabled={formLoading || submitted}>
              {formLoading ? 'Отправляем...' : submitted ? 'Заявка отправлена ✓' : 'Отправить заявку'}
            </button>
            <p className="form-note">Нажимая кнопку, вы соглашаетесь с <a href="/privacy" style={{color:'var(--accent)'}}>политикой конфиденциальности</a></p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Kern<span className="logo-dot">.</span></div>
        <ul className="footer-links">
          <li><a onClick={() => goTo('modules')}>Модули</a></li>
          <li><a onClick={() => goTo('advantages')}>Преимущества</a></li>
          <li><a onClick={() => goTo('pricing')}>Тарифы</a></li>
          <li><a onClick={() => goTo('contact')}>Контакты</a></li>
          <li><a href="/privacy">Конфиденциальность</a></li>
          <li><a href="/terms">Соглашение</a></li>
        </ul>
        <span className="footer-copy">© 2026 Kern. Все права защищены.</span>
      </footer>
    </>
  )
}
