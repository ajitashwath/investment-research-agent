'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, TrendingUp, ArrowRight, BarChart3, Shield, Newspaper, Brain, Zap } from 'lucide-react'

const SUGGESTIONS = ['NVIDIA', 'Apple', 'Tesla', 'Microsoft', 'Alphabet', 'Amazon', 'Meta', 'TSMC', 'Berkshire Hathaway']

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
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0d1117', letterSpacing: '-0.02em' }}>AlphaLens</div>
            <div style={{ fontSize: 11, color: '#9aa3b0', fontWeight: 500, marginTop: -2 }}>Investment Terminal</div>
          </div>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0d1117', textAlign: 'center', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 12 }}>
          AI-Powered Investment Research
        </h1>
        <p style={{ fontSize: 14, color: '#5a6474', textAlign: 'center', lineHeight: 1.6, marginBottom: 32, maxWidth: 400 }}>
          Six specialized agents analyze financials, news, risks, and competition — then synthesize a confident investment decision.
        </p>

        <div className="card" style={{ width: '100%', padding: 6, marginBottom: 12, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px' }}>
            <Search size={16} color="#9aa3b0" />
            <input
              ref={ref}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go()}
              placeholder="Enter company name or ticker — e.g. NVIDIA, AAPL"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#0d1117', background: 'transparent', fontFamily: 'Inter, sans-serif' }}
            />
            <button
              onClick={() => go()}
              disabled={!query.trim() || loading}
              className="btn btn-primary"
              style={{ borderRadius: 6, padding: '8px 18px' }}
            >
              {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : <><span>Analyze</span><ArrowRight size={14} /></>}
            </button>
          </div>

          {filtered.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, paddingBottom: 4 }}>
              {filtered.map(s => (
                <button
                  key={s}
                  onClick={() => go(s)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 16px', fontSize: 13, color: '#0d1117', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f7fa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
          {['NVDA', 'AAPL', 'TSLA', 'MSFT', 'GOOGL'].map(t => (
            <button
              key={t}
              onClick={() => go(t)}
              style={{ padding: '4px 12px', borderRadius: 6, background: 'white', border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#5a6474', fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1d6ae5'; e.currentTarget.style.color = '#1d6ae5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = '#5a6474' }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
          {[
            { icon: BarChart3, label: 'Financial Analysis', desc: 'Revenue, margins, cash flow, valuation from Yahoo Finance', color: '#1d6ae5' },
            { icon: Newspaper, label: 'News Sentiment', desc: 'Real-time news classified as positive, neutral, or negative', color: '#00a96e' },
            { icon: Shield, label: 'Risk Assessment', desc: 'Regulatory, competitive, macro, and geopolitical risks scored', color: '#d97706' },
            { icon: Brain, label: 'AI Decision', desc: 'Gemini Pro synthesizes all evidence into a final verdict', color: '#7c3aed' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Icon size={14} color={color} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0d1117' }}>{label}</span>
              </div>
              <p style={{ fontSize: 11, color: '#9aa3b0', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div style={{ marginTop: 48, fontSize: 11, color: '#c0c7d0', textAlign: 'center' }}>
        For informational purposes only. Not financial advice.
      </div>
    </div>
  )
}
