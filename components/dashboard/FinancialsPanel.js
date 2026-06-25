import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'

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

function EmptyState() {
  return (
    <div className="card" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 280 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>📊</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>No Analysis Data available</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>
        Run a company scan using the terminal above to view deep analytics.
      </div>
    </div>
  )
}

export default function FinancialsPanel({ result }) {
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
        <div className="financial-metrics-grid">
          {metrics.map(({ label, value, positive }) => (
            <div key={label} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: positive === true ? 'var(--green)' : positive === false ? 'var(--red)' : 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="financial-charts-grid">
        <div className="card" style={{ padding: '18px 22px' }}>
          <div className="label" style={{ marginBottom: 14 }}>Revenue & Profitability</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revData} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v, currency)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Bar dataKey="Revenue" fill="var(--blue)" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="Gross Profit" fill="var(--accent)" radius={[4, 4, 0, 0]} opacity={0.65} />
              <Bar dataKey="Net Income" fill="var(--green)" radius={[4, 4, 0, 0]} opacity={0.8} />
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
