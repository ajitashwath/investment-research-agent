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

export default function FactorTable({ scores, isLoading, onReviewFactor }) {
  if (isLoading) {
    return (
      <div className="card" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <div className="label" style={{ marginBottom: 16 }}>Core Investment Factors</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
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
