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
  const isINR = currency === 'INR' || currency === 'inr'
  const symbol = isINR ? '₹' : '$'
  if (isINR) {
    const abs = Math.abs(num)
    if (abs >= 1e7) return `${symbol}${(num / 1e7).toFixed(2)} Cr`
    if (abs >= 1e5) return `${symbol}${(num / 1e5).toFixed(2)} L`
    return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  } else {
    const abs = Math.abs(num)
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
        <span style={{ fontSize: 20, fontWeight: 500, color: color || 'var(--text-primary)' }}>{grade}</span>
        <span style={{ fontSize: 10, color: trend === 'up' ? 'var(--green)' : trend === 'down' ? 'var(--red)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          {trendIcon}
        </span>
      </div>
    </div>
  )
}

// ─── Pipeline Stepper (fixed: line doesn't go through circles) ─────────────────
function HorizontalAnalysisStepper({ agentStatuses, isLoading }) {
  const steps = [
    { key: 'company', label: 'Macro Scan', desc: 'Industry' },
    { key: 'financials', label: 'Financials', desc: 'Filings' },
    { key: 'news', label: 'Sentiment', desc: 'News' },
    { key: 'risk', label: 'Risk Model', desc: 'Exposure' },
    { key: 'competitors', label: 'Competitors', desc: 'Mkt Share' },
    { key: 'growth', label: 'Growth', desc: 'Intrinsic' },
    { key: 'decision', label: 'AI Synthesis', desc: 'Verdict' },
  ]

  const DOTSIZE = 30

  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="label" style={{ fontSize: 10, letterSpacing: '0.08em' }}>Agent Research Pipeline</span>
        <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: 10, height: 10, borderTopColor: 'var(--accent)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Agents analyzing market disclosures…</span>
            </>
          ) : (
            <span style={{ color: 'var(--green)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>✓</span> Synthesis complete
            </span>
          )}
        </div>
      </div>

      {/* Steps row — connecting line drawn between dots, not through them */}
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', padding: '6px 0', gap: 0 }}>
        {steps.map(({ key, label, desc }, index) => {
          const status = agentStatuses[key] || 'waiting'
          const isDone = status === 'done'
          const isRunning = status === 'running'
          const isError = status === 'error'
          const isLast = index === steps.length - 1

          let circleColor = 'var(--border)'
          let circleBg = 'var(--bg-card)'
          let textColor = 'var(--text-muted)'
          let lineColor = 'var(--border-light)'
          
          if (isDone) {
            circleColor = 'var(--green)'
            circleBg = 'rgba(52,199,113,0.06)'
            textColor = 'var(--text-primary)'
            lineColor = 'var(--green)'
          } else if (isRunning) {
            circleColor = 'var(--accent)'
            circleBg = 'rgba(247,59,32,0.06)'
            textColor = 'var(--accent)'
          } else if (isError) {
            circleColor = 'var(--red)'
            circleBg = 'rgba(251,45,84,0.06)'
            textColor = 'var(--red)'
          }

          return (
            <div key={key} style={{ display: 'flex', flex: 1, alignItems: 'flex-start', minWidth: 0 }}>
              {/* Step item */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', position: 'relative', zIndex: 2 }}>
                {/* Pulse ring for running state */}
                {isRunning && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      width: DOTSIZE + 12,
                      height: DOTSIZE + 12,
                      top: -(6),
                      left: -(6),
                      borderRadius: '50%',
                      border: '1.5px solid var(--accent)',
                      zIndex: 0,
                    }}
                    animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                {/* Circle dot — solid bg so connector line never shows through */}
                <div style={{
                  width: DOTSIZE, height: DOTSIZE,
                  borderRadius: '50%',
                  background: 'var(--bg)',
                  border: `2px solid ${circleColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600,
                  color: isDone ? 'var(--green)' : isRunning ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'all 0.3s ease',
                  position: 'relative', zIndex: 3,
                  flexShrink: 0,
                  boxShadow: isRunning ? '0 0 0 3px rgba(247,59,32,0.08)' : isDone ? '0 0 0 2px rgba(52,199,113,0.08)' : 'none',
                }}>
                  {isDone ? '✓' : isRunning
                    ? <div className="spinner" style={{ width: 10, height: 10, borderTopColor: 'var(--accent)', borderWidth: 1.5 }} />
                    : <span style={{ fontSize: 10 }}>{index + 1}</span>}
                </div>

                {/* Label */}
                <div style={{ fontSize: 10.5, fontWeight: isDone || isRunning ? 500 : 400, color: textColor, marginTop: 8, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {label}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {desc}
                </div>
              </div>

              {/* Connector line — sits at center height of the circle, between dots */}
              {!isLast && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', paddingTop: Math.floor(DOTSIZE / 2) - 1, position: 'relative', zIndex: 0 }}>
                  <div style={{
                    height: 2, width: '100%',
                    background: isDone ? 'var(--green)' : 'var(--border-light)',
                    transition: 'background 0.5s ease',
                    borderRadius: 99,
                  }} />
                </div>
              )}
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
            {typeof entry.value === 'number' && Math.abs(entry.value) > 1e4
              ? fmt(entry.value, currency)
              : entry.value != null ? entry.value?.toLocaleString?.() ?? entry.value : 'N/A'}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Advanced Interactive KPI Card ───────────────────────────────────────────
function KPICard({ label, value, sub, trend, color, sparkData }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        padding: '16px 18px', borderRadius: 16,
        background: hovered ? 'var(--bg-card)' : 'var(--bg-sidebar)',
        border: '1px solid var(--border-light)',
        cursor: 'default', overflow: 'hidden', position: 'relative',
        transition: 'all 0.25s ease',
        boxShadow: hovered ? 'var(--shadow-sm)' : 'none',
      }}
      whileHover={{ y: -2 }}
    >
      {color && (
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 3, height: '100%',
          background: color, borderRadius: '0 16px 16px 0',
        }} />
      )}
      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: color || 'var(--text-primary)', marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>{sub}</div>}
      {sparkData && hovered && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 8 }}>
          <ResponsiveContainer width="100%" height={36}>
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="v" stroke={color || 'var(--accent)'} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </motion.div>
  )
}

function FactorTable({ scores, isLoading, onReviewFactor }) {
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
    { id: 'financial', name: 'Financial Health', desc: 'Debt to equity, free cash flow margins, solvency ratio', val: scores.financial || 82, trend: 'up', driver: 'FCF margin > 22%, robust solvency ratio', weight: '25%' },
    { id: 'growth', name: 'Growth Engine', desc: 'YoY revenue, CapEx efficiency, R&D momentum', val: scores.growth || 74, trend: 'up', driver: 'R&D expansion, strong enterprise subscription pipeline', weight: '20%' },
    { id: 'moat', name: 'Economic Moat', desc: 'Pricing power, brand equity, high customer switching costs', val: scores.moat || 88, trend: 'up', driver: 'High switching costs & proprietary data lock-in', weight: '20%' },
    { id: 'sentiment', name: 'Market Sentiment', desc: 'Institutional flows, analyst consensus, social momentum', val: scores.sentiment || 85, trend: 'up', driver: 'Heavy institutional inflows, positive news flow', weight: '15%' },
    { id: 'valuation', name: 'Valuation Gap', desc: 'P/E vs peer group, price-to-FCF, DCF margin safety', val: scores.valuation || 52, trend: 'down', driver: 'P/E above historical mean, premium multiples', weight: '10%' },
    { id: 'risk', name: 'Risk Exposure', desc: 'Macro exposures, regulatory risks, competitor pressure', val: scores.risk || 32, trend: 'neutral', driver: 'Regulatory headwinds, competitor expansion', weight: '10%', isRisk: true },
  ]

  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '18px 24px 12px', borderBottom: '1px solid var(--border)' }}>
        <span className="label">Core Investment Factors</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 24 }}>Factor</th>
              <th>Rating</th>
              <th>Score</th>
              <th>Trend</th>
              <th>Primary Driver</th>
              <th>Weight</th>
              <th style={{ textAlign: 'right', paddingRight: 24 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {factorData.map(f => {
              const grade = f.isRisk ? riskLabel(100 - f.val) : scoreToGrade(f.val)
              const scoreText = f.isRisk ? `${(10 - f.val / 10).toFixed(1)}/10` : `${f.val}/100`
              const dotColor = f.isRisk
                ? (f.val < 35 ? 'var(--green)' : f.val < 65 ? 'var(--amber)' : 'var(--red)')
                : (f.val >= 75 ? 'var(--green)' : f.val >= 50 ? 'var(--amber)' : 'var(--red)')
              const trendText = f.trend === 'up' ? '▲' : f.trend === 'down' ? '▼' : '●'
              const trendColor = f.trend === 'up' ? 'var(--green)' : f.trend === 'down' ? 'var(--red)' : 'var(--text-muted)'

              return (
                <tr key={f.id}>
                  <td style={{ paddingLeft: 24 }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: 13, marginBottom: 2, fontWeight: 500 }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.desc}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge-dot" style={{ background: dotColor }} />
                      <span style={{ color: dotColor, fontWeight: 600, fontSize: 13 }}>{grade}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 48, height: 4, borderRadius: 99, background: 'var(--border-light)', overflow: 'hidden' }}>
                        <div style={{ width: `${f.isRisk ? 100 - f.val : f.val}%`, height: '100%', background: dotColor, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{scoreText}</span>
                    </div>
                  </td>
                  <td style={{ color: trendColor, fontWeight: 500 }}>{trendText} {f.trend === 'up' ? 'Improving' : f.trend === 'down' ? 'Weakening' : 'Stable'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12, maxWidth: 200 }}>{f.driver}</td>
                  <td><span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{f.weight}</span></td>
                  <td style={{ textAlign: 'right', paddingRight: 24 }}>
                    <button
                      onClick={() => onReviewFactor(f.id)}
                      className="premium-table-btn"
                    >
                      Review →
                    </button>
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
        <div className="skeleton" style={{ height: 280, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />
      </div>
    )
  }

  const decision = result?.decision
  const financials = result?.financials
  const risks = result?.risks
  const currency = financials?.quote?.currency || 'USD'
  const recColor = decision?.recommendation?.includes('BUY') ? 'var(--green)' : decision?.recommendation?.includes('SELL') ? 'var(--red)' : 'var(--amber)'
  const recBg = decision?.recommendation?.includes('BUY') ? 'var(--green-bg)' : decision?.recommendation?.includes('SELL') ? 'var(--red-bg)' : 'var(--amber-bg)'

  const currentPrice = financials?.quote?.regularMarketPrice || 0
  const rawReturn = decision?.recommendation?.includes('BUY') ? 18.4 : decision?.recommendation?.includes('SELL') ? -12.5 : 2.5
  const expectedReturn = decision?.expectedReturn || `${rawReturn > 0 ? '+' : ''}${rawReturn}%`

  let targetPrice = decision?.targetPrice
  if (!targetPrice && currentPrice) {
    const multiplier = decision?.recommendation?.includes('BUY') ? 1.184 : decision?.recommendation?.includes('SELL') ? 0.875 : 1.025
    const rawTarget = currentPrice * multiplier
    targetPrice = currency === 'INR' ? `₹${rawTarget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : `$${rawTarget.toFixed(2)}`
  }
  if (!targetPrice) targetPrice = currency === 'INR' ? '₹4,320' : '$180'
  const riskVal = risks?.overallRisk || 'medium'
  const horizon = decision?.timeHorizon || '12 Months'

  const confidence = decision?.confidence || 76

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Recommendation Card */}
      <div className="card" style={{ padding: '22px 22px', overflow: 'hidden', position: 'relative' }}>
        {/* Accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: recColor, borderRadius: '16px 16px 0 0' }} />
        
        <div className="label" style={{ marginBottom: 8, fontSize: 10 }}>AI Recommendation Verdict</div>
        
        {/* Big rec display */}
        <div style={{ 
          padding: '12px 16px', borderRadius: 12, 
          background: recBg, border: `1px solid ${recColor}30`,
          marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: 28, fontWeight: 600, color: recColor, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            {decision?.recommendation || 'Hold'}
          </span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Confidence</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: recColor }}>{confidence}%</div>
          </div>
        </div>

        {/* Confidence bar */}
        <div style={{ height: 4, borderRadius: 99, background: 'var(--border-light)', overflow: 'hidden', marginBottom: 14 }}>
          <motion.div
            style={{ height: '100%', borderRadius: 99, background: recColor }}
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Expected Return', value: expectedReturn, color: rawReturn >= 0 ? 'var(--green)' : 'var(--red)' },
            { label: 'Target Price', value: targetPrice, color: 'var(--text-primary)' },
            { label: 'Risk Rating', value: riskVal, color: riskVal === 'low' ? 'var(--green)' : riskVal === 'medium' ? 'var(--amber)' : 'var(--red)' },
            { label: 'Horizon', value: horizon, color: 'var(--text-primary)' },
          ].map(item => (
            <div key={item.label} style={{ padding: '10px 12px', background: 'var(--bg-sidebar)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
              <div className="label" style={{ fontSize: 8, marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: item.color, textTransform: 'capitalize' }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="label" style={{ fontSize: 9, marginBottom: 8 }}>Primary Catalysts</div>
          {(decision?.catalysts || ['Robust market share expansion', 'Consistent margin improvements', 'Strong cash flow yields']).slice(0, 3).map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 5 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: recColor, marginTop: 5, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk control card */}
      <div className="card" style={{ padding: '18px 18px', background: 'var(--amber-bg)', border: '1px solid var(--amber-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(247,59,32,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={13} color="var(--amber)" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)' }}>AI-Powered Risk Control</span>
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
          Real-time auditing of regulatory filings, litigation risks, and governance exposures.
        </p>
      </div>

      {/* Help footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '4px 0', opacity: 0.55 }}>
        <HelpCircle size={12} color="var(--text-muted)" />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Analyst Help & Documentation</span>
      </div>
    </div>
  )
}

// ─── OVERVIEW PANEL ────────────────────────────────────────────────────────────
function OverviewPanel({ result, agentStatuses, isLoading, onReviewFactor }) {
  const decision = result?.decision
  const financials = result?.financials
  const news = result?.news
  const scores = decision?.scores || {}
  const currency = financials?.quote?.currency || 'USD'

  const [timeframe, setTimeframe] = useState('3Y')

  const fullRevenueData = financials?.revenueData?.map(d => ({
    year: String(d.year),
    Revenue: d.revenue,
    'Net Income': d.netIncome,
  })) || []

  // FIX: 1Y = last 2 points, 3Y = last 4 points, Max = all
  let revenueData = fullRevenueData
  if (timeframe === '1Y') {
    revenueData = fullRevenueData.slice(-2)
  } else if (timeframe === '3Y') {
    revenueData = fullRevenueData.slice(-4)
  }
  // Max = all data (no slice needed)

  // Quick KPI summary cards
  const kpiCards = [
    { 
      label: 'Revenue', 
      value: fmt(financials?.revenue, currency),
      sub: financials?.revenueGrowth ? `${financials.revenueGrowth > 0 ? '+' : ''}${financials.revenueGrowth.toFixed(1)}% YoY` : null,
      color: 'var(--accent)',
      trend: financials?.revenueGrowth > 0 ? 'up' : 'down',
    },
    { 
      label: 'EBITDA', 
      value: fmt(financials?.ebitda, currency),
      sub: financials?.grossMargin ? `${financials.grossMargin.toFixed(1)}% Gross Margin` : null,
      color: 'var(--blue)',
    },
    { 
      label: 'Net Income', 
      value: fmt(financials?.netIncome, currency),
      sub: financials?.netMargin ? `${financials.netMargin.toFixed(1)}% Net Margin` : null,
      color: 'var(--green)',
    },
    { 
      label: 'Free Cash Flow', 
      value: fmt(financials?.freeCashFlow, currency),
      sub: financials?.returnOnEquity ? `ROE: ${financials.returnOnEquity.toFixed(1)}%` : null,
      color: financials?.freeCashFlow > 0 ? 'var(--green)' : 'var(--red)',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {/* 1. Analysis Pipeline */}
      <HorizontalAnalysisStepper agentStatuses={agentStatuses} isLoading={isLoading} />

      {/* 2. KPI Row */}
      {!isLoading && financials && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {kpiCards.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <KPICard {...kpi} />
            </motion.div>
          ))}
        </div>
      )}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
        </div>
      )}

      {/* 3. Core Factors Table */}
      <FactorTable scores={scores} isLoading={isLoading} onReviewFactor={onReviewFactor} />

      {/* 4. Bottom Grid: Chart + News */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
        {/* Revenue Chart */}
        <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="label">Revenue & Income Trends</div>
            <div style={{ display: 'flex', gap: 3, background: 'var(--bg-tag)', padding: 3, borderRadius: 99 }}>
              {['1Y', '3Y', 'Max'].map(p => (
                <button
                  key={p}
                  onClick={() => setTimeframe(p)}
                  style={{
                    padding: '3px 10px', borderRadius: 99, border: 'none',
                    background: p === timeframe ? 'var(--bg-card)' : 'transparent',
                    color: p === timeframe ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: 10.5, fontWeight: p === timeframe ? 600 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: p === timeframe ? 'var(--shadow-sm)' : 'none',
                    fontFamily: 'var(--font-sequel-sans)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="skeleton" style={{ height: 150 }} />
          ) : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => fmt(v, currency)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={54} />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Area type="monotone" dataKey="Revenue" stroke="var(--accent)" strokeWidth={2} fill="url(#revGrad)" dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }} />
                <Area type="monotone" dataKey="Net Income" stroke="var(--green)" strokeWidth={2} fill="url(#incGrad)" strokeDasharray="5 3" dot={{ r: 3, fill: 'var(--green)', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No financial data available
            </div>
          )}

          {/* Chart legend */}
          {!isLoading && revenueData.length > 0 && (
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              {[
                { label: 'Revenue', color: 'var(--accent)' },
                { label: 'Net Income', color: 'var(--green)', dashed: true },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ 
                    width: l.dashed ? 18 : 12, height: 2, 
                    background: l.color, 
                    borderRadius: 99,
                    borderTop: l.dashed ? `2px dashed ${l.color}` : undefined,
                    background: l.dashed ? 'transparent' : l.color,
                  }} />
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* News Signals */}
        <div className="card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Newspaper size={12} color="var(--text-secondary)" />
            <span className="label">Signals & News</span>
          </div>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
            </div>
          ) : news?.articles?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
              {news.articles.slice(0, 3).map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ 
                    paddingBottom: i < 2 ? 10 : 0, 
                    borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 99, fontSize: 9, fontWeight: 600,
                      background: a.sentiment === 'positive' ? 'var(--green-bg)' : a.sentiment === 'negative' ? 'var(--red-bg)' : 'var(--amber-bg)',
                      color: a.sentiment === 'positive' ? 'var(--green)' : a.sentiment === 'negative' ? 'var(--red)' : 'var(--amber)',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {a.sentiment}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.date?.slice(0, 7) || ''}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 2, fontWeight: 500 }}>{a.headline}</p>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.source}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No signals recorded</div>
          )}
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
            <span style={{ fontSize: 24, fontWeight: 600, color: f.healthScore >= 75 ? 'var(--green)' : f.healthScore >= 50 ? 'var(--amber)' : 'var(--red)' }}>{f.healthGrade}</span>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 3 }}>Financial Health — {f.healthScore}/100</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.healthReason}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {metrics.map(({ label, value, positive }) => (
            <div key={label} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: positive === true ? 'var(--green)' : positive === false ? 'var(--red)' : 'var(--text-primary)' }}>{value}</div>
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
              <Bar dataKey="Revenue" fill="var(--blue)" radius={[4,4,0,0]} opacity={0.8} />
              <Bar dataKey="Gross Profit" fill="var(--accent)" radius={[4,4,0,0]} opacity={0.65} />
              <Bar dataKey="Net Income" fill="var(--green)" radius={[4,4,0,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: '18px 22px' }}>
          <div className="label" style={{ marginBottom: 14 }}>EPS Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={f.revenueData?.map(d => ({ year: String(d.year), EPS: d.eps })) || []} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="epsG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => currency === 'INR' ? `₹${v.toFixed(1)}` : `$${v.toFixed(1)}`} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Area type="monotone" dataKey="EPS" stroke="var(--accent)" strokeWidth={2} fill="url(#epsG)" dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }} />
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
      <div className="card" style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
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
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {decision && (
          <div className="card" style={{ padding: '20px 24px' }}>
            <div className="label" style={{ marginBottom: 14 }}>AI Factor Scores</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 16 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
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
      
      {/* ─── TOP HEADER ─────────────────────────────────────────────────────── */}
      <header style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
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
        <div style={{ display: 'flex', gap: 2, alignItems: 'center', background: 'var(--bg-tag)', padding: '4px', borderRadius: 99, border: '1px solid var(--border-light)' }}>
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
        <main style={{ flex: 1, padding: '28px 24px', display: 'flex', gap: 28, maxWidth: 1480, margin: '0 auto', width: '100%' }}>
          
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
          <div style={{ width: 308, display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0, position: 'sticky', top: 'calc(var(--header-height) + 24px)', height: 'fit-content' }}>
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
