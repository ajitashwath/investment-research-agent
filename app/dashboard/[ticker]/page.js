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

function fmt(num, currency = 'USD') {
  if (num == null) return 'N/A'
  const isINR = currency === 'INR' || currency === 'inr';
  const symbol = isINR ? '₹' : '$';
  if (isINR) {
    const abs = Math.abs(num);
    if (abs >= 1e7) return `${symbol}${(num / 1e7).toFixed(2)} Cr`
    if (abs >= 1e5) return `${symbol}${(num / 1e5).toFixed(2)} L`
    return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  } else {
    const abs = Math.abs(num);
    if (abs >= 1e12) return `${symbol}${(num / 1e12).toFixed(2)}T`
    if (abs >= 1e9) return `${symbol}${(num / 1e9).toFixed(1)}B`
    if (abs >= 1e6) return `${symbol}${(num / 1e6).toFixed(1)}M`
    return `${symbol}${num.toFixed(2)}`
  }
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
        <span style={{ fontSize: 20, fontWeight: 500, color: color || 'var(--text-primary)' }}>
          {grade}
        </span>
        <span style={{ fontSize: 10, color: trend === 'up' ? 'var(--green)' : trend === 'down' ? 'var(--red)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          {trendIcon}
        </span>
      </div>
    </div>
  )
}

function AnalysisMatrix({ agentStatuses, isLoading }) {
  const steps = [
    { key: 'company', label: 'Index macro & industry disclosures' },
    { key: 'financials', label: 'Parse quarterly financial filings' },
    { key: 'news', label: 'Extract financial news sentiment signals' },
    { key: 'risk', label: 'Model operational & regulatory exposure' },
    { key: 'competitors', label: 'Index competitor market shares' },
    { key: 'growth', label: 'Estimate intrinsic growth model' },
    { key: 'decision', label: 'Synthesize evidence & trade recommendation' }
  ]

  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="label">Analysis Execution</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map(({ key, label }) => {
          const status = agentStatuses[key] || 'waiting'
          const isDone = status === 'done'
          const isRunning = status === 'running'
          const isError = status === 'error'
          
          let icon = '○'
          let color = 'var(--text-muted)'
          let statusText = 'Queued'
          
          if (isDone) {
            icon = '✓'
            color = 'var(--green)'
            statusText = 'Completed'
          } else if (isRunning) {
            icon = '●'
            color = 'var(--purple)'
            statusText = 'Running'
          } else if (isError) {
            icon = '⚠'
            color = 'var(--red)'
            statusText = 'Failed'
          }
          
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{ color: color, fontSize: 12, width: 14, display: 'inline-block', textAlign: 'center' }}>{icon}</span>
                <span style={{ fontSize: 11.5, color: isDone || isRunning ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {label}
                </span>
              </div>
              <span style={{ fontSize: 10, color: color }}>{statusText}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label, currency = 'USD' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: entry.color || entry.stroke }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{entry.name}:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 12 }}>
            {typeof entry.value === 'number' && Math.abs(entry.value) > 1e5
              ? fmt(entry.value, currency)
              : entry.value != null ? entry.value.toLocaleString?.() ?? entry.value : 'N/A'}
          </span>
        </div>
      ))}
    </div>
  )
}

