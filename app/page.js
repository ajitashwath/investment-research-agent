'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, TrendingUp, ArrowRight, Globe, Home, ChevronDown, ChevronUp, LifeBuoy,
  Zap, Star, ArrowUpRight
} from 'lucide-react'
import { authService } from '../services/auth.js'

const SUGGESTIONS = [
  'Reliance Industries', 'Tata Consultancy Services', 'HDFC Bank', 
  'Infosys', 'ICICI Bank', 'State Bank of India', 'Bharti Airtel', 
  'Hindustan Unilever', 'ITC', 'Larsen & Toubro', 'NVIDIA', 'Apple', 'Tesla'
]

// ─── Seeded deterministic random (avoids SSR hydration mismatch) ──────────────
function seededRand(seed) {
  let s = seed
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

// ─── Clean Premium Disk (geometric orbital rings, no emojis) ─────────────────
const PrismaDisk = () => {
  const orbitals = [
    { radius: 178, duration: 14, size: 7, color: '#f73b20', delay: 0 },
    { radius: 178, duration: 14, size: 5, color: 'rgba(54,8,2,0.3)', delay: -7 },
    { radius: 148, duration: 20, size: 5, color: '#477ee9', delay: 0 },
    { radius: 148, duration: 20, size: 4, color: 'rgba(54,8,2,0.2)', delay: -10 },
    { radius: 118, duration: 10, size: 4, color: '#34c771', delay: -3 },
  ]

  return (
    <motion.div
      style={{
        position: 'relative',
        width: 'min(420px, 88vw)',
        height: 'min(420px, 88vw)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      animate={{ y: [0, -16, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Deep ambient glow */}
      <div style={{
        position: 'absolute', width: '130%', height: '130%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,59,32,0.22) 0%, rgba(247,59,32,0.06) 50%, transparent 70%)',
        filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Orbital track rings (just hairlines) */}
      {[178, 148, 118].map((r, i) => (
        <div key={r} style={{
          position: 'absolute',
          width: r * 2, height: r * 2,
          borderRadius: '50%',
          border: '1px solid rgba(54,8,2,0.07)',
          zIndex: 1,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Orbiting dot nodes */}
      {orbitals.map((o, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: o.size, height: o.size,
            borderRadius: '50%',
            background: o.color,
            zIndex: 3,
            left: '50%', top: '50%',
            marginLeft: -o.size / 2, marginTop: -o.size / 2,
            boxShadow: `0 0 ${o.size * 2}px ${o.color}`,
          }}
          animate={{
            x: [
              Math.cos(0) * o.radius,
              Math.cos(Math.PI / 2) * o.radius,
              Math.cos(Math.PI) * o.radius,
              Math.cos((3 * Math.PI) / 2) * o.radius,
              Math.cos(Math.PI * 2) * o.radius,
            ],
            y: [
              Math.sin(0) * o.radius,
              Math.sin(Math.PI / 2) * o.radius,
              Math.sin(Math.PI) * o.radius,
              Math.sin((3 * Math.PI) / 2) * o.radius,
              Math.sin(Math.PI * 2) * o.radius,
            ],
          }}
          transition={{
            duration: o.duration,
            delay: o.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Outer glassmorphic shell */}
      <div style={{
        position: 'absolute',
        width: '90%', height: '90%',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.06) 60%, rgba(54,8,2,0.1) 100%)',
        boxShadow: 'rgba(247,59,32,0.20) 0px 32px 80px 0px, inset rgba(255,255,255,0.3) 0px 1px 0px',
        zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* White separator ring */}
        <div style={{
          width: '80%', height: '80%', borderRadius: '50%',
          background: 'linear-gradient(135deg, #ffb8a8 0%, #f73b20 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'rgba(247,59,32,0.5) 0px 16px 48px, inset rgba(255,255,255,0.25) 0px 4px 12px',
        }}>
          <div style={{
            width: '88%', height: '88%', borderRadius: '50%',
            background: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'rgba(54,8,2,0.06) 0px 4px 20px inset',
          }}>
            <div style={{
              width: '64%', height: '64%', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff9a82 0%, #f73b20 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(247,59,32,0.5) 0px 12px 32px',
            }}>
              <TrendingUp size={42} color="#ffffff" strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Scrolling live-stats ticker ──────────────────────────────────────────────
const LIVE_STATS = [
  { label: 'Markets Tracked', value: '180+' },
  { label: 'AI Agents', value: '6 Live' },
  { label: 'Avg Analysis Time', value: '< 2 min' },
  { label: 'Risk Factors Scored', value: '40+' },
  { label: 'News Sources', value: '12,000+' },
  { label: 'Model Accuracy', value: '94.2%' },
  { label: 'Disclosures Parsed', value: 'Daily' },
  { label: 'Supported Tickers', value: 'Global' },
]

const StatsTicker = () => {
  const [pos, setPos] = useState(0)
  const statsRef = useRef(null)

  useEffect(() => {
    let frame
    const tick = () => {
      setPos(p => {
        const el = statsRef.current
        if (!el) return p
        const max = el.scrollWidth / 2
        return (p + 0.4) % max
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div style={{
      overflow: 'hidden',
      borderTop: '1px solid rgba(54,8,2,0.07)',
      borderBottom: '1px solid rgba(54,8,2,0.07)',
      background: 'rgba(255,255,255,0.75)',
      padding: '16px 0',
    }}>
      <div
        ref={statsRef}
        style={{
          display: 'flex', gap: 0, alignItems: 'center',
          transform: `translateX(-${pos}px)`,
          whiteSpace: 'nowrap', width: 'max-content',
        }}
      >
        {[...LIVE_STATS, ...LIVE_STATS].map(({ label, value }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 48px' }}>
              <span style={{ 
                fontSize: 16, fontWeight: 700, color: '#360802', 
                fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.01em' 
              }}>{value}</span>
              <span style={{ 
                fontSize: 11, color: 'rgba(54,8,2,0.45)', 
                textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 
              }}>{label}</span>
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(54,8,2,0.08)', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── GSAP-powered verb section ────────────────────────────────────────────────
const VERBS = [
  {
    verb: 'Analyse.',
    color: '#34c771',
    desc: 'Deep audit of balance sheets, margin expansions, solvency ratios, and growth metrics across every filing.',
  },
  {
    verb: 'Monitor.',
    color: '#477ee9',
    desc: 'Real-time press releases, analyst targets, institutional flows, and regulatory disclosures — all parsed continuously.',
  },
  {
    verb: 'Decide.',
    color: '#f73b20',
    desc: 'Score governance risks, competitor pressures, and intrinsic valuation gaps. One terminal. One verdict.',
  },
]

const VerbSection = () => {
  const sectionRef = useRef(null)
  const verbRefs = useRef([])

  useEffect(() => {
    let gsap, ScrollTrigger
    ;(async () => {
      const g = await import('gsap')
      gsap = g.gsap || g.default
      const st = await import('gsap/ScrollTrigger')
      ScrollTrigger = st.ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)

      verbRefs.current.forEach((el, i) => {
        if (!el) return

        const verbEl = el.querySelector('[data-verb]')
        const descEl = el.querySelector('[data-desc]')
        const lineEl = el.querySelector('[data-line]')

        // Initial state
        gsap.set(verbEl, { y: 80, opacity: 0, skewY: 4 })
        gsap.set(descEl, { y: 30, opacity: 0 })
        gsap.set(lineEl, { scaleX: 0, transformOrigin: 'left center' })

        // ScrollTrigger timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            end: 'bottom 30%',
            toggleActions: 'play none none reverse',
          },
        })

        tl.to(verbEl, {
          y: 0, opacity: 1, skewY: 0,
          duration: 0.9, ease: 'power3.out',
          delay: i * 0.08,
        })
        .to(lineEl, {
          scaleX: 1,
          duration: 0.7, ease: 'power2.inOut',
        }, '-=0.5')
        .to(descEl, {
          y: 0, opacity: 1,
          duration: 0.65, ease: 'power2.out',
        }, '-=0.4')
      })
    })()

    return () => {
      if (ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <div ref={sectionRef} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {VERBS.map(({ verb, color, desc }, i) => (
        <div
          key={verb}
          ref={el => verbRefs.current[i] = el}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            alignItems: 'center',
            padding: '72px 0',
            borderBottom: i < VERBS.length - 1 ? '1px solid rgba(54,8,2,0.06)' : 'none',
            gap: 80,
            overflow: 'hidden',
          }}
        >
          {/* Left: verb */}
          <div style={{ overflow: 'hidden' }}>
            <div
              data-verb
              style={{
                fontFamily: 'var(--font-sequel-sans)',
                fontSize: 'clamp(56px, 8vw, 104px)',
                fontWeight: 700,
                color: color,
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
              }}
            >
              {verb}
            </div>
          </div>

          {/* Right: divider + desc */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              data-line
              style={{
                height: 2,
                background: `linear-gradient(90deg, ${color}, transparent)`,
                borderRadius: 99,
              }}
            />
            <p
              data-desc
              style={{
                fontSize: 17,
                color: 'rgba(54,8,2,0.65)',
                lineHeight: 1.72,
                margin: 0,
                fontWeight: 400,
              }}
            >
              {desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Feature cards (NO icons) ─────────────────────────────────────────────────
const FEATURES = [
  {
    title: 'Six Autonomous Agents',
    desc: 'Macro research, financials parsing, sentiment extraction, risk modelling, competitive intel, and growth analysis — all running in parallel.',
    accent: '#f73b20',
  },
  {
    title: 'Live Financial Data',
    desc: 'Real-time quotes, balance sheet parsing, DCF models, EPS trends, and revenue forecasts across 50+ financial metrics.',
    accent: '#477ee9',
  },
  {
    title: 'Risk Audit Engine',
    desc: 'Systematic regulatory risk, litigation exposure, governance scoring, and macro tail-risk quantification.',
    accent: '#34c771',
  },
  {
    title: 'Sentiment Intelligence',
    desc: 'Cross-source news aggregation, real-time sentiment scoring, key theme extraction, and signal noise filtering.',
    accent: '#fb2d54',
  },
]

const FeaturesSection = () => {
  const cardsRef = useRef([])

  useEffect(() => {
    let gsap, ScrollTrigger
    ;(async () => {
      const g = await import('gsap')
      gsap = g.gsap || g.default
      const st = await import('gsap/ScrollTrigger')
      ScrollTrigger = st.ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)

      cardsRef.current.forEach((el, i) => {
        if (!el) return
        gsap.set(el, { y: 40, opacity: 0 })
        gsap.to(el, {
          y: 0, opacity: 1,
          duration: 0.7, ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
          delay: i * 0.1,
        })
      })
    })()
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {FEATURES.map((f, i) => (
        <div
          key={i}
          ref={el => cardsRef.current[i] = el}
          style={{
            padding: '32px 28px 36px',
            borderRadius: '20px',
            background: '#fafafa',
            border: '1px solid rgba(54,8,2,0.06)',
            cursor: 'default',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(54,8,2,0.07)'
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.borderColor = `${f.accent}20`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#fafafa'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.borderColor = 'rgba(54,8,2,0.06)'
          }}
        >
          {/* Accent dot top-left */}
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: f.accent, marginBottom: 24,
            boxShadow: `0 0 10px ${f.accent}60`,
          }} />

          <div style={{ fontSize: 17, fontWeight: 700, color: '#360802', marginBottom: 12, letterSpacing: '-0.01em', lineHeight: 1.25 }}>
            {f.title}
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(54,8,2,0.58)', lineHeight: 1.72, margin: 0 }}>
            {f.desc}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(false)
  const [dropdownActive, setDropdownActive] = useState(null)
  const inputRef = useRef(null)
  const router = useRouter()
  const ctaRef = useRef(null)

  useEffect(() => {
    if (query.length > 0) {
      setFiltered(SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5))
    } else {
      setFiltered([])
    }
  }, [query])

  // GSAP CTA animation
  useEffect(() => {
    let gsap, ScrollTrigger
    ;(async () => {
      const g = await import('gsap')
      gsap = g.gsap || g.default
      const st = await import('gsap/ScrollTrigger')
      ScrollTrigger = st.ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)

      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          y: 60, opacity: 0, scale: 0.97,
          duration: 0.9, ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    })()
  }, [])

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
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column', overflowX: 'hidden', fontFamily: 'var(--font-sequel-sans)' }}>

      {!authService.isSupabaseConfigured && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          padding: '8px 16px',
          fontSize: '11.5px',
          fontWeight: '500',
          textAlign: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          zIndex: 100
        }}>
          ⚠️ Development Mode: Supabase not configured. Using mock local database.
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(150deg, #fff5f2 0%, #ffd5c8 32%, #ff9a82 62%, #f73b20 100%)',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        padding: '0 32px', overflow: 'hidden',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }} />

        {/* ── TOP NAV ── */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          maxWidth: 1240, width: '100%', margin: '0 auto',
          height: 72, zIndex: 10, position: 'relative',
        }}>
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.02 }}
          >
            <span style={{ fontFamily: 'var(--font-sequel-sans)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: '#360802' }}>
              Prisma
            </span>
          </motion.div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <motion.button
              onClick={() => router.push('/dashboard/NVIDIA')}
              style={{
                background: '#360802', border: 'none', color: '#ffffff',
                fontSize: 13, padding: '10px 22px', borderRadius: '13px',
                fontFamily: 'var(--font-sequel-sans)', fontWeight: 600, cursor: 'pointer',
                boxShadow: 'rgba(54,8,2,0.28) 0px 8px 24px',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              whileHover={{ scale: 1.03, background: '#1a0401' }}
              whileTap={{ scale: 0.97 }}
            >
              Open Terminal
              <ArrowUpRight size={14} />
            </motion.button>
          </div>
        </header>

        {/* ── HERO BODY ── */}
        <div style={{
          maxWidth: 1240, width: '100%', margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1.15fr 0.85fr',
          gap: 64, alignItems: 'center',
          flex: 1, paddingTop: 12, paddingBottom: 80,
          position: 'relative', zIndex: 5,
        }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <h1 style={{
                fontFamily: 'var(--font-sequel-sans)',
                fontSize: 'clamp(44px, 7.5vw, 92px)',
                fontWeight: 700, lineHeight: 0.9,
                letterSpacing: '-0.03em', color: '#360802', margin: 0,
              }}>
                AI Investment<br />Research Agent.
              </h1>
              <h2 style={{
                fontFamily: 'var(--font-sequel-sans)',
                fontSize: 'clamp(22px, 3.2vw, 44px)',
                fontWeight: 400, lineHeight: 1.15,
                letterSpacing: '-0.015em', color: '#360802',
                opacity: 0.72, margin: '16px 0 0',
              }}>
                One terminal. Every decision.
              </h2>
            </motion.div>

            <motion.p
              style={{ fontSize: 16, lineHeight: 1.7, color: '#360802', opacity: 0.7, maxWidth: 480, margin: 0 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
            >
              Six specialized agents crawl disclosures, parse financials, audit risk exposures,
              and synthesize a trade-ready recommendation in under 2 minutes.
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
            >
              <div style={{
                maxWidth: 560,
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(255,255,255,0.6)',
                padding: '6px 6px 6px 18px',
                borderRadius: '18px',
                boxShadow: 'rgba(54,8,2,0.1) 0px 24px 64px -8px, rgba(247,59,32,0.05) 0px 8px 24px',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Search size={16} color="rgba(54,8,2,0.32)" strokeWidth={2} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && go()}
                    placeholder="Company name or ticker — NVIDIA, AAPL, RELIANCE.NS"
                    style={{
                      flex: 1, border: 'none', outline: 'none',
                      fontSize: 13.5, color: '#360802',
                      background: 'transparent',
                      fontFamily: 'var(--font-sequel-sans)', fontWeight: 400,
                    }}
                  />
                  <motion.button
                    onClick={() => go()}
                    disabled={!query.trim() || loading}
                    style={{
                      borderRadius: '12px', padding: '10px 22px',
                      background: '#f73b20', color: '#ffffff',
                      display: 'flex', alignItems: 'center', gap: 7,
                      border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600,
                      boxShadow: 'rgba(247,59,32,0.35) 0px 8px 22px',
                      fontFamily: 'var(--font-sequel-sans)',
                      whiteSpace: 'nowrap',
                      opacity: (!query.trim() || loading) ? 0.55 : 1,
                    }}
                    whileHover={{ background: '#360802', scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading
                      ? <div className="spinner" style={{ borderTopColor: '#ffffff', width: 12, height: 12 }} />
                      : <><span>Analyze</span><ArrowRight size={14} /></>
                    }
                  </motion.button>
                </div>

                <AnimatePresence>
                  {filtered.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        background: '#ffffff', borderRadius: '16px',
                        boxShadow: 'rgba(54,8,2,0.12) 0px 16px 40px',
                        marginTop: 8, padding: '6px', zIndex: 20,
                        border: '1px solid rgba(54,8,2,0.05)',
                      }}
                    >
                      {filtered.map(s => (
                        <button key={s} onClick={() => go(s)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            width: '100%', textAlign: 'left',
                            padding: '10px 14px', fontSize: 13, color: '#360802',
                            background: 'transparent', border: 'none',
                            cursor: 'pointer', borderRadius: '10px',
                            transition: 'background 0.12s',
                            fontFamily: 'var(--font-sequel-sans)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fef5f3'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <TrendingUp size={11} color="#f73b20" />
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Popular chips */}
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center', marginTop: 14 }}>
                <span style={{ fontSize: 10.5, color: '#360802', opacity: 0.55, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>POPULAR:</span>
                {['RELIANCE.NS', 'TCS.NS', 'NVIDIA', 'AAPL', 'TSLA'].map(t => (
                  <motion.button
                    key={t} onClick={() => go(t)}
                    style={{
                      padding: '5px 13px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.52)',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: 'rgba(255,255,255,0.65)',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      color: '#360802', fontFamily: 'JetBrains Mono, monospace',
                      backdropFilter: 'blur(8px)', letterSpacing: '0.02em',
                    }}
                    whileHover={{ background: '#360802', color: '#ffffff', borderColor: '#360802', scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Clean Disk */}
          <motion.div
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.25, 1, 0.5, 1] }}
          >
            <PrismaDisk />
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(to bottom, transparent, #ffffff)',
          zIndex: 6, pointerEvents: 'none',
        }} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS TICKER
      ═══════════════════════════════════════════════════════════════════ */}
      <StatsTicker />

      {/* ═══════════════════════════════════════════════════════════════════
          BELOW FOLD — WHITE CANVAS
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#ffffff', padding: '128px 32px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 112 }}>

          {/* ── Big headline ── */}
          <motion.div
            style={{ textAlign: 'center' }}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.25, 1, 0.5, 1] }}
          >
            <h2 style={{
              fontFamily: 'var(--font-sequel-sans)',
              fontSize: 'clamp(56px, 9.5vw, 152px)',
              fontWeight: 700, lineHeight: 0.87,
              letterSpacing: '-0.04em', color: '#f73b20', margin: 0,
            }}>
              Unify your finances.
            </h2>
            <p style={{
              marginTop: 32, fontSize: 18, color: 'rgba(54,8,2,0.6)',
              lineHeight: 1.65, maxWidth: 520, margin: '32px auto 0',
            }}>
              Prisma turns raw market data into decisive investment intelligence — faster than any human analyst.
            </p>
          </motion.div>

          {/* ── GSAP Verb Section ── */}
          <VerbSection />

          {/* ── Feature Cards (NO icons) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <motion.div
              style={{ textAlign: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
            >
              <h3 style={{
                fontSize: 'clamp(28px, 4vw, 52px)',
                fontWeight: 700, color: '#360802',
                letterSpacing: '-0.025em', margin: 0, lineHeight: 1.1,
              }}>Built for serious investors.</h3>
              <p style={{ fontSize: 16, color: 'rgba(54,8,2,0.55)', marginTop: 12 }}>
                Institutional-grade intelligence, available to everyone.
              </p>
            </motion.div>

            <FeaturesSection />
          </div>

          {/* ── CTA ── */}
          <div ref={ctaRef} style={{
            padding: '80px 64px',
            borderRadius: '28px',
            background: 'linear-gradient(140deg, #360802 0%, #6b1407 45%, #f73b20 100%)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-20%', right: '-5%',
              width: '45%', height: '160%',
              background: 'radial-gradient(circle, rgba(247,59,32,0.35) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '-30%', left: '10%',
              width: '30%', height: '120%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <h3 style={{
              fontSize: 'clamp(30px, 4.5vw, 58px)',
              fontWeight: 700, color: '#ffffff',
              letterSpacing: '-0.025em', margin: '0 0 16px',
              position: 'relative', lineHeight: 1.05,
            }}>
              Start your first analysis.
            </h3>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 40, position: 'relative' }}>
              No credit card required. Instant AI-generated research report.
            </p>
            <motion.button
              onClick={() => router.push('/dashboard/NVIDIA')}
              style={{
                padding: '16px 44px', borderRadius: '14px',
                background: '#ffffff', border: 'none',
                fontSize: 15, fontWeight: 700, color: '#360802',
                cursor: 'pointer', fontFamily: 'var(--font-sequel-sans)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                position: 'relative',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
              whileHover={{ scale: 1.04, background: '#fef5f3' }}
              whileTap={{ scale: 0.97 }}
            >
              Open the Terminal
              <ArrowRight size={16} />
            </motion.button>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer style={{
        background: '#fef5f3', padding: '48px 32px 100px',
        textAlign: 'center', borderTop: '1px solid rgba(54,8,2,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#360802', letterSpacing: '-0.02em' }}>Prisma</span>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(54,8,2,0.4)', maxWidth: 480, margin: '0 auto', lineHeight: 1.75 }}>
          Prisma Investment Research Terminal is for informational purposes only and does not constitute financial advice. © 2026 Prisma. All rights reserved.
        </p>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════
          FLOATING BOTTOM NAV
      ═══════════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', bottom: 24, left: '50%',
        transform: 'translateX(-50%)', zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <motion.div
          style={{
            height: 56, borderRadius: '99px',
            background: 'rgba(255,255,255,0.93)',
            backdropFilter: 'blur(28px)',
            border: '1.5px solid rgba(247,59,32,0.18)',
            boxShadow: 'rgba(247,59,32,0.14) 0px 16px 40px, rgba(0,0,0,0.07) 0px 4px 12px',
            display: 'flex', alignItems: 'center',
            padding: '0 20px', gap: 16,
          }}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.5, type: 'spring', stiffness: 120 }}
        >
          <motion.button
            onClick={() => router.push('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            whileHover={{ scale: 1.2 }}
          >
            <Home size={17} color="#f73b20" />
          </motion.button>

          <div style={{ width: 1, height: 16, background: 'rgba(54,8,2,0.09)' }} />

          {[
            { label: 'Personal', type: 'dropdown', options: ['Personal Dashboard', 'Saved Tickers', 'Watchlists'] },
            { label: 'Business', type: 'link', link: '/dashboard/AAPL' },
            { label: 'Company', type: 'dropdown', options: ['About Prisma', 'Agent Technology', 'Documentation'] },
          ].map(item => {
            const isActive = dropdownActive === item.label
            return (
              <div key={item.label} style={{ position: 'relative' }}>
                <motion.button
                  onClick={() => { if (item.type === 'dropdown') toggleDropdown(item.label); else if (item.link) router.push(item.link) }}
                  style={{
                    background: 'rgba(247, 59, 32, 0)', border: 'none', cursor: 'pointer',
                    fontSize: 13.5, fontWeight: 500, 
                    color: isActive ? '#f73b20' : '#360802',
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 8px', fontFamily: 'var(--font-sequel-sans)',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  whileHover={{ color: '#f73b20', background: 'rgba(247, 59, 32, 0.04)' }}
                >
                  {item.label}
                  {item.type === 'dropdown' && (isActive ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                </motion.button>

                <AnimatePresence>
                  {item.type === 'dropdown' && isActive && (
                    <div style={{
                      position: 'absolute', bottom: 'calc(100% + 14px)',
                      left: '50%', transform: 'translateX(-50%)',
                      zIndex: 110,
                    }}>
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid rgba(54,8,2,0.08)',
                          borderRadius: '16px',
                          boxShadow: '0 12px 36px rgba(54,8,2,0.08), 0 4px 12px rgba(54,8,2,0.02)',
                          padding: '6px', minWidth: 180,
                          position: 'relative',
                        }}
                      >
                        {/* Caret / Pointer tail */}
                        <div style={{
                          position: 'absolute',
                          bottom: -5,
                          left: '50%',
                          transform: 'translateX(-50%) rotate(45deg)',
                          width: 10,
                          height: 10,
                          background: '#ffffff',
                          borderRight: '1px solid rgba(54,8,2,0.08)',
                          borderBottom: '1px solid rgba(54,8,2,0.08)',
                          zIndex: -1,
                        }} />

                        <div style={{
                          fontSize: 9, fontWeight: 700, color: 'rgba(54,8,2,0.38)',
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          padding: '6px 12px 6px', fontFamily: 'JetBrains Mono, monospace',
                          borderBottom: '1px solid rgba(54,8,2,0.04)',
                          marginBottom: 4,
                        }}>
                          {item.label === 'Personal' ? 'Workspace' : 'Information'}
                        </div>

                        {item.options.map(opt => (
                          <motion.button key={opt}
                            onClick={() => { setDropdownActive(null); router.push('/dashboard/NVIDIA') }}
                            style={{
                              padding: '8px 12px', background: 'rgba(254, 245, 243, 0)', border: 'none',
                              borderRadius: '10px', textAlign: 'left', fontSize: 13,
                              color: '#360802', cursor: 'pointer', display: 'flex', 
                              alignItems: 'center', justifyContent: 'space-between', width: '100%',
                              fontFamily: 'var(--font-sequel-sans)',
                              fontWeight: 500,
                            }}
                            whileHover={{ 
                              background: '#fef5f3', 
                              color: '#f73b20',
                              x: 4
                            }}
                          >
                            <span>{opt}</span>
                            <span style={{ fontSize: 11, color: '#f73b20', opacity: 0.75 }}>→</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </motion.div>

        <motion.button
          onClick={() => alert('Support terminal: Analyst helper active.')}
          style={{
            height: 56, borderRadius: '99px',
            background: 'rgba(255,255,255,0.93)',
            backdropFilter: 'blur(28px)',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'rgba(54,8,2,0.09)',
            boxShadow: 'rgba(0,0,0,0.05) 0px 4px 16px',
            display: 'flex', alignItems: 'center',
            padding: '0 20px', gap: 7,
            cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
            color: '#360802', fontFamily: 'var(--font-sequel-sans)',
          }}
          initial={{ y: 80, opacity: 0, borderColor: 'rgba(54,8,2,0.09)' }}
          animate={{ y: 0, opacity: 1, borderColor: 'rgba(54,8,2,0.09)' }}
          transition={{ duration: 0.65, delay: 0.6, type: 'spring', stiffness: 120 }}
          whileHover={{ borderColor: '#f73b20', scale: 1.02 }}
        >
          <LifeBuoy size={15} color="#f73b20" />
          Support
        </motion.button>
      </nav>
    </div>
  )
}
