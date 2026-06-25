import { useState } from 'react'
import { motion } from 'framer-motion'
import { Newspaper } from 'lucide-react'
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import HorizontalAnalysisStepper from './HorizontalAnalysisStepper.js'
import KPICard from './KPICard.js'
import FactorTable from './FactorTable.js'

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

export default function OverviewPanel({ result, agentStatuses, isLoading, onReviewFactor }) {
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

  let revenueData = fullRevenueData
  if (timeframe === '1Y') {
    revenueData = fullRevenueData.slice(-2)
  } else if (timeframe === '3Y') {
    revenueData = fullRevenueData.slice(-4)
  }

  const kpiCards = [
    { 
      label: 'Revenue', 
      value: fmt(financials?.totalRevenue || financials?.revenue, currency),
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
        <div className="kpi-grid">
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
        <div className="kpi-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
        </div>
      )}

      {/* 3. Core Factors Table */}
      <FactorTable scores={scores} isLoading={isLoading} onReviewFactor={onReviewFactor} />

      {/* 4. Bottom Grid: Chart + News */}
      <div className="bottom-grid">
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
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
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
