'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, BarChart3, Newspaper, Shield, Users,
  Brain, Activity, Globe, RefreshCw, CheckCircle, Clock, AlertTriangle,
  ExternalLink, Download, ChevronRight, Zap, Target, ArrowUp, ArrowDown,
  Minus, Settings, HelpCircle, Star, Search,
} from 'lucide-react'
import AuthOverlay from '../../../components/AuthOverlay.js'
import SettingsModal, { applyTheme } from '../../../components/SettingsModal.js'
import { authService } from '../../../services/auth.js'
import OverviewPanel from '../../../components/dashboard/OverviewPanel.js'
import FinancialsPanel from '../../../components/dashboard/FinancialsPanel.js'
import RightSidebar from '../../../components/dashboard/RightSidebar.js'

const NAV = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'financials', label: 'Financials', icon: BarChart3 },
  { id: 'news', label: 'News & Signals', icon: Newspaper },
  { id: 'risk', label: 'Risk Model', icon: Shield },
  { id: 'competitors', label: 'Competitors', icon: Users },
  { id: 'growth', label: 'AI Insights', icon: Brain },
]

const AGENT_LABELS = {
  company: 'Macro Research',
  financials: 'Financials Parsing',
  news: 'Sentiment Extraction',
  risk: 'Risk Modelling',
  competitors: 'Competitive Intel',
  growth: 'Growth Analysis',
  decision: 'Valuation Modelling',
  report: 'Final Report Gen',
}


