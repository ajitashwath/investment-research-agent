'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, TrendingUp, ArrowRight, BarChart3, Shield, 
  Newspaper, Brain, Globe, Home, ChevronDown, ChevronUp, LifeBuoy,
  Plus, Send, RefreshCw
} from 'lucide-react'

const SUGGESTIONS = [
  'Reliance Industries', 'Tata Consultancy Services', 'HDFC Bank', 
  'Infosys', 'ICICI Bank', 'State Bank of India', 'Bharti Airtel', 
  'Hindustan Unilever', 'ITC', 'Larsen & Toubro', 'NVIDIA', 'Apple', 'Tesla'
]

// Polished 3D concentric ring disk coin with metallic stroke gradients & orbiting agent nodes
const Disk3D = () => (
  <motion.div
    style={{
      position: 'relative',
      width: 'min(380px, 90vw)',
      height: 'min(380px, 90vw)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    animate={{
      y: [0, -12, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    {/* Ambient soft glow background */}
    <div style={{
      position: 'absolute',
      width: '110%',
      height: '110%',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(247, 59, 32, 0.22) 0%, transparent 70%)',
      filter: 'blur(40px)',
      zIndex: 0
    }} />

    {/* Outer glassmorphic ring with metallic stroke gradient */}
    <div style={{
      position: 'absolute',
      width: '95%',
      height: '95%',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 40%, rgba(54,8,2,0.18) 100%)',
      padding: '1.5px', // Hajrline border
      boxShadow: 'rgba(247, 59, 32, 0.22) 0px 24px 50px 0px, rgba(0, 0, 0, 0.04) 0px 4px 20px 0px',
      zIndex: 1
    }}>
      {/* Glossy ring backdrop */}
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Inner coral-sunset ring */}
        <div style={{
          width: '84%',
          height: '84%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f8a4a4 0%, #f73b20 100%)',
          padding: '1.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset rgba(255,255,255,0.25) 0px 4px 12px 0px'
        }}>
          {/* Core White Glass Disk */}
          <div style={{
            width: '96%',
            height: '96%',
            borderRadius: '50%',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'rgba(54, 8, 2, 0.08) 0px 8px 24px 0px'
          }}>
            {/* Center Brandwood & Coral Flame Circle */}
            <div style={{
              width: '72%',
              height: '72%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f8a4a4 0%, #f73b20 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'rgba(247, 59, 32, 0.35) 0px 10px 22px 0px'
            }}>
              <TrendingUp size={38} color="#ffffff" style={{ opacity: 0.95 }} />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Orbiting Agent Nodes (Orbital path representing agents working) */}
    {[...Array(6)].map((_, i) => {
      const angle = (i * 360) / 6;
      return (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 0 10px #ffffff, 0 0 4px #f73b20',
            zIndex: 2,
            left: '50%',
            top: '50%',
            marginLeft: '-4px',
            marginTop: '-4px'
          }}
          animate={{
            x: [
              Math.cos((angle * Math.PI) / 180) * 175,
              Math.cos(((angle + 360) * Math.PI) / 180) * 175
            ],
            y: [
              Math.sin((angle * Math.PI) / 180) * 175,
              Math.sin(((angle + 360) * Math.PI) / 180) * 175
            ]
          }}
          transition={{
            duration: 18 + i * 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      );
    })}
  </motion.div>
)

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(false)
  const [dropdownActive, setDropdownActive] = useState(null)
  
  const router = useRouter()
  const ref = useRef(null)

  useEffect(() => {
    if (query.length > 0) {
      setFiltered(SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5))
    } else {
      setFiltered([])
    }
  }, [query])

  const go = (name) => {
    const n = name || query.trim()
    if (!n) return
    setLoading(true)
    router.push(`/dashboard/${encodeURIComponent(n)}`)
  }

  const toggleDropdown = (label) => {
    setDropdownActive(dropdownActive === label ? null : label)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      
      {/* 1. HERO BANNER WITH SUNSET GRADIENT & DOTS GRID */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffefe9 0%, #ffd0c3 30%, #ff8e7b 65%, #f73b20 100%)',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.12) 1.2px, transparent 0), linear-gradient(135deg, #ffefe9 0%, #ffd0c3 30%, #ff8e7b 65%, #f73b20 100%)',
        backgroundSize: '32px 32px, 100% 100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 24px 64px 24px',
        color: '#ffffff'
      }}>
        
        {/* Minimal Top Nav Bar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          height: '64px',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div style={{ width: 36, height: 36, borderRadius: '12px', background: '#360802', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'rgba(54, 8, 2, 0.15) 0px 8px 16px' }}>
              <TrendingUp size={18} color="#f73b20" />
            </div>
            <span style={{ 
              fontFamily: 'var(--font-sequel-sans)', 
              fontSize: '23px', 
              fontWeight: 500, 
              letterSpacing: '0.01em', 
              color: '#360802'
            }}>AlphaLens</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#360802', opacity: 0.9 }}>
              <Globe size={14} color="currentColor" />
              <span style={{ fontFamily: 'var(--font-sequel-sans)', fontSize: '14px', fontWeight: 450 }}>EN</span>
              <ChevronDown size={12} color="currentColor" />
            </div>

            <button 
              onClick={() => router.push('/dashboard/NVIDIA')}
              className="btn"
              style={{
                background: 'rgba(54, 8, 2, 0.05)',
                border: '1.5px solid #360802',
                color: '#360802',
                fontSize: '14px',
                padding: '8px 20px',
                borderRadius: '16px',
                fontFamily: 'var(--font-sequel-sans)',
                fontWeight: 450,
                cursor: 'pointer',
                transition: 'all 0.25s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#360802'; e.currentTarget.style.color = '#ffffff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(54, 8, 2, 0.05)'; e.currentTarget.style.color = '#360802' }}
            >
              Access Terminal
            </button>
          </div>
        </header>

        {/* Hero Headline and Content Grid */}
        <div style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.25fr 0.75fr',
          gap: '48px',
          alignItems: 'center',
          marginTop: 'auto',
          marginBottom: 'auto',
          zIndex: 5
        }}>
          {/* Headline Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'left' }}>
            <h1 style={{
              fontFamily: 'var(--font-sequel-sans)',
              fontSize: 'clamp(44px, 7.8vw, 98px)',
              fontWeight: 500,
              lineHeight: 0.90,
              letterSpacing: '0.03em',
              color: '#360802',
              maxWidth: '900px'
            }}>
              AI-Powered Research.
            </h1>
            <h2 style={{
              fontFamily: 'var(--font-sequel-sans)',
              fontSize: 'clamp(28px, 4vw, 54px)',
              fontWeight: 450,
              lineHeight: 1.0,
              letterSpacing: '0.02em',
              color: '#360802',
              opacity: 0.9
            }}>
              One terminal for active decisions.
            </h2>
            
            <p style={{
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#360802',
              opacity: 0.8,
              maxWidth: '460px',
              fontFamily: 'var(--font-sequel-sans)',
              fontWeight: 400
            }}>
              Six specialized agents crawl disclosures, parse financials, audit risk exposures, and generate a synthesized trade recommendation.
            </p>

            {/* Premium Search Bar Capsule Card */}
            <div style={{
              width: '100%',
              maxWidth: '540px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              padding: '8px',
              borderRadius: '16px',
              boxShadow: 'rgba(54, 8, 2, 0.08) 0px 24px 50px -12px, rgba(247, 59, 32, 0.05) 0px 8px 24px 0px',
              position: 'relative',
              marginTop: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
                <Search size={18} color="rgba(54, 8, 2, 0.4)" />
                <input
                  ref={ref}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && go()}
                  placeholder="Enter company name or ticker — e.g. NVIDIA, AAPL"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    color: '#360802',
                    background: 'transparent',
                    fontFamily: 'var(--font-sequel-sans)',
                    fontWeight: 400
                  }}
                />
                <button
                  onClick={() => go()}
                  disabled={!query.trim() || loading}
                  className="btn"
                  style={{
                    borderRadius: '12px',
                    padding: '10px 22px',
                    background: '#f73b20',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    boxShadow: 'rgba(247, 59, 32, 0.2) 0px 8px 16px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#360802' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f73b20' }}
                >
                  {loading ? <div className="spinner" style={{ borderTopColor: '#ffffff', width: 12, height: 12 }} /> : <><span>Analyze</span><ArrowRight size={14} /></>}
                </button>
              </div>

              {filtered.length > 0 && (
                <div style={{ 
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: 'rgba(54, 8, 2, 0.1) 0px 8px 24px',
                  marginTop: '8px',
                  padding: '6px',
                  zIndex: 20,
                  border: '1px solid rgba(54, 8, 2, 0.05)'
                }}>
                  {filtered.map(s => (
                    <button
                      key={s}
                      onClick={() => go(s)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: '#360802',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        transition: 'background 0.15s',
                        fontFamily: 'var(--font-sequel-sans)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef5f3'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Polished Quick Ticker Chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: '12px' }}>
              <span style={{ fontSize: '11px', color: '#360802', opacity: 0.8, fontWeight: 500, fontFamily: 'var(--font-sequel-sans)' }}>POPULAR:</span>
              {['RELIANCE.NS', 'TCS.NS', 'NVIDIA', 'AAPL', 'TSLA'].map(t => (
                <button
                  key={t}
                  onClick={() => go(t)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.45)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    color: '#360802',
                    fontFamily: 'JetBrains Mono, monospace',
                    transition: 'all 0.15s',
                    backdropFilter: 'blur(4px)',
                    boxShadow: 'rgba(54, 8, 2, 0.03) 0px 4px 8px'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#360802'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#360802' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.45)'; e.currentTarget.style.color = '#360802'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Concentric rings disk coin floating */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Disk3D />
          </div>
        </div>

        {/* Scroll indicator spacer */}
        <div style={{ height: 1 }} />
      </section>

      {/* 2. BELOW THE FOLD - Clean white canvas page section */}
      <section style={{
        background: '#ffffff',
        padding: '120px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        gap: '80px'
      }}>
        {/* Section title standalone on white - NO SUBTITLE as per spec */}
        <h2 style={{
          fontFamily: 'var(--font-sequel-sans)',
          fontSize: 'clamp(54px, 8.5vw, 155px)',
          fontWeight: 500,
          lineHeight: 0.90,
          letterSpacing: '0.03em',
          color: '#f73b20', // Coral Flame
          textAlign: 'center',
          margin: 0
        }}>
          Unify your finances.
        </h2>

        {/* Vertically stacked action verbs block */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '80px',
          width: '100%',
          maxWidth: '800px',
          alignItems: 'center'
        }}>
          {[
            {
              verb: 'Add',
              color: '#34c771', // Mint Action
              desc: 'Deep audit of balance sheets, margin expansions, solvency ratios, and growth metrics.',
              icon: <Plus size={24} color="#ffffff" strokeWidth={2.5} />
            },
            {
              verb: 'Send',
              color: '#477ee9', // Cobalt Pulse
              desc: 'Crawl real-time press releases, analyst targets, filings, and institutional flows.',
              icon: <Send size={24} color="#ffffff" strokeWidth={2.5} />
            },
            {
              verb: 'Exchange',
              color: '#fb2d54', // Magenta Spark
              desc: 'Score corporate governance risks, competitor pressures, and intrinsic valuation models.',
              icon: <RefreshCw size={24} color="#ffffff" strokeWidth={2.5} />
            }
          ].map(({ verb, color, desc, icon }) => (
            <div 
              key={verb} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                gap: '16px',
                width: '100%',
                paddingBottom: '40px',
                borderBottom: '1px solid rgba(54, 8, 2, 0.06)'
              }}
            >
              {/* Row: Icon tile + Verb text */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                {/* 48px rounded square icon tile (12px radius) */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `rgba(${color === '#34c771' ? '52, 199, 113' : color === '#477ee9' ? '71, 126, 233' : '251, 45, 84'}, 0.25) 0px 8px 20px`
                }}>
                  {icon}
                </div>

                {/* Display text (72px, weight 500, line-height 1.1) */}
                <span style={{
                  fontFamily: 'var(--font-sequel-sans)',
                  fontSize: 'clamp(44px, 6vw, 72px)',
                  fontWeight: 500,
                  color: color,
                  lineHeight: 1.1,
                  letterSpacing: '0.03em'
                }}>{verb}</span>
              </div>

              {/* Description centered underneath */}
              <p style={{
                fontFamily: 'var(--font-sequel-sans)',
                fontSize: '16px',
                color: '#360802',
                opacity: 0.8,
                lineHeight: 1.5,
                maxWidth: '560px',
                margin: 0
              }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer disclaimer */}
      <footer style={{
        background: '#fef5f3',
        padding: '64px 24px',
        textAlign: 'center',
        fontSize: '11px',
        color: 'rgba(54, 8, 2, 0.5)',
        borderTop: '1px solid rgba(54, 8, 2, 0.04)',
        marginTop: 'auto',
        paddingBottom: '120px' // Leave space for bottom nav
      }}>
        AlphaLens Investment Research Terminal is for informational purposes only. © 2026.
      </footer>

      {/* 3. PERSISTENT FLOATING BOTTOM NAV PILL */}
      <nav style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: 'fit-content',
        maxWidth: '95vw'
      }}>
        {/* Central Nav Pill */}
        <div style={{
          height: '60px',
          borderRadius: '84px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid #f73b20',
          boxShadow: 'rgba(247, 59, 32, 0.12) 0px 12px 32px 0px, rgba(247, 59, 32, 0.06) 0px 4px 12px 0px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: '20px'
        }}>
          {/* Home Icon */}
          <button 
            onClick={() => router.push('/')}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              padding: 0 
            }}
          >
            <Home size={18} color="#f73b20" />
          </button>

          <div style={{ width: '1px', height: '18px', background: 'rgba(54, 8, 2, 0.12)' }} />

          {/* Navigation Dropdown links */}
          {[
            { label: 'Personal', type: 'dropdown', options: ['Personal Dashboard', 'Saved Tickers', 'Watchlists'] },
            { label: 'Business', type: 'link', link: '/dashboard/AAPL' },
            { label: 'Company', type: 'dropdown', options: ['About AlphaLens', 'Agent Technology', 'Documentation'] }
          ].map(item => {
            const isActive = dropdownActive === item.label
            return (
              <div key={item.label} style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    if (item.type === 'dropdown') {
                      toggleDropdown(item.label)
                    } else if (item.link) {
                      router.push(item.link)
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sequel-sans)',
                    fontSize: '14px',
                    fontWeight: 450,
                    color: '#360802',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 0'
                  }}
                >
                  <span>{item.label}</span>
                  {item.type === 'dropdown' && (isActive ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </button>

                {/* Simple Hover/Click Menu */}
                {item.type === 'dropdown' && isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '72px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ffffff',
                    border: '1.5px solid #f73b20',
                    borderRadius: '16px',
                    boxShadow: 'rgba(54, 8, 2, 0.1) 0px 8px 24px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '170px',
                    zIndex: 110
                  }}>
                    {item.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          setDropdownActive(null)
                          if (opt.includes('Dashboard') || opt.includes('Apple') || opt.includes('Tickers')) {
                            router.push('/dashboard/NVIDIA')
                          }
                        }}
                        style={{
                          padding: '10px 14px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          textAlign: 'left',
                          fontSize: '12px',
                          color: '#360802',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sequel-sans)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef5f3'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Floating Support Button */}
        <button
          onClick={() => alert('Support terminal: Analyst helper active.')}
          style={{
            height: '60px',
            borderRadius: '84px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(54, 8, 2, 0.1)',
            boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 16px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sequel-sans)',
            fontSize: '14px',
            fontWeight: 450,
            color: '#360802',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#f73b20' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(54, 8, 2, 0.1)' }}
        >
          <LifeBuoy size={16} color="#f73b20" />
          <span>Support</span>
        </button>
      </nav>

    </div>
  )
}
