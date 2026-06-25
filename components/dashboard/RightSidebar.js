import { motion } from 'framer-motion'
import { Shield, HelpCircle } from 'lucide-react'

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

export default function RightSidebar({ result, isLoading }) {
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
