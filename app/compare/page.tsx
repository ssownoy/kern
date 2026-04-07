'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ComparePage() {
  const [estimates, setEstimates] = useState<any[]>([])
  const [leftId, setLeftId] = useState<string>('')
  const [rightId, setRightId] = useState<string>('')
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('kern-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      loadEstimates(session.user.id)
    })
  }, [])

  const loadEstimates = async (userId: string) => {
    const { data } = await supabase.from('estimates').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (data) setEstimates(data)
    setLoading(false)
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('kern-theme', next)
  }

  const left = estimates.find(e => e.id === leftId)
  const right = estimates.find(e => e.id === rightId)

  const leftItems: any[] = left?.items || []
  const rightItems: any[] = right?.items || []
  const leftTotal = leftItems.reduce((s: number, i: any) => s + i.qty * i.price, 0)
  const rightTotal = rightItems.reduce((s: number, i: any) => s + i.qty * i.price, 0)
  const diff = rightTotal - leftTotal
  const diffPct = leftTotal > 0 ? ((diff / leftTotal) * 100).toFixed(1) : '0'

  const allNames = Array.from(new Set([...leftItems.map((i: any) => i.name), ...rightItems.map((i: any) => i.name)]))

  const selectStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '10px 14px',
    color: 'var(--text)',
    fontFamily: "'DM Sans',sans-serif",
    fontSize: '14px',
    outline: 'none',
    width: '100%',
  }

  if (!mounted) return null

  return (
    <div lang="ru">
      <style>{`
  @charset "UTF-8";
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  @media (max-width:600px) { .compare-selectors { flex-direction: column !important; } .compare-totals { flex-direction: column !important; } .compare-container { padding: 80px 16px 60px !important; } }
`}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',background:'var(--bg)',borderBottom:'1px solid var(--border)'}}>
        <a href="/" style={{fontFamily:"'Syne',sans-serif",fontSize:'20px',fontWeight:800,color:'var(--text)',textDecoration:'none',letterSpacing:'-0.5px'}}>Kern<span style={{color:'var(--accent)'}}>.</span></a>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <a href="/dashboard" style={{display:'flex',alignItems:'center',gap:'6px',color:'var(--text)',fontSize:'13px',textDecoration:'none',border:'1px solid var(--border2)',borderRadius:'4px',padding:'6px 14px',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--text)'}}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Êàáèíåò
          </a>
          <button onClick={toggleTheme} style={{width:'42px',height:'23px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'12px',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',padding:'0 3px',flexShrink:0}}>
            <span style={{fontSize:'10px',position:'absolute',left:'5px',pointerEvents:'none'}}>ð</span>
            <div style={{width:'17px',height:'17px',borderRadius:'50%',background:'var(--accent)',transition:'transform 0.3s',flexShrink:0,transform:theme==='light'?'translateX(19px)':'translateX(0)'}}></div>
            <span style={{fontSize:'10px',position:'absolute',right:'4px',pointerEvents:'none'}}></span>
          </button>
        </div>
      </nav>

      <div className="compare-container" style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",padding:'80px 40px 80px'}}>
        <div style={{maxWidth:'1000px',margin:'0 auto'}}>

          <a href="/dashboard" style={{color:'var(--muted)',fontSize:'13px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'5px',marginBottom:'40px'}}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Êàáèíåò
          </a>

          <div style={{marginBottom:'32px'}}>
            <div style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'10px'}}>Èíñòðóìåíò</div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(24px,4vw,36px)',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'8px'}}>Ñðàâíåíèå ñìåò</h1>
            <p style={{color:'var(--muted)',fontSize:'14px',fontWeight:300}}>Âûáåðèòå äâå ñìåòû èç èñòîðèè äëÿ ñðàâíåíèÿ ïî ïîçèöèÿì è èòîãîâîé ñòîèìîñòè</p>
          </div>

          {loading ? (
            <div style={{color:'var(--muted)',fontSize:'14px'}}>Çàãðóæàåì ñìåòû...</div>
          ) : estimates.length < 2 ? (
            <div style={{textAlign:'center',padding:'60px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px'}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'18px',fontWeight:700,marginBottom:'8px'}}>Íóæíî ìèíèìóì 2 ñìåòû</div>
              <div style={{color:'var(--muted)',fontSize:'14px',marginBottom:'24px'}}>Ñîçäàéòå åùå îäíó ñìåòó ÷òîáû ñðàâíèâàòü</div>
              <a href="/estimate" style={{background:'var(--accent)',color:'var(--btn-text)',padding:'12px 28px',borderRadius:'4px',textDecoration:'none',fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'14px'}}>Ñîçäàòü ñìåòó â</a>
            </div>
          ) : (
            <>
              {/* Selectors */}
              <div className="compare-selectors" style={{display:'flex',gap:'16px',marginBottom:'24px',alignItems:'flex-end'}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:'6px'}}>Ñìåòà À</label>
                  <select value={leftId} onChange={e => setLeftId(e.target.value)} style={selectStyle}>
                    <option value="">â Âûáåðèòå ñìåòó</option>
                    {estimates.map(e => (
                      <option key={e.id} value={e.id} disabled={e.id === rightId}>
                        {e.summary?.slice(0, 50) || 'Áåç îïèñàíèÿ'} â {e.total_rub?.toLocaleString('ru-RU')} â
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{padding:'0 8px',color:'var(--muted)',fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'18px',paddingBottom:'10px'}}>vs</div>
                <div style={{flex:1}}>
                  <label style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:'6px'}}>Ñìåòà Á</label>
                  <select value={rightId} onChange={e => setRightId(e.target.value)} style={selectStyle}>
                    <option value="">â Âûáåðèòå ñìåòó</option>
                    {estimates.map(e => (
                      <option key={e.id} value={e.id} disabled={e.id === leftId}>
                        {e.summary?.slice(0, 50) || 'Áåç îïèñàíèÿ'} â {e.total_rub?.toLocaleString('ru-RU')} â
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {left && right && (
                <>
                  {/* Totals */}
                  <div className="compare-totals" style={{display:'flex',gap:'12px',marginBottom:'24px'}}>
                    <div style={{flex:1,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px'}}>
                      <div style={{fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'6px'}}>Ñìåòà À</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:600,marginBottom:'8px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{left.summary}</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'22px',fontWeight:800,color:'var(--accent)'}}>{leftTotal.toLocaleString('ru-RU')} â</div>
                      <div style={{color:'var(--muted)',fontSize:'12px',marginTop:'4px'}}>{leftItems.length} ïîçèöèé</div>
                    </div>

                    <div style={{flex:'0 0 auto',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'16px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',minWidth:'120px'}}>
                      <div style={{fontSize:'11px',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'6px'}}>Ðàçíèöà</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'18px',fontWeight:800,color:diff > 0 ? '#E85050' : diff < 0 ? '#5E9E6E' : 'var(--muted)'}}>
                        {diff > 0 ? '+' : ''}{diff.toLocaleString('ru-RU')} â
                      </div>
                      <div style={{fontSize:'12px',color:'var(--muted)',marginTop:'2px'}}>{diff > 0 ? '+' : ''}{diffPct}%</div>
                    </div>

                    <div style={{flex:1,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px'}}>
                      <div style={{fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'6px'}}>Ñìåòà Á</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'13px',fontWeight:600,marginBottom:'8px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{right.summary}</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'22px',fontWeight:800,color:'var(--accent)'}}>{rightTotal.toLocaleString('ru-RU')} â</div>
                      <div style={{color:'var(--muted)',fontSize:'12px',marginTop:'4px'}}>{rightItems.length} ïîçèöèé</div>
                    </div>
                  </div>

                  {/* Table */}
                  <div style={{border:'1px solid var(--border)',borderRadius:'8px',overflow:'auto',marginBottom:'24px'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'600px'}}>
                      <thead>
                        <tr style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}>
                          <th style={{padding:'11px 16px',textAlign:'left',color:'var(--muted)',fontWeight:500,fontSize:'10px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Ïîçèöèÿ</th>
                          <th style={{padding:'11px 16px',textAlign:'right',color:'var(--muted)',fontWeight:500,fontSize:'10px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Ñìåòà À</th>
                          <th style={{padding:'11px 16px',textAlign:'right',color:'var(--muted)',fontWeight:500,fontSize:'10px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Ñìåòà Á</th>
                          <th style={{padding:'11px 16px',textAlign:'right',color:'var(--muted)',fontWeight:500,fontSize:'10px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Ðàçíèöà</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allNames.map((name, i) => {
                          const lItem = leftItems.find((it: any) => it.name === name)
                          const rItem = rightItems.find((it: any) => it.name === name)
                          const lVal = lItem ? lItem.qty * lItem.price : 0
                          const rVal = rItem ? rItem.qty * rItem.price : 0
                          const d = rVal - lVal
                          return (
                            <tr key={i} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'var(--bg)':'var(--bg2)'}}>
                              <td style={{padding:'10px 16px',color:'var(--text)',maxWidth:'280px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</td>
                              <td style={{padding:'10px 16px',textAlign:'right',color:lItem?'var(--text)':'var(--muted)',whiteSpace:'nowrap'}}>
                                {lItem ? `${lVal.toLocaleString('ru-RU')} â` : 'â'}
                              </td>
                              <td style={{padding:'10px 16px',textAlign:'right',color:rItem?'var(--text)':'var(--muted)',whiteSpace:'nowrap'}}>
                                {rItem ? `${rVal.toLocaleString('ru-RU')} â` : 'â'}
                              </td>
                              <td style={{padding:'10px 16px',textAlign:'right',whiteSpace:'nowrap',fontWeight:500,color:d > 0 ? '#E85050' : d < 0 ? '#5E9E6E' : 'var(--muted)'}}>
                                {d === 0 ? 'â' : `${d > 0 ? '+' : ''}${d.toLocaleString('ru-RU')} â`}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{background:'var(--bg2)',borderTop:'2px solid var(--border)'}}>
                          <td style={{padding:'12px 16px',fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'13px'}}>Èòîãî</td>
                          <td style={{padding:'12px 16px',textAlign:'right',fontFamily:"'Syne',sans-serif",fontWeight:700,whiteSpace:'nowrap'}}>{leftTotal.toLocaleString('ru-RU')} â</td>
                          <td style={{padding:'12px 16px',textAlign:'right',fontFamily:"'Syne',sans-serif",fontWeight:700,whiteSpace:'nowrap'}}>{rightTotal.toLocaleString('ru-RU')} â</td>
                          <td style={{padding:'12px 16px',textAlign:'right',fontFamily:"'Syne',sans-serif",fontWeight:700,whiteSpace:'nowrap',color:diff > 0 ? '#E85050' : diff < 0 ? '#5E9E6E' : 'var(--muted)'}}>
                            {diff === 0 ? '=' : `${diff > 0 ? '+' : ''}${diff.toLocaleString('ru-RU')} â`}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Summary */}
                  <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'20px 24px'}}>
                    <div style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'10px'}}>Âûâîä</div>
                    <div style={{fontSize:'14px',lineHeight:1.65}}>
                      {diff === 0
                        ? 'Ñìåòû ñîâïàäàþò ïî èòîãîâîé ñòîèìîñòè.'
                        : diff > 0
                        ? <span>Ñìåòà Á <strong style={{color:'#E85050'}}>äîðîæå</strong> íà {Math.abs(diff).toLocaleString('ru-RU')} â ({Math.abs(Number(diffPct))}%) ïî ñðàâíåíèþ ñî ñìåòîé À.</span>
                        : <span>Ñìåòà Á <strong style={{color:'#5E9E6E'}}>äåøåâëå</strong> íà {Math.abs(diff).toLocaleString('ru-RU')} â ({Math.abs(Number(diffPct))}%) ïî ñðàâíåíèþ ñî ñìåòîé À.</span>
                      }
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