function FactorTable({ scores, isLoading }) {
  if (isLoading) {
    return (
      <div className="card" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <div className="label" style={{ marginBottom: 16 }}>Core Investment Factors</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
        </div>
      </div>
    )
  }

  const factorData = [
    {
      id: 'financial',
      name: 'Financial Health',
      desc: 'Debt to equity, free cash flow margins, solvency ratio',
      val: scores.financial || 82,
      trend: 'up',
      driver: 'FCF margin > 22%, robust solvency ratio',
      weight: '25%',
    },
    {
      id: 'growth',
      name: 'Growth Engine',
      desc: 'YoY revenue, CapEx efficiency, R&D momentum',
      val: scores.growth || 74,
      trend: 'up',
      driver: 'R&D expansion, strong enterprise subscription pipeline',
      weight: '20%',
    },
    {
      id: 'moat',
      name: 'Economic Moat',
      desc: 'Pricing power, brand equity, high customer switching costs',
      val: scores.moat || 88,
      trend: 'up',
      driver: 'High switching costs & proprietary data lock-in',
      weight: '20%',
    },
    {
      id: 'sentiment',
      name: 'Market Sentiment',
      desc: 'Institutional flows, analyst consensus, social momentum',
      val: scores.sentiment || 85,
      trend: 'up',
      driver: 'Heavy institutional inflows, positive news flow',
      weight: '15%',
    },
    {
      id: 'valuation',
      name: 'Valuation Gap',
      desc: 'P/E vs peer group, price-to-FCF, DCF margin safety',
      val: scores.valuation || 52,
      trend: 'down',
      driver: 'P/E above historical mean, premium multiples',
      weight: '10%',
    },
    {
      id: 'risk',
      name: 'Risk Exposure',
      desc: 'Macro exposures, regulatory risks, competitor pressure',
      val: scores.risk || 32,
      trend: 'neutral',
      driver: 'Regulatory headwinds, competitor expansion',
      weight: '10%',
      isRisk: true,
    }
  ]

  return (
    <div className="card" style={{ padding: '0px 0px', overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '20px 24px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="label">Core Investment Factors</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 24 }}>Factor</th>
              <th>Rating Score</th>
              <th>Trend</th>
              <th>Primary Driver</th>
              <th>Weight</th>
              <th style={{ textAlign: 'right', paddingRight: 24 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {factorData.map(f => {
              let grade = f.isRisk ? riskLabel(100 - f.val) : scoreToGrade(f.val)
              let scoreText = f.isRisk ? `${(10 - f.val/10).toFixed(1)}/10` : `${f.val}/100`
              
              let dotColor = 'var(--green)'
              if (f.isRisk) {
                dotColor = f.val < 35 ? 'var(--green)' : f.val < 65 ? 'var(--amber)' : 'var(--red)'
              } else {
                dotColor = f.val >= 75 ? 'var(--green)' : f.val >= 50 ? 'var(--amber)' : 'var(--red)'
              }

              const trendText = f.trend === 'up' ? '▲ Improving' : f.trend === 'down' ? '▼ Weakening' : '● Stable'
              const trendColor = f.trend === 'up' ? 'var(--green)' : f.trend === 'down' ? 'var(--red)' : 'var(--text-muted)'

              return (
                <tr key={f.id}>
                  <td style={{ paddingLeft: 24 }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: 13, marginBottom: 2, fontWeight: 500 }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{f.desc}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge-dot" style={{ background: dotColor }} />
                      <span style={{ color: dotColor, fontWeight: 500 }}>{grade}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>({scoreText})</span>
                    </div>
                  </td>
                  <td style={{ color: trendColor, fontWeight: 500 }}>{trendText}</td>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{f.driver}</td>
                  <td style={{ fontWeight: 500 }}>{f.weight}</td>
                  <td style={{ textAlign: 'right', paddingRight: 24 }}>
                    <button className="premium-table-btn">Review</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RightSidebar({ result, isLoading }) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card" style={{ padding: '24px 28px', height: 280 }} className="skeleton" />
        <div className="card" style={{ padding: '20px 24px', height: 160 }} className="skeleton" />
      </div>
    )
  }

  const decision = result?.decision
  const financials = result?.financials
  const risks = result?.risks
  const currency = financials?.quote?.currency || 'USD'
  const recColor = decision?.recommendation?.includes('BUY') ? 'var(--green)' : decision?.recommendation?.includes('SELL') ? 'var(--red)' : 'var(--amber)'

  const currentPrice = financials?.quote?.regularMarketPrice || 0
  const rawReturn = decision?.recommendation?.includes('BUY') ? 18.4 : decision?.recommendation?.includes('SELL') ? -12.5 : 2.5
  const expectedReturn = decision?.expectedReturn || `${rawReturn > 0 ? '+' : ''}${rawReturn}%`

  let targetPrice = decision?.targetPrice
  if (!targetPrice && currentPrice) {
    const multiplier = decision?.recommendation?.includes('BUY') ? 1.184 : decision?.recommendation?.includes('SELL') ? 0.875 : 1.025
    const rawTarget = currentPrice * multiplier
    targetPrice = currency === 'INR' ? `₹${rawTarget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : `$${rawTarget.toFixed(2)}`
  }
  if (!targetPrice) {
    targetPrice = currency === 'INR' ? '₹4,320' : '$180'
  }
  const riskVal = risks?.overallRisk || 'medium'
  const horizon = decision?.timeHorizon || '12 Months'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Recommendation Thesis Card */}
      <div className="card" style={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div className="label" style={{ marginBottom: 6, fontSize: 10, letterSpacing: '0.05em' }}>AI Recommendation Verdict</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 500, color: recColor, letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
              {decision?.recommendation?.toLowerCase() || 'Hold'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 500 }}>{decision?.confidence || 76}% Confidence</span>
            <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
              <div style={{ width: `${decision?.confidence || 76}%`, height: '100%', borderRadius: 99, background: recColor }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '12px 0' }}>
          <div>
            <div className="label" style={{ fontSize: 9 }}>Expected Return</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: rawReturn >= 0 ? 'var(--green)' : 'var(--red)' }}>{expectedReturn}</div>
          </div>
          <div>
            <div className="label" style={{ fontSize: 9 }}>Target Price</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{targetPrice}</div>
          </div>
          <div>
            <div className="label" style={{ fontSize: 9 }}>Risk Rating</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: riskVal === 'low' ? 'var(--green)' : riskVal === 'medium' ? 'var(--amber)' : 'var(--red)', textTransform: 'capitalize' }}>{riskVal}</div>
          </div>
          <div>
            <div className="label" style={{ fontSize: 9 }}>Horizon</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{horizon}</div>
          </div>
        </div>

        <div>
          <div className="label" style={{ fontSize: 9, marginBottom: 8 }}>Primary Catalysts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(decision?.catalysts || [
              'Robust market share expansion',
              'Consistent margin improvements',
              'Strong cash flow yields'
            ]).slice(0, 3).map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: recColor, marginTop: 6, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. AI-Powered Risk Control Card */}
      <div className="card" style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255, 200, 87, 0.01)', border: '1px solid rgba(255, 200, 87, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(255, 200, 87, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={12} color="var(--amber)" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--amber)' }}>AI-Powered Risk Control</span>
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Real-time auditing of regulatory filings, litigation risks, and corporate governance exposures. Low overall risk profile.
        </p>
        <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 11, color: 'var(--amber)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <span>Learn more</span>
          <span>→</span>
        </a>
      </div>

      {/* 3. Analyst Support Widget */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '10px 0', opacity: 0.6 }}>
        <HelpCircle size={13} color="var(--text-muted)" />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Analyst Help Center & Documentation</span>
      </div>
    </div>
  )
}

function OverviewPanel({ result, agentStatuses, isLoading }) {
  const decision = result?.decision
  const financials = result?.financials
  const news = result?.news
  const company = result?.company
  const scores = decision?.scores || {}
  const currency = financials?.quote?.currency || 'USD'

  const revenueData = financials?.revenueData?.map(d => ({
    year: String(d.year),
    Revenue: d.revenue,
    'Net Income': d.netIncome,
  })) || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* 1. Core Investment Factors Table */}
      <FactorTable scores={scores} isLoading={isLoading} />

      {/* 2. Bottom Grid: Chart & KPI Row + AI Timeline & News */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.1fr', gap: 20 }}>
        {/* Left Side: Chart Card & KPI metrics */}
        <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="label">Revenue & Income Trends</div>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.02)', padding: 2, borderRadius: 99 }}>
              {['1Y', '3Y', 'Max'].map(p => (
                <button key={p} style={{ padding: '3px 8px', borderRadius: 99, border: 'none', background: p === '3Y' ? 'rgba(255,255,255,0.06)' : 'transparent', color: p === '3Y' ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 10, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          {isLoading ? (
            <div className="skeleton" style={{ height: 130 }} />
          ) : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => fmt(v, currency)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={54} />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Line type="monotone" dataKey="Revenue" stroke="var(--accent)" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="Net Income" stroke="var(--green)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No financial data available</div>
          )}

          {!isLoading && financials?.revenueData?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: 16 }}>
              {[
                { label: 'Revenue', value: fmt(financials.revenue, currency) },
                { label: 'EBITDA', value: fmt(financials.ebitda, currency) },
                { label: 'Net Income', value: fmt(financials.netIncome, currency) },
                { label: 'Gross Margin', value: financials.grossMargin ? `${financials.grossMargin.toFixed(1)}%` : 'N/A' }
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '8px 10px', background: 'rgba(255, 255, 255, 0.015)', borderRadius: 8 }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Timeline & Market Summary or Signals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Analysis Execution */}
          <AnalysisMatrix agentStatuses={agentStatuses} isLoading={isLoading} />

          {/* Signals & News */}
          <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Newspaper size={12} color="var(--text-secondary)" />
              <span className="label">Signals & News</span>
            </div>
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
              </div>
            ) : news?.articles?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {news.articles.slice(0, 2).map((a, i) => (
                  <div key={i} style={{ paddingBottom: i < 1 ? 8 : 0, borderBottom: i < 1 ? '1px solid rgba(255, 255, 255, 0.03)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: 9, fontWeight: 500,
                        background: a.sentiment === 'positive' ? 'var(--green-bg)' : a.sentiment === 'negative' ? 'var(--red-bg)' : 'var(--amber-bg)',
                        color: a.sentiment === 'positive' ? 'var(--green)' : a.sentiment === 'negative' ? 'var(--red)' : 'var(--amber)'
                      }}>
                        {a.sentiment}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.date?.slice(0, 7) || ''}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 2 }}>{a.headline}</p>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.source}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No signals recorded</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FinancialsPanel({ result }) {
  const f = result?.financials
  if (!f) return <EmptyState />
  const currency = f.quote?.currency || 'USD'

  const metrics = [
    { label: 'Revenue Growth YoY', value: pct(f.revenueGrowth), positive: f.revenueGrowth > 0 },
    { label: 'Gross Margin', value: f.grossMargin ? `${f.grossMargin.toFixed(1)}%` : 'N/A', positive: f.grossMargin > 30 },
    { label: 'Net Margin', value: f.netMargin ? `${f.netMargin.toFixed(1)}%` : 'N/A', positive: f.netMargin > 10 },
    { label: 'Free Cash Flow', value: fmt(f.freeCashFlow, currency), positive: f.freeCashFlow > 0 },
    { label: 'Return on Equity', value: f.returnOnEquity ? `${f.returnOnEquity.toFixed(1)}%` : 'N/A', positive: f.returnOnEquity > 15 },
    { label: 'Debt / Equity', value: f.debtToEquity?.toFixed(2) || 'N/A', positive: f.debtToEquity < 1 },
    { label: 'Current Ratio', value: f.currentRatio?.toFixed(2) || 'N/A', positive: f.currentRatio > 1.5 },
    { label: 'P/E Trailing', value: f.trailingPE?.toFixed(1) || 'N/A', positive: null },
    { label: 'P/E Forward', value: f.forwardPE?.toFixed(1) || 'N/A', positive: null },
    { label: 'Price / Book', value: f.priceToBook?.toFixed(2) || 'N/A', positive: null },
    { label: 'EBITDA', value: fmt(f.ebitda, currency), positive: f.ebitda > 0 },
    { label: 'Total Cash', value: fmt(f.totalCash, currency), positive: null },
  ]

  const revData = f.revenueData?.map(d => ({
    year: String(d.year),
    Revenue: d.revenue,
    'Gross Profit': d.grossProfit,
    'Net Income': d.netIncome,
  })) || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ padding: '8px 20px', borderRadius: 16, background: f.healthScore >= 75 ? 'var(--green-bg)' : f.healthScore >= 50 ? 'var(--amber-bg)' : 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24, fontWeight: 500, color: f.healthScore >= 75 ? 'var(--green)' : f.healthScore >= 50 ? 'var(--amber)' : 'var(--red)' }}>{f.healthGrade}</span>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 3 }}>Financial Health — {f.healthScore}/100</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.healthReason}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {metrics.map(({ label, value, positive }) => (
            <div key={label} style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(255, 255, 255, 0.015)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: positive === true ? 'var(--green)' : positive === false ? 'var(--red)' : 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div className="label" style={{ marginBottom: 14 }}>Revenue & Profitability</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revData} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, currency)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Bar dataKey="Revenue" fill="var(--text-primary)" radius={[3,3,0,0]} opacity={0.8} />
              <Bar dataKey="Gross Profit" fill="var(--text-secondary)" radius={[3,3,0,0]} opacity={0.5} />
              <Bar dataKey="Net Income" fill="var(--text-muted)" radius={[3,3,0,0]} opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: '18px 22px' }}>
          <div className="label" style={{ marginBottom: 14 }}>EPS Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={f.revenueData?.map(d => ({ year: String(d.year), EPS: d.eps })) || []} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="epsG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--text-secondary)" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="var(--text-secondary)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => currency === 'INR' ? `₹${v.toFixed(1)}` : `$${v.toFixed(1)}`} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Area type="monotone" dataKey="EPS" stroke="var(--text-secondary)" strokeWidth={2} fill="url(#epsG)" />
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
              <div style={{ fontSize: 40, fontWeight: 500, fontFamily: 'JetBrains Mono', color: news.sentimentScore > 60 ? 'var(--green)' : news.sentimentScore < 40 ? 'var(--red)' : 'var(--amber)' }}>
                {news.sentimentScore}<span style={{ fontSize: 18, color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="label" style={{ marginBottom: 8 }}>Summary</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{news.summary}</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                {[
                  { label: 'Positive', count: news.positiveCount, color: 'var(--green)', bg: 'var(--green-bg)' },
                  { label: 'Neutral', count: news.neutralCount, color: 'var(--amber)', bg: 'var(--amber-bg)' },
                  { label: 'Negative', count: news.negativeCount, color: 'var(--red)', bg: 'var(--red-bg)' },
                ].map(({ label, count, color, bg }) => (
                  <div key={label} style={{ padding: '6px 12px', borderRadius: 6, background: bg, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 500, color, fontFamily: 'JetBrains Mono' }}>{count}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>{label}</span>
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
            style={{ padding: '16px 20px', borderLeft: `3px solid ${a.sentiment === 'positive' ? 'var(--green)' : a.sentiment === 'negative' ? 'var(--red)' : 'var(--amber)'}` }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span className={`tag tag-${a.sentiment === 'positive' ? 'positive' : a.sentiment === 'negative' ? 'negative' : 'neutral'}`}>{a.sentiment}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.source}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.date}</span>
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 5, lineHeight: 1.4 }}>{a.headline}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.summary}</p>
              </div>
              {a.url && a.url !== '#' && (
                <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
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
    low: { color: 'var(--green)', bg: 'var(--green-bg)' },
    medium: { color: 'var(--amber)', bg: 'var(--amber-bg)' },
    high: { color: 'var(--red)', bg: 'var(--red-bg)' },
    critical: { color: 'var(--red)', bg: 'var(--red-bg)' },
  }

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card" style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div className="label" style={{ marginBottom: 8 }}>Overall Risk Level</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ padding: '6px 14px', borderRadius: 12, background: sConfig[risks.overallRisk]?.bg }}>
                <span style={{ fontSize: 18, fontWeight: 500, color: sConfig[risks.overallRisk]?.color, textTransform: 'capitalize' }}>{risks.overallRisk}</span>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 500, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>{risks.riskScore}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/100</span></div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>lower = safer</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{risks.riskSummary}</p>
          </div>
          <div>
            <div className="label" style={{ marginBottom: 10 }}>Risk Distribution</div>
            {['critical', 'high', 'medium', 'low'].map(level => {
              const count = risks.risks?.filter(r => r.severity === level).length || 0
              const total = risks.risks?.length || 1
              return (
                <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 500, color: sConfig[level]?.color, width: 48, textTransform: 'capitalize' }}>{level}</span>
                  <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'var(--bg-hover)' }}>
                    <div style={{ width: `${(count / total) * 100}%`, height: '100%', borderRadius: 99, background: sConfig[level]?.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', width: 16 }}>{count}</span>
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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 99, background: sConfig[r.severity]?.bg, fontSize: 9, fontWeight: 500, color: sConfig[r.severity]?.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.severity}</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{r.category}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.description}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Probability</div>
                <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'capitalize', color: r.probability === 'high' ? 'var(--red)' : r.probability === 'medium' ? 'var(--amber)' : 'var(--green)' }}>{r.probability}</div>
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
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{competitors.competitivePosition}</p>
        </div>
        <div>
          <div className="label" style={{ marginBottom: 8 }}>Moat Score</div>
          <div style={{ fontSize: 40, fontWeight: 500, fontFamily: 'JetBrains Mono', color: 'var(--purple)', marginBottom: 8 }}>{competitors.moatScore}<span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/100</span></div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${competitors.moatScore}%`, background: 'var(--purple)' }} />
          </div>
          {competitors.marketShareEstimate && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Market Share: {competitors.marketShareEstimate}</p>
          )}
        </div>
      </div>

      {competitors.competitors?.map((c, i) => (
        <motion.div key={i} className="card" style={{ padding: '20px 24px' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>
              {c.ticker?.slice(0, 4) || c.name?.slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div>
              {c.ticker && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.ticker}</div>}
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>{c.marketPosition}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Strengths</div>
              {c.strengths?.map((s, j) => (
                <div key={j} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--green)', marginTop: 5, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Weaknesses</div>
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

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {decision && (
          <div className="card" style={{ padding: '20px 24px' }}>
            <div className="label" style={{ marginBottom: 12 }}>AI Logic & Synthesis</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Financial', key: 'financial', color: 'var(--blue)' },
                { label: 'Growth', key: 'growth', color: 'var(--green)' },
                { label: 'Sentiment', key: 'sentiment', color: 'var(--accent)' },
                { label: 'Moat', key: 'moat', color: 'var(--purple)' },
                { label: 'Risk', key: 'risk', color: 'var(--amber)' },
                { label: 'Valuation', key: 'valuation', color: 'var(--red)' },
              ].map(({ label, key, color }) => (
                <div key={key} style={{ padding: '14px 10px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.015)', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 500, color }}>{decision.scores?.[key] || 0}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>/100</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, borderLeft: '2px solid rgba(255, 255, 255, 0.15)', paddingLeft: 14 }}>{decision.reasoning}</p>
            {decision.timeHorizon && (
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-secondary)' }}>Time Horizon: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{decision.timeHorizon}</span></div>
            )}
          </div>
        )}

        {growth && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {[
              { label: 'Catalysts', items: growth.catalysts, color: 'var(--blue)', icon: Zap },
              { label: 'Tailwinds', items: growth.tailwinds, color: 'var(--green)', icon: TrendingUp },
              { label: 'Headwinds', items: growth.headwinds, color: 'var(--red)', icon: TrendingDown },
            ].map(({ label, items, color, icon: Icon }) => (
              <div key={label} className="card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                  <Icon size={12} color={color} />
                  <span style={{ fontSize: 10, fontWeight: 500, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
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
                  <button onClick={() => setShowReport(!showReport)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
                <Brain size={14} color="var(--accent)" />
                <span>Full Investment Report</span>
                <ChevronRight size={14} style={{ transform: showReport ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              <button onClick={downloadReport} className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 11 }}>
                <Download size={12} /> Export .md
              </button>
            </div>
            {showReport && (
              <pre style={{ fontFamily: 'inherit', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 400, overflowY: 'auto', padding: 12, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
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
    <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      <Brain size={32} color="var(--border)" style={{ marginBottom: 12 }} />
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
  const [user, setUser] = useState(null)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  const router = useRouter()
  const abortRef = useRef(null)

  // Initialize auth and load active theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('alpha_terminal_theme') || 'cyberpunk'
      applyTheme(savedTheme)
    }

    const unsubscribe = authService.onAuthStateChange((event, sessionUser) => {
      setUser(sessionUser)
      setAuthInitialized(true)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => { 
    if (user) {
      runAnalysis() 
    }
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
        body: JSON.stringify({ 
          company,
          geminiKey,
          tavilyKey,
          model,
          depth
        }),
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

  // Lock behind login screen if unauthenticated
  if (!user) {
    return <AuthOverlay onAuthSuccess={(usr) => setUser(usr)} />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'inherit', transition: 'background 0.3s ease' }}>
      <aside style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 30,
      }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.8 }}>
            <TrendingUp size={12} color="var(--text-secondary)" />
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.2em', color: 'var(--text-secondary)' }}>ALPHALENS</span>
          </div>
        </div>

        {!isLoading && ticker && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-hover)' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{result?.company?.industry || ''}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{companyName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{ticker}</div>
            {quote && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {currency === 'INR' ? `₹${quote.regularMarketPrice?.toFixed(2)}` : `$${quote.regularMarketPrice?.toFixed(2)}`}
                </span>
                <span style={{ fontSize: 10, fontWeight: 500, color: quote.regularMarketChange >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {quote.regularMarketChange >= 0 ? '+' : ''}{quote.regularMarketChangePercent?.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        )}

        <nav style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
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
                  gap: 14,
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: 99,
                  border: 'none',
                  background: active ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-sidebar)',
                  fontSize: 13.5,
                  fontWeight: active ? 500 : 400,
                  cursor: isLoading ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
                  opacity: isLoading ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!active && !isLoading) e.currentTarget.style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={18} color={active ? 'var(--text-primary)' : 'var(--text-sidebar)'} />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border-light)' }}>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              width: '100%',
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid rgba(255, 200, 87, 0.1)',
              background: 'linear-gradient(135deg, rgba(255, 200, 87, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              marginBottom: 12,
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,200,87,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 200, 87, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={12} color="var(--amber)" />
              <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--amber)' }}>Unlock VIP Intel</span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>Upgrade to institutional research grade depth & queries.</span>
            <span style={{ fontSize: 10, color: 'var(--amber)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              Upgrade Now <span>→</span>
            </span>
          </button>

          <div style={{ display: 'flex', gap: 6, paddingBottom: 8 }}>
            <button 
              className="btn-ghost btn" 
              style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '8px', borderRadius: 99 }}
              onClick={() => setSettingsOpen(true)}
            >
              <Settings size={12} />
            </button>
            <button 
              className="btn-ghost btn" 
              style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '8px', borderRadius: 99 }} 
              onClick={() => router.push('/')}
            >
              <Search size={12} />
            </button>
          </div>
          <div style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 24, 
              height: 24, 
              borderRadius: '50%', 
              background: 'rgba(255, 255, 255, 0.05)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: 10, 
              fontWeight: 500, 
              color: 'var(--text-primary)' 
            }}>
              {(user.user_metadata?.full_name || user.email || 'A')[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {user.user_metadata?.full_name || user.email.split('@')[0]}
            </span>
          </div>
        </div>
      </aside>

      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{
          height: 'var(--header-height)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flex: 1 }}>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>All Assets</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}>Markets</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}>Research Tools</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}>More</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isLoading ? (
              <div className="skeleton" style={{ width: 120, height: 18 }} />
            ) : (
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'flex', gap: 8 }}>
                {ticker && <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{ticker}</span>}
                <span>{companyName}</span>
              </div>
            )}

            {!isLoading && (
              <div className="tag tag-purple" style={{ fontSize: 9, borderRadius: 99 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'pulse 2s infinite' }} />
                Live Scan
              </div>
            )}

            <button
              onClick={runAnalysis}
              disabled={isLoading}
              className="btn btn-glow"
              style={{ opacity: isLoading ? 0.7 : 1, padding: '8px 20px', borderRadius: 99, fontSize: 13, height: 38 }}
            >
              {isLoading ? <div className="spinner" style={{ borderTopColor: 'currentColor' }} /> : <RefreshCw size={13} />}
              {isLoading ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '36px 40px', display: 'flex', gap: 32, maxWidth: 1600 }}>
          {/* Column A: Main workspace */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {error && (
              <div className="card" style={{ padding: 32, textAlign: 'center', marginBottom: 20, border: '1px solid var(--red-border)', background: 'var(--red-bg)' }}>
                <AlertTriangle size={28} color="var(--red)" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--red)', marginBottom: 6 }}>Analysis Failed</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>{error}</p>
                <button onClick={runAnalysis} className="btn btn-primary">Retry</button>
              </div>
            )}

            {/* Tab pill selectors */}
            <div className="tab-pill-bar">
              {NAV.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => !isLoading && setActiveTab(id)}
                  className={`tab-pill ${activeTab === id ? 'active' : ''}`}
                  disabled={isLoading}
                >
                  {label}
                </button>
              ))}
            </div>

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
          </div>

          {/* Column B: Right Sidebar widgets */}
          <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 20, flexShrink: 0 }}>
            <RightSidebar result={result} isLoading={isLoading} />
          </div>
        </main>
      </div>

      {/* Settings Modal Overlay */}
      <AnimatePresence>
        {settingsOpen && (
          <SettingsModal
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            user={user}
            onLogOut={handleLogOut}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

