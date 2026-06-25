import { motion } from 'framer-motion'

export default function HorizontalAnalysisStepper({ agentStatuses, isLoading }) {
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
      <div className="stepper-container">
        <div className="stepper-row">
          {steps.map(({ key, label, desc }, index) => {
            const status = agentStatuses[key] || 'waiting'
            const isDone = status === 'done'
            const isWarning = status === 'warning'
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
            } else if (isWarning) {
              circleColor = 'var(--amber, #f59e0b)'
              circleBg = 'rgba(245,158,11,0.06)'
              textColor = 'var(--amber, #f59e0b)'
              lineColor = 'var(--amber, #f59e0b)'
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
                  {/* Circle container for centering pulse ring on loading spinner */}
                  <div style={{ position: 'relative', width: DOTSIZE, height: DOTSIZE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {/* Pulse ring for running state */}
                    {isRunning && (
                      <motion.div
                        style={{
                          position: 'absolute',
                          width: DOTSIZE + 12,
                          height: DOTSIZE + 12,
                          top: -6,
                          left: -6,
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
                      color: isDone ? 'var(--green)' : isWarning ? 'var(--amber, #f59e0b)' : isRunning ? 'var(--accent)' : 'var(--text-muted)',
                      transition: 'all 0.3s ease',
                      position: 'relative', zIndex: 3,
                      flexShrink: 0,
                      boxShadow: isRunning ? '0 0 0 3px rgba(247,59,32,0.08)' : isDone ? '0 0 0 2px rgba(52,199,113,0.08)' : isWarning ? '0 0 0 2px rgba(245,158,11,0.08)' : 'none',
                    }}>
                      {isDone ? '✓' : isWarning ? '!' : isRunning
                        ? <div className="spinner" style={{ width: 10, height: 10, borderTopColor: 'var(--accent)', borderWidth: 1.5 }} />
                        : <span style={{ fontSize: 10 }}>{index + 1}</span>}
                    </div>
                  </div>

                  {/* Label */}
                  <div style={{ fontSize: 10.5, fontWeight: isDone || isWarning || isRunning ? 500 : 400, color: textColor, marginTop: 8, textAlign: 'center', whiteSpace: 'nowrap' }}>
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
                      background: isDone ? 'var(--green)' : isWarning ? 'var(--amber, #f59e0b)' : 'var(--border-light)',
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
    </div>
  )
}
