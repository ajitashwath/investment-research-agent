'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, BarChart3, Newspaper, Shield, Users,
  Brain, Activity, Globe, RefreshCw, CheckCircle, Clock, AlertTriangle,
  ExternalLink, Download, ChevronRight, Zap, Target, ArrowUp, ArrowDown,
  Minus, Settings, HelpCircle, LogOut, Star, Search,
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts'

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

function fmt(num) {
  if (num == null) return 'N/A'
  if (Math.abs(num) >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (Math.abs(num) >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
  if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
  return `$${num.toFixed(2)}`
}

function pct(num) {
  if (num == null) return 'N/A'
  return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`
}

function scoreToGrade(score) {
  if (score >= 95) return 'AAA'
  if (score >= 88) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 73) return 'A-'
  if (score >= 67) return 'B+'
  if (score >= 60) return 'B'
  if (score >= 53) return 'B-'
  if (score >= 45) return 'C+'
  if (score >= 38) return 'C'
  if (score >= 30) return 'C-'
  return 'D'
}

function riskLabel(score) {
  if (score >= 75) return 'Critical'
  if (score >= 55) return 'High'
  if (score >= 35) return 'Medium'
  return 'Low'
}

function FactorGrade({ label, grade, trend, color }) {
  const trendIcon = trend === 'up' ? <ArrowUp size={10} /> : trend === 'down' ? <ArrowDown size={10} /> : <Minus size={10} />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div className="label" style={{ fontSize: 9 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: color || '#0d1117', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>
          {grade}
        </span>
        <span style={{ fontSize: 10, color: trend === 'up' ? '#00a96e' : trend === 'down' ? '#e53935' : '#9aa3b0', display: 'flex', alignItems: 'center' }}>
          {trendIcon}
        </span>
      </div>
    </div>
  )
}

function AnalysisMatrix({ agentStatuses, isLoading }) {
  const agents = Object.keys(AGENT_LABELS)
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Activity size={12} color="#1d6ae5" />
        <span className="label" style={{ color: '#1d6ae5' }}>Analysis Matrix</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {agents.map((agent) => {
          const status = agentStatuses[agent] || 'waiting'
          const isDone = status === 'done'
          const isRunning = status === 'running'
          const isError = status === 'error'
          const pct = isDone ? 100 : isRunning ? 65 : 0

          return (
            <div key={agent}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isDone ? (
                    <CheckCircle size={11} color="#00a96e" />
                  ) : isRunning ? (
                    <div className="spinner" style={{ width: 11, height: 11 }} />
                  ) : isError ? (
                    <AlertTriangle size={11} color="#e53935" />
                  ) : (
                    <Clock size={11} color="#c0c7d0" />
                  )}
                  <span style={{ fontSize: 11, color: isDone ? '#0d1117' : isRunning ? '#0d1117' : '#9aa3b0', fontWeight: isDone || isRunning ? 500 : 400 }}>
                    {AGENT_LABELS[agent]}
                  </span>
                </div>
                <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: isDone ? '#00a96e' : isRunning ? '#1d6ae5' : isError ? '#e53935' : '#c0c7d0', fontWeight: 600 }}>
                  {isDone ? '100%' : isRunning ? '—' : isError ? 'ERR' : 'Pending'}
                </span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ background: isDone ? '#00a96e' : isRunning ? '#1d6ae5' : isError ? '#e53935' : '#e5e8ed' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <div style={{ fontSize: 11, color: '#9aa3b0', marginBottom: 4 }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: entry.color || entry.stroke }} />
          <span style={{ color: '#5a6474', fontSize: 12 }}>{entry.name}:</span>
          <span style={{ color: '#0d1117', fontWeight: 600, fontSize: 12 }}>
            {typeof entry.value === 'number' && Math.abs(entry.value) > 1e6
              ? fmt(entry.value)
              : entry.value != null ? entry.value.toLocaleString?.() ?? entry.value : 'N/A'}
          </span>
        </div>
      ))}
    </div>
  )
}

function OverviewPanel({ result, agentStatuses, isLoading }) {
  const decision = result?.decision
  const financials = result?.financials
  const news = result?.news
  const company = result?.company
  const scores = decision?.scores || {}

  const revenueData = financials?.revenueData?.map(d => ({
    year: String(d.year),
    Revenue: d.revenue,
    'Net Income': d.netIncome,
  })) || []

  const recColor = decision?.recommendation?.includes('BUY') ? '#00a96e' : decision?.recommendation?.includes('SELL') ? '#e53935' : '#d97706'

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="label" style={{ marginBottom: 8 }}>AlphaLens Recommendation</div>
              {isLoading ? (
                <div className="skeleton" style={{ width: 160, height: 44, marginBottom: 8 }} />
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ fontSize: 42, fontWeight: 900, color: recColor, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}
                >
                  {decision?.recommendation || '—'}
                </motion.div>
              )}
              {!isLoading && decision && (
                <p style={{ fontSize: 12, color: '#5a6474', lineHeight: 1.6, maxWidth: 360 }}>
                  {decision.reasoning}
                </p>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 24 }}>
              <div className="label" style={{ marginBottom: 4 }}>Confidence</div>
              {isLoading ? (
                <div className="skeleton" style={{ width: 64, height: 36 }} />
              ) : (
                <div style={{ fontSize: 36, fontWeight: 900, color: '#0d1117', letterSpacing: '-0.04em', fontFamily: 'JetBrains Mono, monospace' }}>
                  {decision?.confidence || 0}<span style={{ fontSize: 18, color: '#9aa3b0' }}>%</span>
                </div>
              )}
            </div>
          </div>
          {!isLoading && decision && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {decision.keyBullets?.bullCase?.slice(0, 2).map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', background: '#f0faf6', border: '1px solid #b3edd8', borderRadius: 6, padding: '6px 10px', maxWidth: 280 }}>
                  <ArrowUp size={11} color="#00a96e" style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#0d4a2e', lineHeight: 1.4 }}>{b}</span>
                </div>
              ))}
              {decision.keyBullets?.bearCase?.slice(0, 1).map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', background: '#fff5f5', border: '1px solid #f5c0c0', borderRadius: 6, padding: '6px 10px', maxWidth: 280 }}>
                  <ArrowDown size={11} color="#e53935" style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#5a1a1a', lineHeight: 1.4 }}>{b}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '18px 22px' }}>
          <div className="label" style={{ marginBottom: 14 }}>Factor Scores</div>
          {isLoading ? (
            <div style={{ display: 'flex', gap: 24 }}>
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ width: 48, height: 40 }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
              {[
                { label: 'Financial Health', key: 'financial', trend: 'up', color: '#0d1117' },
                { label: 'Growth', key: 'growth', trend: 'up', color: '#0d1117' },
                { label: 'Sentiment', key: 'sentiment', trend: 'neutral', color: '#0d1117' },
                { label: 'Moat', key: 'moat', trend: 'up', color: '#1d6ae5' },
                { label: 'Risk', key: 'risk', trend: 'neutral', color: '#0d1117', isRisk: true },
                { label: 'Valuation', key: 'valuation', trend: 'down', color: '#e53935' },
              ].map(({ label, key, trend, color, isRisk }, i) => (
                <div
                  key={key}
                  style={{
                    flex: '1 0 auto',
                    padding: '10px 16px',
                    borderRight: i < 5 ? '1px solid var(--border)' : 'none',
                    minWidth: 90,
                  }}
                >
                  <FactorGrade
                    label={label}
                    grade={isRisk ? riskLabel(100 - (scores[key] || 50)) : scoreToGrade(scores[key] || 0)}
                    trend={trend}
                    color={isRisk ? (scores[key] > 65 ? '#00a96e' : scores[key] > 40 ? '#d97706' : '#e53935') : color}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="label">Revenue & Net Income Trends</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['1Y', '3Y', 'Max'].map(p => (
                <button key={p} style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)', background: p === '3Y' ? '#0d1117' : 'transparent', color: p === '3Y' ? 'white' : '#9aa3b0', fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          {isLoading ? (
            <div className="skeleton" style={{ height: 180 }} />
          ) : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                <XAxis dataKey="year" tick={{ fill: '#9aa3b0', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#9aa3b0', fontSize: 10 }} axisLine={false} tickLine={false} width={54} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Revenue" stroke="#1d6ae5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Net Income" stroke="#00a96e" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aa3b0', fontSize: 12 }}>No financial data available</div>
          )}

          {!isLoading && financials?.revenueData?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div className="label" style={{ paddingBottom: 6 }}>Metric</div>
                {financials.revenueData.slice(-3).map(d => (
                  <div key={d.year} className="label" style={{ textAlign: 'right', paddingBottom: 6 }}>FY {d.year}</div>
                ))}
              </div>
              {[
                { label: 'Total Revenue', key: 'revenue', formatter: fmt },
                { label: 'Gross Margin', key: null, customFn: (d) => d.grossProfit && d.revenue ? `${((d.grossProfit / d.revenue) * 100).toFixed(1)}%` : 'N/A' },
                { label: 'Diluted EPS', key: 'eps', formatter: v => v ? `$${v.toFixed(2)}` : 'N/A' },
              ].map(({ label, key, formatter, customFn }) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0, borderTop: '1px solid #f5f7fa', padding: '8px 0' }}>
                  <div style={{ fontSize: 12, color: '#5a6474' }}>{label}</div>
                  {financials.revenueData.slice(-3).map((d, i) => (
                    <div key={i} style={{ textAlign: 'right', fontSize: 12, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>
                      {customFn ? customFn(d) : (key ? formatter(d[key]) : 'N/A')}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {!isLoading && company && (
          <div className="card" style={{ padding: '18px 22px' }}>
            <div className="label" style={{ marginBottom: 12 }}>Company Overview</div>
            <p style={{ fontSize: 12, color: '#5a6474', lineHeight: 1.7, marginBottom: 12 }}>{company.businessSummary}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {company.products?.slice(0, 5).map((p, i) => (
                <span key={i} style={{ padding: '3px 10px', borderRadius: 4, background: '#f5f7fa', border: '1px solid var(--border)', fontSize: 11, color: '#5a6474' }}>{p}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AnalysisMatrix agentStatuses={agentStatuses} isLoading={isLoading} />

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Newspaper size={12} color="#5a6474" />
            <span className="label">Signals & News</span>
          </div>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}
            </div>
          ) : result?.news?.articles?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.news.articles.slice(0, 4).map((a, i) => (
                <div
                  key={i}
                  style={{ paddingBottom: i < Math.min(result.news.articles.length, 4) - 1 ? 10 : 0, borderBottom: i < Math.min(result.news.articles.length, 4) - 1 ? '1px solid #f5f7fa' : 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className={`tag tag-${a.sentiment === 'positive' ? 'positive' : a.sentiment === 'negative' ? 'negative' : 'neutral'}`}>
                      {a.sentiment}
                    </span>
                    <span style={{ fontSize: 10, color: '#c0c7d0' }}>{a.date?.slice(0, 7) || ''}</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#0d1117', fontWeight: 500, lineHeight: 1.4, marginBottom: 3 }}>{a.headline}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: '#9aa3b0' }}>{a.source}</span>
                    {a.url && a.url !== '#' && (
                      <a href={a.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={10} color="#c0c7d0" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#c0c7d0', fontSize: 12 }}>No news data</div>
          )}
        </div>

        {!isLoading && financials?.quote && (
          <div className="card" style={{ padding: '18px 20px' }}>
            <div className="label" style={{ marginBottom: 12 }}>Market Data</div>
            {[
              { label: 'Price', value: `$${financials.quote.regularMarketPrice?.toFixed(2)}` },
              { label: 'Change', value: `${financials.quote.regularMarketChange > 0 ? '+' : ''}${financials.quote.regularMarketChange?.toFixed(2)}%`, color: financials.quote.regularMarketChange >= 0 ? '#00a96e' : '#e53935' },
              { label: 'Mkt Cap', value: fmt(financials.quote.marketCap) },
              { label: '52W High', value: `$${financials.quote.fiftyTwoWeekHigh?.toFixed(2)}` },
              { label: '52W Low', value: `$${financials.quote.fiftyTwoWeekLow?.toFixed(2)}` },
              { label: 'P/E', value: financials.trailingPE?.toFixed(1) || 'N/A' },
              { label: 'Beta', value: financials.beta?.toFixed(2) || 'N/A' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f5f7fa' }}>
                <span style={{ fontSize: 11, color: '#9aa3b0' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: color || '#0d1117', fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FinancialsPanel({ result }) {
  const f = result?.financials
  if (!f) return <EmptyState />

  const metrics = [
    { label: 'Revenue Growth YoY', value: pct(f.revenueGrowth), positive: f.revenueGrowth > 0 },
    { label: 'Gross Margin', value: f.grossMargin ? `${f.grossMargin.toFixed(1)}%` : 'N/A', positive: f.grossMargin > 30 },
    { label: 'Net Margin', value: f.netMargin ? `${f.netMargin.toFixed(1)}%` : 'N/A', positive: f.netMargin > 10 },
    { label: 'Free Cash Flow', value: fmt(f.freeCashFlow), positive: f.freeCashFlow > 0 },
    { label: 'Return on Equity', value: f.returnOnEquity ? `${f.returnOnEquity.toFixed(1)}%` : 'N/A', positive: f.returnOnEquity > 15 },
    { label: 'Debt / Equity', value: f.debtToEquity?.toFixed(2) || 'N/A', positive: f.debtToEquity < 1 },
    { label: 'Current Ratio', value: f.currentRatio?.toFixed(2) || 'N/A', positive: f.currentRatio > 1.5 },
    { label: 'P/E Trailing', value: f.trailingPE?.toFixed(1) || 'N/A', positive: null },
    { label: 'P/E Forward', value: f.forwardPE?.toFixed(1) || 'N/A', positive: null },
    { label: 'Price / Book', value: f.priceToBook?.toFixed(2) || 'N/A', positive: null },
    { label: 'EBITDA', value: fmt(f.ebitda), positive: f.ebitda > 0 },
    { label: 'Total Cash', value: fmt(f.totalCash), positive: null },
  ]

  const revData = f.revenueData?.map(d => ({
    year: String(d.year),
    Revenue: d.revenue,
    'Gross Profit': d.grossProfit,
    'Net Income': d.netIncome,
  })) || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ padding: '8px 16px', borderRadius: 8, background: f.healthScore >= 75 ? '#e8f9f3' : f.healthScore >= 50 ? '#fff8e8' : '#fff0f0', border: `1px solid ${f.healthScore >= 75 ? '#b3edd8' : f.healthScore >= 50 ? '#f5dfa0' : '#f5c0c0'}` }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: f.healthScore >= 75 ? '#00a96e' : f.healthScore >= 50 ? '#d97706' : '#e53935', fontFamily: 'JetBrains Mono' }}>{f.healthGrade}</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Financial Health — {f.healthScore}/100</div>
            <p style={{ fontSize: 12, color: '#5a6474' }}>{f.healthReason}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {metrics.map(({ label, value, positive }) => (
            <div key={label} style={{ padding: '12px 14px', borderRadius: 8, background: '#f8f9fb', border: '1px solid #eef0f3' }}>
              <div style={{ fontSize: 10, color: '#9aa3b0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: positive === true ? '#00a96e' : positive === false ? '#e53935' : '#0d1117', fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div className="label" style={{ marginBottom: 14 }}>Revenue & Profitability</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revData} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
              <XAxis dataKey="year" tick={{ fill: '#9aa3b0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#9aa3b0', fontSize: 10 }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Revenue" fill="#1d6ae5" radius={[3,3,0,0]} opacity={0.8} />
              <Bar dataKey="Gross Profit" fill="#06b6d4" radius={[3,3,0,0]} opacity={0.8} />
              <Bar dataKey="Net Income" fill="#00a96e" radius={[3,3,0,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: '18px 22px' }}>
          <div className="label" style={{ marginBottom: 14 }}>EPS Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={f.revenueData?.map(d => ({ year: String(d.year), EPS: d.eps })) || []} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="epsG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
              <XAxis dataKey="year" tick={{ fill: '#9aa3b0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9aa3b0', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="EPS" stroke="#7c3aed" strokeWidth={2} fill="url(#epsG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function NewsPanel({ result }) {
  const news = result?.news
  if (!news) return <EmptyState />

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Sentiment Score</div>
              <div style={{ fontSize: 40, fontWeight: 900, fontFamily: 'JetBrains Mono', color: news.sentimentScore > 60 ? '#00a96e' : news.sentimentScore < 40 ? '#e53935' : '#d97706' }}>
                {news.sentimentScore}<span style={{ fontSize: 18, color: '#9aa3b0', fontWeight: 400 }}>/100</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="label" style={{ marginBottom: 8 }}>Summary</div>
              <p style={{ fontSize: 12, color: '#5a6474', lineHeight: 1.7 }}>{news.summary}</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                {[
                  { label: 'Positive', count: news.positiveCount, color: '#00a96e', bg: '#e8f9f3' },
                  { label: 'Neutral', count: news.neutralCount, color: '#d97706', bg: '#fff8e8' },
                  { label: 'Negative', count: news.negativeCount, color: '#e53935', bg: '#fff0f0' },
                ].map(({ label, count, color, bg }) => (
                  <div key={label} style={{ padding: '6px 12px', borderRadius: 6, background: bg, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: 'JetBrains Mono' }}>{count}</span>
                    <span style={{ fontSize: 10, color: '#9aa3b0', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {news.keyThemes?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {news.keyThemes.map((t, i) => <span key={i} className="tag tag-blue">{t}</span>)}
            </div>
          )}
        </div>

        {news.articles?.map((a, i) => (
          <motion.div
            key={i}
            className="card"
            style={{ padding: '16px 20px', borderLeft: `3px solid ${a.sentiment === 'positive' ? '#00a96e' : a.sentiment === 'negative' ? '#e53935' : '#d97706'}` }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span className={`tag tag-${a.sentiment === 'positive' ? 'positive' : a.sentiment === 'negative' ? 'negative' : 'neutral'}`}>{a.sentiment}</span>
                  <span style={{ fontSize: 10, color: '#9aa3b0' }}>{a.source}</span>
                  <span style={{ fontSize: 10, color: '#c0c7d0' }}>·</span>
                  <span style={{ fontSize: 10, color: '#c0c7d0' }}>{a.date}</span>
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 5, lineHeight: 1.4 }}>{a.headline}</h3>
                <p style={{ fontSize: 12, color: '#5a6474', lineHeight: 1.5 }}>{a.summary}</p>
              </div>
              {a.url && a.url !== '#' && (
                <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, color: '#c0c7d0' }}>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function RiskPanel({ result }) {
  const risks = result?.risks
  if (!risks) return <EmptyState />

  const sConfig = {
    low: { color: '#00a96e', bg: '#e8f9f3', border: '#b3edd8' },
    medium: { color: '#d97706', bg: '#fff8e8', border: '#f5dfa0' },
    high: { color: '#e53935', bg: '#fff0f0', border: '#f5c0c0' },
    critical: { color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' },
  }

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card" style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div className="label" style={{ marginBottom: 8 }}>Overall Risk Level</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ padding: '6px 14px', borderRadius: 6, background: sConfig[risks.overallRisk]?.bg, border: `1px solid ${sConfig[risks.overallRisk]?.border}` }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: sConfig[risks.overallRisk]?.color, textTransform: 'capitalize' }}>{risks.overallRisk}</span>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'JetBrains Mono', color: '#0d1117' }}>{risks.riskScore}<span style={{ fontSize: 14, color: '#9aa3b0', fontWeight: 400 }}>/100</span></div>
                <div style={{ fontSize: 10, color: '#9aa3b0' }}>lower = safer</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#5a6474', lineHeight: 1.6 }}>{risks.riskSummary}</p>
          </div>
          <div>
            <div className="label" style={{ marginBottom: 10 }}>Risk Distribution</div>
            {['critical', 'high', 'medium', 'low'].map(level => {
              const count = risks.risks?.filter(r => r.severity === level).length || 0
              const total = risks.risks?.length || 1
              return (
                <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: sConfig[level]?.color, width: 48, textTransform: 'capitalize' }}>{level}</span>
                  <div style={{ flex: 1, height: 5, borderRadius: 99, background: '#f0f2f5' }}>
                    <div style={{ width: `${(count / total) * 100}%`, height: '100%', borderRadius: 99, background: sConfig[level]?.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#9aa3b0', width: 16 }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {risks.risks?.map((r, i) => (
          <motion.div
            key={i}
            className="card"
            style={{ padding: '14px 20px', borderLeft: `3px solid ${sConfig[r.severity]?.color}` }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, background: sConfig[r.severity]?.bg, border: `1px solid ${sConfig[r.severity]?.border}`, fontSize: 10, fontWeight: 700, color: sConfig[r.severity]?.color, textTransform: 'uppercase' }}>{r.severity}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{r.category}</span>
                </div>
                <p style={{ fontSize: 12, color: '#5a6474', lineHeight: 1.5 }}>{r.description}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: '#9aa3b0', marginBottom: 2 }}>Probability</div>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize', color: r.probability === 'high' ? '#e53935' : r.probability === 'medium' ? '#d97706' : '#00a96e' }}>{r.probability}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CompetitorsPanel({ result }) {
  const competitors = result?.competitors
  if (!competitors) return <EmptyState />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div className="label" style={{ marginBottom: 8 }}>Competitive Position</div>
          <p style={{ fontSize: 12, color: '#5a6474', lineHeight: 1.7 }}>{competitors.competitivePosition}</p>
        </div>
        <div>
          <div className="label" style={{ marginBottom: 8 }}>Moat Score</div>
          <div style={{ fontSize: 40, fontWeight: 900, fontFamily: 'JetBrains Mono', color: '#7c3aed', marginBottom: 8 }}>{competitors.moatScore}<span style={{ fontSize: 18, color: '#9aa3b0' }}>/100</span></div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${competitors.moatScore}%`, background: '#7c3aed' }} />
          </div>
          {competitors.marketShareEstimate && (
            <p style={{ fontSize: 11, color: '#9aa3b0', marginTop: 8 }}>Market Share: {competitors.marketShareEstimate}</p>
          )}
        </div>
      </div>

      {competitors.competitors?.map((c, i) => (
        <motion.div key={i} className="card" style={{ padding: '18px 22px' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f0f2f5', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#5a6474', fontFamily: 'JetBrains Mono' }}>
              {c.ticker?.slice(0, 4) || c.name?.slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
              {c.ticker && <div style={{ fontSize: 11, color: '#9aa3b0', fontFamily: 'JetBrains Mono' }}>{c.ticker}</div>}
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#5a6474', lineHeight: 1.5, marginBottom: 12 }}>{c.marketPosition}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#00a96e', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Strengths</div>
              {c.strengths?.map((s, j) => (
                <div key={j} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#00a96e', marginTop: 5, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#5a6474' }}>{s}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#e53935', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Weaknesses</div>
              {c.weaknesses?.map((w, j) => (
                <div key={j} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#e53935', marginTop: 5, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#5a6474' }}>{w}</span>
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

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {decision && (
          <div className="card" style={{ padding: '20px 24px' }}>
            <div className="label" style={{ marginBottom: 12 }}>AI Logic & Synthesis</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Financial', key: 'financial', color: '#1d6ae5' },
                { label: 'Growth', key: 'growth', color: '#00a96e' },
                { label: 'Sentiment', key: 'sentiment', color: '#06b6d4' },
                { label: 'Moat', key: 'moat', color: '#7c3aed' },
                { label: 'Risk', key: 'risk', color: '#d97706' },
                { label: 'Valuation', key: 'valuation', color: '#e53935' },
              ].map(({ label, key, color }) => (
                <div key={key} style={{ padding: '12px', borderRadius: 8, background: '#f8f9fb', border: '1px solid #eef0f3', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#9aa3b0', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'JetBrains Mono' }}>{decision.scores?.[key] || 0}</div>
                  <div style={{ fontSize: 9, color: '#c0c7d0' }}>/100</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#0d1117', lineHeight: 1.7, borderLeft: '3px solid #1d6ae5', paddingLeft: 14 }}>{decision.reasoning}</p>
            {decision.timeHorizon && (
              <div style={{ marginTop: 10, fontSize: 11, color: '#9aa3b0' }}>Time Horizon: <strong style={{ color: '#0d1117' }}>{decision.timeHorizon}</strong></div>
            )}
          </div>
        )}

        {growth && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {[
              { label: 'Catalysts', items: growth.catalysts, color: '#1d6ae5', icon: Zap },
              { label: 'Tailwinds', items: growth.tailwinds, color: '#00a96e', icon: TrendingUp },
              { label: 'Headwinds', items: growth.headwinds, color: '#e53935', icon: TrendingDown },
            ].map(({ label, items, color, icon: Icon }) => (
              <div key={label} className="card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                  <Icon size={12} color={color} />
                  <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                </div>
                {items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' }}>
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: color, marginTop: 5, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: '#5a6474', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {report && (
          <div className="card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <button onClick={() => setShowReport(!showReport)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#0d1117' }}>
                <Brain size={14} color="#1d6ae5" />
                <span>Full Investment Report</span>
                <ChevronRight size={14} style={{ transform: showReport ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              <button onClick={downloadReport} className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 11 }}>
                <Download size={12} /> Export .md
              </button>
            </div>
            {showReport && (
              <pre style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#5a6474', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 400, overflowY: 'auto', padding: 12, background: '#f8f9fb', borderRadius: 8, border: '1px solid #eef0f3' }}>
                {report}
              </pre>
            )}
          </div>
        )}
      </div>

      {uniqueSources.length > 0 && (
        <div style={{ width: 240, flexShrink: 0 }}>
          <div className="card" style={{ padding: '18px 20px' }}>
            <div className="label" style={{ marginBottom: 12 }}>Sources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {uniqueSources.slice(0, 12).map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', textDecoration: 'none', padding: '6px 0', borderBottom: '1px solid #f5f7fa' }}>
                  <Globe size={11} color="#9aa3b0" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: '#0d1117', lineHeight: 1.3, marginBottom: 2 }}>{s.title?.slice(0, 60)}{s.title?.length > 60 ? '…' : ''}</div>
                    <div style={{ fontSize: 10, color: '#9aa3b0' }}>{s.source}</div>
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
    <div className="card" style={{ padding: 40, textAlign: 'center', color: '#9aa3b0', fontSize: 13 }}>
      <Brain size={32} color="#e5e8ed" style={{ marginBottom: 12 }} />
      <p>Analysis in progress or data unavailable</p>
    </div>
  )
}

export default function DashboardPage({ params }) {
  const { ticker: encodedTicker } = use(params)
  const company = decodeURIComponent(encodedTicker)

  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [agentStatuses, setAgentStatuses] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const router = useRouter()
  const abortRef = useRef(null)

  useEffect(() => { runAnalysis() }, [company])

  const runAnalysis = async () => {
    setIsLoading(true)
    setResult(null)
    setError(null)
    setAgentStatuses({})
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company }),
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

  const quote = result?.financials?.quote
  const companyName = result?.company?.name || company
  const ticker = result?.ticker || ''

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 30,
      }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1117', letterSpacing: '-0.02em' }}>AlphaLens</div>
              <div style={{ fontSize: 9, color: '#9aa3b0', fontWeight: 600 }}>Investment Terminal</div>
            </div>
          </div>
        </div>

        {!isLoading && ticker && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: '#f8f9fb' }}>
            <div style={{ fontSize: 10, color: '#9aa3b0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{result?.company?.industry || ''}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0d1117' }}>{companyName}</div>
            <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#5a6474' }}>{ticker}</div>
            {quote && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#0d1117' }}>${quote.regularMarketPrice?.toFixed(2)}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: quote.regularMarketChange >= 0 ? '#00a96e' : '#e53935' }}>
                  {quote.regularMarketChange >= 0 ? '+' : ''}{quote.regularMarketChangePercent?.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        )}

        <nav style={{ padding: '10px 10px', flex: 1 }}>
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                onClick={() => !isLoading && setActiveTab(id)}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: active ? '#eef3fc' : 'transparent',
                  color: active ? '#1d6ae5' : '#6b7280',
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  cursor: isLoading ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s',
                  marginBottom: 2,
                  opacity: isLoading ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!active && !isLoading) e.currentTarget.style.background = '#f5f7fa' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={13} />
                {label}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '9px 12px',
              borderRadius: 6,
              border: '1px solid #1d6ae5',
              background: '#eef3fc',
              color: '#1d6ae5',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 2,
            }}
          >
            <Star size={12} />
            Premium Plan
          </button>
          <div style={{ display: 'flex', padding: '4px 0' }}>
            <button className="btn-ghost btn" style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '5px' }}>
              <Settings size={12} />
            </button>
            <button className="btn-ghost btn" style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '5px' }} onClick={() => router.push('/')}>
              <Search size={12} />
            </button>
          </div>
          <div style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#eef3fc', border: '1px solid #b3cffc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#1d6ae5' }}>A</div>
            <span style={{ fontSize: 11, color: '#5a6474', fontWeight: 500 }}>Analyst_01</span>
          </div>
        </div>
      </aside>

      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{
          height: 'var(--header-height)',
          borderBottom: '1px solid var(--border)',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}>
          <div style={{ flex: 1 }}>
            {isLoading ? (
              <div className="skeleton" style={{ width: 200, height: 18 }} />
            ) : (
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0d1117' }}>
                {ticker && <span style={{ fontFamily: 'JetBrains Mono', marginRight: 8, color: '#5a6474' }}>{ticker}</span>}
                {companyName}
              </div>
            )}
          </div>

          {!isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="tag tag-blue" style={{ fontSize: 9 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1d6ae5', animation: 'pulse 2s infinite' }} />
                Last Updated: Just now (Live)
              </div>
            </div>
          )}

          <button
            onClick={runAnalysis}
            disabled={isLoading}
            className="btn btn-primary"
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : <RefreshCw size={13} />}
            {isLoading ? 'Analyzing…' : 'Analyze'}
          </button>
        </header>

        <main style={{ flex: 1, padding: '20px 24px', maxWidth: 1300 }}>
          {error && (
            <div className="card" style={{ padding: 32, textAlign: 'center', marginBottom: 20 }}>
              <AlertTriangle size={28} color="#e53935" style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Analysis Failed</div>
              <p style={{ fontSize: 12, color: '#9aa3b0', marginBottom: 16 }}>{error}</p>
              <button onClick={runAnalysis} className="btn btn-primary">Retry</button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {activeTab === 'overview' && <OverviewPanel result={result} agentStatuses={agentStatuses} isLoading={isLoading} />}
              {activeTab === 'financials' && (isLoading ? <EmptyState /> : <FinancialsPanel result={result} />)}
              {activeTab === 'news' && (isLoading ? <EmptyState /> : <NewsPanel result={result} />)}
              {activeTab === 'risk' && (isLoading ? <EmptyState /> : <RiskPanel result={result} />)}
              {activeTab === 'competitors' && (isLoading ? <EmptyState /> : <CompetitorsPanel result={result} />)}
              {activeTab === 'growth' && (isLoading ? <EmptyState /> : <AIInsightsPanel result={result} />)}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