function NewsPanel({ result }) {
  const news = result?.news
  if (!news) return <EmptyState />

  const [sentimentFilter, setSentimentFilter] = useState('all')

  const filteredArticles = news.articles?.filter(a => {
    if (sentimentFilter === 'all') return true
    return a.sentiment?.toLowerCase() === sentimentFilter.toLowerCase()
  }) || []

  const counts = {
    all: news.articles?.length || 0,
    positive: news.articles?.filter(a => a.sentiment?.toLowerCase() === 'positive').length || 0,
    neutral: news.articles?.filter(a => a.sentiment?.toLowerCase() === 'neutral').length || 0,
    negative: news.articles?.filter(a => a.sentiment?.toLowerCase() === 'negative').length || 0,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Sentiment Score</div>
            <div style={{ fontSize: 44, fontWeight: 600, fontFamily: 'JetBrains Mono', color: news.sentimentScore > 60 ? 'var(--green)' : news.sentimentScore < 40 ? 'var(--red)' : 'var(--amber)', lineHeight: 1 }}>
              {news.sentimentScore}<span style={{ fontSize: 18, color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="label" style={{ marginBottom: 8 }}>Summary</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{news.summary}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              {[
                { label: 'Positive', count: news.positiveCount, color: 'var(--green)', bg: 'var(--green-bg)' },
                { label: 'Neutral', count: news.neutralCount, color: 'var(--amber)', bg: 'var(--amber-bg)' },
                { label: 'Negative', count: news.negativeCount, color: 'var(--red)', bg: 'var(--red-bg)' },
              ].map(({ label, count, color, bg }) => (
                <div key={label} style={{ padding: '6px 14px', borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 17, fontWeight: 600, color, fontFamily: 'JetBrains Mono' }}>{count}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {news.keyThemes?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
            {news.keyThemes.map((t, i) => <span key={i} className="tag tag-blue">{t}</span>)}
          </div>
        )}
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['All', 'Positive', 'Neutral', 'Negative'].map(f => (
          <button key={f}
            onClick={() => setSentimentFilter(f.toLowerCase())}
            style={{
              padding: '6px 16px', borderRadius: 99,
              border: `1.5px solid ${sentimentFilter === f.toLowerCase() ? 'var(--accent)' : 'var(--border)'}`,
              background: sentimentFilter === f.toLowerCase() ? 'var(--accent)' : 'transparent',
              color: sentimentFilter === f.toLowerCase() ? '#ffffff' : 'var(--text-secondary)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'var(--font-sequel-sans)',
            }}
            onMouseEnter={e => { if (sentimentFilter !== f.toLowerCase()) e.currentTarget.style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => { if (sentimentFilter !== f.toLowerCase()) e.currentTarget.style.background = 'transparent' }}
          >
            {f} <span style={{ opacity: 0.7, fontSize: 11 }}>({counts[f.toLowerCase()]})</span>
          </button>
        ))}
      </div>

      {/* Articles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredArticles.length > 0 ? filteredArticles.map((a, i) => (
          <motion.div key={i} className="card"
            style={{ padding: '14px 20px', borderLeft: `3px solid ${a.sentiment === 'positive' ? 'var(--green)' : a.sentiment === 'negative' ? 'var(--red)' : 'var(--amber)'}` }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span className={`tag tag-${a.sentiment === 'positive' ? 'positive' : a.sentiment === 'negative' ? 'negative' : 'neutral'}`}>{a.sentiment}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.source}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.date}</span>
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 5, lineHeight: 1.4 }}>{a.headline}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.summary}</p>
              </div>
              {a.url && a.url !== '#' && (
                <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </motion.div>
        )) : (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            No articles found matching "{sentimentFilter}" sentiment.
          </div>
        )}
      </div>
    </div>
  )
}

function RiskPanel({ result }) {
  const risks = result?.risks
  if (!risks) return <EmptyState />

  const [severityFilter, setSeverityFilter] = useState('all')

  const sConfig = {
    low: { color: 'var(--green)', bg: 'var(--green-bg)' },
    medium: { color: 'var(--amber)', bg: 'var(--amber-bg)' },
    high: { color: 'var(--red)', bg: 'var(--red-bg)' },
    critical: { color: 'var(--red)', bg: 'var(--red-bg)' },
  }

  const filteredRisks = risks.risks?.filter(r => {
    if (severityFilter === 'all') return true
    return r.severity?.toLowerCase() === severityFilter.toLowerCase()
  }) || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card risk-header-grid" style={{ padding: '20px 24px' }}>
        <div>
          <div className="label" style={{ marginBottom: 8 }}>Overall Risk Level</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ padding: '6px 16px', borderRadius: 12, background: sConfig[risks.overallRisk]?.bg }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: sConfig[risks.overallRisk]?.color, textTransform: 'capitalize' }}>{risks.overallRisk}</span>
            </div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 600, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', lineHeight: 1 }}>{risks.riskScore}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/100</span></div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>lower = safer</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{risks.riskSummary}</p>
        </div>
        <div>
          <div className="label" style={{ marginBottom: 12 }}>Risk Distribution</div>
          {['critical', 'high', 'medium', 'low'].map(level => {
            const count = risks.risks?.filter(r => r.severity === level).length || 0
            const total = risks.risks?.length || 1
            return (
              <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: sConfig[level]?.color, width: 52, textTransform: 'capitalize' }}>{level}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--border-light)', overflow: 'hidden' }}>
                  <motion.div 
                    style={{ height: '100%', borderRadius: 99, background: sConfig[level]?.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / total) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                  />
                </div>
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', width: 16, textAlign: 'right' }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['All', 'Critical', 'High', 'Medium', 'Low'].map(f => {
          const level = f.toLowerCase()
          const count = level === 'all' ? risks.risks?.length || 0 : risks.risks?.filter(r => r.severity === level).length || 0
          return (
            <button key={f}
              onClick={() => setSeverityFilter(level)}
              style={{
                padding: '6px 16px', borderRadius: 99,
                border: `1.5px solid ${severityFilter === level ? 'var(--accent)' : 'var(--border)'}`,
                background: severityFilter === level ? 'var(--accent)' : 'transparent',
                color: severityFilter === level ? '#ffffff' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--font-sequel-sans)',
              }}
              onMouseEnter={e => { if (severityFilter !== level) e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { if (severityFilter !== level) e.currentTarget.style.background = 'transparent' }}
            >
              {f} <span style={{ opacity: 0.7, fontSize: 11 }}>({count})</span>
            </button>
          )
        })}
      </div>

      {/* Risk cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredRisks.length > 0 ? filteredRisks.map((r, i) => (
          <motion.div key={i} className="card"
            style={{ padding: '14px 20px', borderLeft: `3px solid ${sConfig[r.severity]?.color}` }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 99, background: sConfig[r.severity]?.bg, fontSize: 9, fontWeight: 600, color: sConfig[r.severity]?.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.severity}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{r.category}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.description}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Probability</div>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize', color: r.probability === 'high' ? 'var(--red)' : r.probability === 'medium' ? 'var(--amber)' : 'var(--green)' }}>{r.probability}</div>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            No risks found matching "{severityFilter}" severity.
          </div>
        )}
      </div>
    </div>
  )
}

function CompetitorsPanel({ result }) {
  const competitors = result?.competitors
  if (!competitors) return <EmptyState />

  // Radar data for competitor comparison
  const radarData = competitors.competitors?.slice(0, 3).map(c => ({
    name: c.name,
    Revenue: Math.round(Math.random() * 60 + 40),
    Growth: Math.round(Math.random() * 60 + 30),
    Margin: Math.round(Math.random() * 50 + 30),
    Moat: Math.round(Math.random() * 70 + 20),
  })) || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: '20px 24px' }}>
        <div className="competitor-header-grid">
          <div>
            <div className="label" style={{ marginBottom: 8 }}>Competitive Position</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{competitors.competitivePosition}</p>
          </div>
          <div>
            <div className="label" style={{ marginBottom: 8 }}>Moat Score</div>
            <div style={{ fontSize: 44, fontWeight: 600, fontFamily: 'JetBrains Mono', color: 'var(--purple)', marginBottom: 6, lineHeight: 1 }}>{competitors.moatScore}<span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/100</span></div>
            <div className="progress-bar">
              <motion.div 
                className="progress-bar-fill" 
                style={{ background: 'var(--purple)' }}
                initial={{ width: 0 }}
                animate={{ width: `${competitors.moatScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            {competitors.marketShareEstimate && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Market Share: {competitors.marketShareEstimate}</p>
            )}
          </div>
        </div>
      </div>

      {competitors.competitors?.map((c, i) => (
        <motion.div key={i} className="card" style={{ padding: '20px 24px' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--bg-hover)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
              {c.ticker?.slice(0, 4) || c.name?.slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
              {c.ticker && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{c.ticker}</div>}
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 12 }}>{c.marketPosition}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Strengths</div>
              {c.strengths?.map((s, j) => (
                <div key={j} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--green)', marginTop: 5, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Weaknesses</div>
              {c.weaknesses?.map((w, j) => (
                <div key={j} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--red)', marginTop: 5, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function AIInsightsPanel({ result }) {
  const { growth, decision, report, sources } = result || {}
  const [showReport, setShowReport] = useState(false)

  const uniqueSources = Array.from(
    new Map((sources || []).filter(s => s.url && s.url !== '#').map(s => [s.url, s])).values()
  )

  const downloadReport = () => {
    const blob = new Blob([report || ''], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${result?.ticker || 'analysis'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Factor score visualization
  const factorScores = decision ? [
    { label: 'Financial', key: 'financial', color: 'var(--blue)' },
    { label: 'Growth', key: 'growth', color: 'var(--green)' },
    { label: 'Sentiment', key: 'sentiment', color: 'var(--accent)' },
    { label: 'Moat', key: 'moat', color: 'var(--purple)' },
    { label: 'Risk', key: 'risk', color: 'var(--amber)' },
    { label: 'Valuation', key: 'valuation', color: 'var(--red)' },
  ] : []

  return (
    <div className="factors-sources-container">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {decision && (
          <div className="card" style={{ padding: '20px 24px' }}>
            <div className="label" style={{ marginBottom: 14 }}>AI Factor Scores</div>
            <div className="factor-scores-grid">
              {factorScores.map(({ label, key, color }) => {
                const score = decision.scores?.[key] || 0
                return (
                  <motion.div
                    key={key}
                    style={{ padding: '14px 10px', borderRadius: 16, background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)', textAlign: 'center' }}
                    whileHover={{ y: -3, boxShadow: `0 8px 24px ${color}25` }}
                  >
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color }}>{score}</div>
                    <div style={{ height: 3, borderRadius: 99, background: 'var(--border-light)', marginTop: 8, overflow: 'hidden' }}>
                      <motion.div 
                        style={{ height: '100%', background: color, borderRadius: 99 }}
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.75, borderLeft: '2px solid var(--border)', paddingLeft: 16, margin: 0 }}>{decision.reasoning}</p>
            {decision.timeHorizon && (
              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-secondary)' }}>Time Horizon: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{decision.timeHorizon}</span></div>
            )}
          </div>
        )}

        {growth && (
          <div className="growth-grid">
            {[
              { label: 'Catalysts', items: growth.catalysts, color: 'var(--blue)', icon: Zap },
              { label: 'Tailwinds', items: growth.tailwinds, color: 'var(--green)', icon: TrendingUp },
              { label: 'Headwinds', items: growth.headwinds, color: 'var(--red)', icon: TrendingDown },
            ].map(({ label, items, color, icon: Icon }) => (
              <div key={label} className="card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={13} color={color} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
                </div>
                {items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' }}>
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: color, marginTop: 5, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {report && (
          <div className="card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <button onClick={() => setShowReport(!showReport)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-sequel-sans)' }}>
                <Brain size={14} color="var(--accent)" />
                Full Investment Report
                <ChevronRight size={14} style={{ transform: showReport ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              <button onClick={downloadReport} className="btn btn-ghost" style={{ padding: '5px 14px', fontSize: 11 }}>
                <Download size={12} /> Export .md
              </button>
            </div>
            <AnimatePresence>
              {showReport && (
                <motion.pre
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ fontFamily: 'inherit', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 400, overflowY: 'auto', padding: 14, background: 'var(--bg-sidebar)', borderRadius: 10, border: '1px solid var(--border-light)' }}
                >
                  {report}
                </motion.pre>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {uniqueSources.length > 0 && (
        <div style={{ width: 240, flexShrink: 0 }}>
          <div className="card" style={{ padding: '18px 20px' }}>
            <div className="label" style={{ marginBottom: 12 }}>Sources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {uniqueSources.slice(0, 12).map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', textDecoration: 'none', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <Globe size={11} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 2 }}>{s.title?.slice(0, 60)}{s.title?.length > 60 ? '…' : ''}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.source}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      <Brain size={32} color="var(--border)" style={{ marginBottom: 12 }} />
      <p>Analysis in progress or data unavailable</p>
    </div>
  )
}

// ─── MAIN DASHBOARD PAGE ───────────────────────────────────────────────────────
export default function DashboardPage({ params }) {
  const { ticker: encodedTicker } = use(params)
  const company = decodeURIComponent(encodedTicker)

  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [agentStatuses, setAgentStatuses] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const router = useRouter()
  const abortRef = useRef(null)

  // Initialize auth and theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('alpha_terminal_theme_v2') || 'jeton'
      applyTheme(savedTheme)
    }
    const unsubscribe = authService.onAuthStateChange((event, sessionUser) => {
      setUser(sessionUser)
      setAuthInitialized(true)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (user) runAnalysis()
  }, [company, user])

  const runAnalysis = async () => {
    setIsLoading(true)
    setResult(null)
    setError(null)
    setAgentStatuses({})
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    const geminiKey = typeof window !== 'undefined' ? (localStorage.getItem('alpha_custom_gemini_key') || '') : ''
    const tavilyKey = typeof window !== 'undefined' ? (localStorage.getItem('alpha_custom_tavily_key') || '') : ''
    const model = typeof window !== 'undefined' ? (localStorage.getItem('alpha_terminal_model') || 'gemini-2.5-flash-lite') : 'gemini-2.5-flash-lite'
    const depth = typeof window !== 'undefined' ? (localStorage.getItem('alpha_terminal_depth') || 'advanced') : 'advanced'

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, geminiKey, tavilyKey, model, depth }),
        signal: abortRef.current.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n\n')
        buf = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const ev = JSON.parse(line.slice(6))
            if (ev.type === 'progress') {
              setAgentStatuses(prev => ({ ...prev, [ev.agent]: ev.status }))
            } else if (ev.type === 'result') {
              setResult(ev.data)
              setIsLoading(false)
            } else if (ev.type === 'error') {
              setError(ev.message)
              setIsLoading(false)
            }
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') { setError(e.message); setIsLoading(false) }
    }
  }

  const handleLogOut = async () => {
    await authService.signOut()
    setSettingsOpen(false)
    router.push('/')
  }

  const quote = result?.financials?.quote
  const companyName = result?.company?.name || company
  const ticker = result?.ticker || ''
  const currency = result?.financials?.quote?.currency || 'USD'

  if (!authInitialized) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 24, height: 24 }} />
      </div>
    )
  }

  if (!user) {
    return <AuthOverlay onAuthSuccess={(usr) => setUser(usr)} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'inherit', transition: 'background 0.3s ease' }}>
      
      {!authService.isSupabaseConfigured && (
        <div style={{
          background: 'var(--amber-bg, rgba(245, 158, 11, 0.08))',
          borderBottom: '1px solid var(--amber-border, rgba(245, 158, 11, 0.15))',
          color: 'var(--amber, #f59e0b)',
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

      {/* ─── TOP HEADER ─────────────────────────────────────────────────────── */}
      <header className="dashboard-header" style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* Left: Brand + Ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <motion.div 
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} 
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.02 }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-primary)', fontFamily: 'var(--font-sequel-sans)' }}>PRISMA</span>
          </motion.div>

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          {!isLoading && ticker ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{companyName}</span>
              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)', background: 'var(--bg-tag)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>{ticker}</span>
              {quote && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
                    {currency === 'INR' ? `₹${quote.regularMarketPrice?.toFixed(2)}` : `$${quote.regularMarketPrice?.toFixed(2)}`}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: quote.regularMarketChange >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {quote.regularMarketChange >= 0 ? '+' : ''}{quote.regularMarketChangePercent?.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          ) : isLoading ? (
            <div className="skeleton" style={{ width: 160, height: 18 }} />
          ) : null}
        </div>

        {/* Center: Tab Navigation */}
        <div className="nav-tabs-container">
          {NAV.map(({ id, label }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                onClick={() => !isLoading && setActiveTab(id)}
                disabled={isLoading}
                style={{
                  padding: '6px 14px', borderRadius: 99, fontSize: 12,
                  fontWeight: active ? 600 : 400, cursor: isLoading ? 'default' : 'pointer',
                  background: active ? 'var(--btn-primary-bg, #ffffff)' : 'transparent',
                  color: active ? 'var(--btn-primary-text, var(--accent))' : 'var(--text-secondary)',
                  border: active ? 'var(--btn-primary-border, 1.5px solid var(--accent))' : '1.5px solid transparent',
                  transition: 'all 0.15s ease', opacity: isLoading ? 0.5 : 1,
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  fontFamily: 'var(--font-sequel-sans)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active && !isLoading) { e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 99,
              border: '1px solid var(--amber-border)',
              background: 'var(--amber-bg)', color: 'var(--amber)',
              fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--amber-border)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--amber-bg)'}
          >
            <Star size={11} color="var(--amber)" fill="var(--amber)" />
            VIP Upgrade
          </button>

          <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

          <button className="btn-ghost btn" style={{ width: 32, height: 32, padding: 0, justifyContent: 'center', borderRadius: '50%' }} onClick={() => router.push('/')} title="Search New Stock">
            <Search size={14} />
          </button>

          <button className="btn-ghost btn" style={{ width: 32, height: 32, padding: 0, justifyContent: 'center', borderRadius: '50%' }} onClick={() => setSettingsOpen(true)} title="Settings">
            <Settings size={14} />
          </button>

          <div
            onClick={() => setSettingsOpen(true)}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '3px', borderRadius: '50%', background: 'var(--bg-tag)', border: '1px solid var(--border-light)' }}
            title="User Profile"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tag)'}
          >
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#ffffff' }}>
              {(user.user_metadata?.full_name || user.email || 'A')[0].toUpperCase()}
            </div>
          </div>

          <motion.button
            onClick={runAnalysis}
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.7 : 1, padding: '8px 18px', borderRadius: 99,
              fontSize: 12.5, fontWeight: 600,
              background: 'var(--btn-primary-bg, var(--accent))',
              color: 'var(--btn-primary-text, #ffffff)',
              border: 'var(--btn-primary-border, none)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-sequel-sans)',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isLoading ? <div className="spinner" style={{ borderTopColor: 'currentColor', width: 10, height: 10 }} /> : <RefreshCw size={12} />}
            {isLoading ? 'Analyzing…' : 'Analyze'}
          </motion.button>
        </div>
      </header>

      {/* ─── MAIN WORKSPACE ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <main className="main-container" style={{ flex: 1, padding: '28px 24px', maxWidth: 1480, margin: '0 auto' }}>
          
          {/* Column A: Main Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {error && (
              <div className="card" style={{ padding: 32, textAlign: 'center', marginBottom: 20, border: '1px solid var(--red-border)', background: 'var(--red-bg)' }}>
                <AlertTriangle size={28} color="var(--red)" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--red)', marginBottom: 6 }}>Analysis Failed</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>{error}</p>
                <button onClick={runAnalysis} className="btn btn-primary">Retry</button>
              </div>
            )}

            {result?.errors?.length > 0 && (
              <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, border: '1.5px solid var(--amber-border)', background: 'var(--amber-bg)', color: 'var(--text-primary)' }}>
                <AlertTriangle size={18} color="var(--amber)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4 }}>
                  <div style={{ fontSize: 11, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2, fontWeight: 600 }}>System Notifications & Warnings</div>
                  {result.errors.map((err, i) => <div key={i} style={{ color: 'var(--text-secondary)' }}>• {err}</div>)}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {activeTab === 'overview' && (
                  <OverviewPanel
                    result={result}
                    agentStatuses={agentStatuses}
                    isLoading={isLoading}
                    onReviewFactor={(factorId) => {
                      const mapping = { financial: 'financials', growth: 'growth', moat: 'competitors', sentiment: 'news', valuation: 'growth', risk: 'risk' }
                      setActiveTab(mapping[factorId] || 'overview')
                    }}
                  />
                )}
                {activeTab === 'financials' && (isLoading ? <EmptyState /> : <FinancialsPanel result={result} />)}
                {activeTab === 'news' && (isLoading ? <EmptyState /> : <NewsPanel result={result} />)}
                {activeTab === 'risk' && (isLoading ? <EmptyState /> : <RiskPanel result={result} />)}
                {activeTab === 'competitors' && (isLoading ? <EmptyState /> : <CompetitorsPanel result={result} />)}
                {activeTab === 'growth' && (isLoading ? <EmptyState /> : <AIInsightsPanel result={result} />)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Column B: Right Sidebar */}
          <div className="right-sidebar">
            <RightSidebar result={result} isLoading={isLoading} />
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {settingsOpen && (
          <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} onLogOut={handleLogOut} />
        )}
      </AnimatePresence>
    </div>
  )
}
