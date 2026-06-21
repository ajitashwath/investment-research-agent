'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, TrendingUp, ArrowRight, BarChart3, Shield, Newspaper, Brain } from 'lucide-react'

const SUGGESTIONS = [
  'Reliance Industries', 'Tata Consultancy Services', 'HDFC Bank', 
  'Infosys', 'ICICI Bank', 'State Bank of India', 'Bharti Airtel', 
  'Hindustan Unilever', 'ITC', 'Larsen & Toubro'
]

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(false)
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* Logo and Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={18} color="var(--text-secondary)" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>AlphaLens</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: -2 }}>Investment Terminal</div>
          </div>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 500, color: 'var(--text-primary)', textAlign: 'center', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 12 }}>
          AI-Powered Investment Research
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6, marginBottom: 32, maxWidth: 400 }}>
          Six specialized agents analyze financials, news, risks, and competition, then synthesize a confident investment decision.
        </p>

        {/* Search Bar Capsule Card */}
        <div className="card" style={{ width: '100%', padding: 6, marginBottom: 12, position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              ref={ref}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go()}
              placeholder="Enter company name or ticker — e.g. NVIDIA, AAPL"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-primary)', background: 'transparent', fontFamily: 'inherit' }}
            />
            <button
              onClick={() => go()}
              disabled={!query.trim() || loading}
              className="premium-table-btn"
              style={{ borderRadius: 99, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {loading ? <div className="spinner" style={{ borderTopColor: 'black' }} /> : <><span>Analyze</span><ArrowRight size={14} /></>}
            </button>
          </div>

          {filtered.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, paddingBottom: 4 }}>
              {filtered.map(s => (
                <button
                  key={s}
                  onClick={() => go(s)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 8, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tickers */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
          {['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS'].map(t => (
            <button
              key={t}
              onClick={() => go(t)}
              style={{ padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', fontSize: 11, fontWeight: 500, cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
          {[
            { icon: BarChart3, label: 'Financial Analysis', desc: 'Revenue, margins, cash flow, valuation from Yahoo Finance', color: 'var(--blue)' },
            { icon: Newspaper, label: 'News Sentiment', desc: 'Real-time news classified as positive, neutral, or negative', color: 'var(--green)' },
            { icon: Shield, label: 'Risk Assessment', desc: 'Regulatory, competitive, macro, and geopolitical risks scored', color: 'var(--amber)' },
            { icon: Brain, label: 'AI Decision', desc: 'Gemini Pro synthesizes all evidence into a final verdict', color: 'var(--purple)' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="card" style={{ padding: '16px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Icon size={14} color={color} />
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div style={{ marginTop: 48, fontSize: 11, color: 'var(--text-muted)', opacity: 0.5, textAlign: 'center' }}>
        For informational purposes only.
      </div>
    </div>
  )
}
