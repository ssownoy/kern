'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [theme, setTheme] = useState('dark')
  const router = useRouter()

  useEffect(() => {
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

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Неверный email или пароль')
      else router.push('/estimate')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError('Ошибка регистрации. Попробуйте другой email.')
      else setMessage('Проверьте почту — отправили письмо для подтверждения')
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 52px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'22px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>
          Kern<span style={{color:'var(--accent)'}}>.</span>
        </a>
        <button onClick={toggleTheme} style={{width:'42px',height:'23px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'12px',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}}>
          <span style={{fontSize:'10px',position:'absolute',pointerEvents:'none',left:'5px'}}>🌙</span>
          <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'var(--accent)',transition:'transform 0.3s',flexShrink:0,transform:theme==='light'?'translateX(19px)':'translateX(0)'}}></div>
          <span style={{fontSize:'10px',position:'absolute',pointerEvents:'none',right:'4px'}}>☀️</span>
        </button>
      </nav>

      <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:'100px 24px',fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{width:'100%',maxWidth:'420px'}}>
          <span style={{fontSize:'11px',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'14px',display:'block'}}>
            {isLogin ? 'Вход' : 'Регистрация'}
          </span>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'36px',fontWeight:800,letterSpacing:'-0.02em',marginBottom:'8px',color:'var(--text)'}}>
            {isLogin ? 'Войти в Kern' : 'Создать аккаунт'}
          </h1>
          <p style={{color:'var(--muted)',fontSize:'15px',fontWeight:300,marginBottom:'40px'}}>
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <span onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null) }} style={{color:'var(--accent)',cursor:'pointer',textDecoration:'underline'}}>
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </span>
          </p>

          <div style={{background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:'8px',padding:'36px'}}>
            <div style={{display:'flex',flexDirection:'column',gap:'7px',marginBottom:'16px'}}>
              <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)'}}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ivan@company.ru"
                style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'4px',padding:'11px 14px',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",fontSize:'15px',outline:'none',width:'100%'}}
              />
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'7px',marginBottom:'24px'}}>
              <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)'}}>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="минимум 6 символов"
                style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'4px',padding:'11px 14px',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",fontSize:'15px',outline:'none',width:'100%'}}
              />
            </div>

            {error && (
              <div style={{background:'rgba(255,80,80,0.1)',border:'1px solid rgba(255,80,80,0.3)',borderRadius:'6px',padding:'12px 16px',color:'#ff8080',fontSize:'14px',marginBottom:'16px'}}>
                {error}
              </div>
            )}
            {message && (
              <div style={{background:'rgba(80,200,80,0.1)',border:'1px solid rgba(80,200,80,0.3)',borderRadius:'6px',padding:'12px 16px',color:'#80c880',fontSize:'14px',marginBottom:'16px'}}>
                {message}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              style={{width:'100%',padding:'14px',borderRadius:'4px',background:email && password && !loading ? 'var(--accent)' : 'var(--border2)',color:email && password && !loading ? 'var(--btn-text)' : 'var(--muted)',border:'none',fontFamily:"'Syne',sans-serif",fontSize:'15px',fontWeight:700,cursor:email && password && !loading ? 'pointer' : 'not-allowed',transition:'all 0.2s'}}>
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Создать аккаунт'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
