'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ArrowRight, Settings, Trash2, Clock, BarChart3
} from 'lucide-react'
import AuthOverlay from '../../components/AuthOverlay.js'
import SettingsModal, { applyTheme } from '../../components/SettingsModal.js'
import { authService } from '../../services/auth.js'
import { reportsService } from '../../services/reports.js'

export default function DashboardHubPage() {
  const [user, setUser] = useState(null)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [launching, setLaunching] = useState(false)

  const router = useRouter()

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

  // Load user's recent reports
  useEffect(() => {
    if (user) {
      setLoadingReports(true)
      reportsService.getReports(user.id)
        .then(({ data }) => {
          if (data) setReports(data)
        })
        .catch(err => console.error('Error fetching reports:', err))
        .finally(() => setLoadingReports(false))
    }
  }, [user])

  const handleLaunch = (ticker) => {
    const t = (ticker || query).trim()
    if (!t) return
    setLaunching(true)
    router.push(`/dashboard/${encodeURIComponent(t)}`)
  }

  const handleDelete = async (e, reportId) => {
    e.stopPropagation() // Don't trigger list item click
    if (!user) return
    const confirmed = window.confirm('Are you sure you want to delete this report?')
    if (!confirmed) return

    const { error } = await reportsService.deleteReport(user.id, reportId)
    if (!error) {
      setReports(prev => prev.filter(r => r.id !== reportId))
    } else {
      alert('Failed to delete report: ' + error)
    }
  }

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)' }}>
      {/* Dev Mode banner if Supabase not configured */}
      {!authService.isSupabaseConfigured && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          padding: '8px 16px',
          fontSize: '11.5px',
          fontWeight: '500',
          textAlign: 'center',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          ⚠️ Development Mode: Supabase not configured. Using mock local database.
        </div>
      )}

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 50,
        height: 'var(--header-height, 64px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <motion.div 
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} 
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.02 }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-primary)', fontFamily: 'var(--font-sequel-sans)' }}>PRISMA</span>
          </motion.div>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Research Terminal</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-ghost btn" style={{ width: 32, height: 32, padding: 0, justifyContent: 'center', borderRadius: '50%' }} onClick={() => setSettingsOpen(true)} title="Settings">
            <Settings size={14} />
          </button>

          <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

          <div
            onClick={() => router.push('/account')}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '3px', borderRadius: '50%', background: 'var(--bg-tag)', border: '1px solid var(--border-light)' }}
            title="User Profile Dashboard"
          >
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#ffffff' }}>
              {(user.user_metadata?.full_name || user.email || 'A')[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px 80px', maxWidth: 800, width: '100%', margin: '0 auto' }}>
        
        {/* Launcher Prompt section */}
        <motion.div 
          style={{ textAlign: 'center', width: '100%', marginBottom: 40 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 8 }}>
            Prisma Terminal Launcher
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto 28px' }}>
            Enter a ticker or company name. Six specialized AI agents will extract sentiment, audit risk, and parse financials to generate a recommendation.
          </p>

          {/* Premium Search input bar */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            padding: '6px 6px 6px 18px',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: 560,
            margin: '0 auto',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Search size={15} color="var(--text-muted)" strokeWidth={2} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLaunch()}
                placeholder="Ticker or Company — e.g. NVIDIA, AAPL, RELIANCE.NS"
                disabled={launching}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: 13, color: 'var(--text-primary)',
                  background: 'transparent',
                  fontWeight: 500,
                }}
              />
              <motion.button
                onClick={() => handleLaunch()}
                disabled={!query.trim() || launching}
                style={{
                  borderRadius: '11px', padding: '8px 20px',
                  background: 'var(--accent)', color: '#ffffff',
                  display: 'flex', alignItems: 'center', gap: 6,
                  border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  whiteSpace: 'nowrap',
                  opacity: (!query.trim() || launching) ? 0.55 : 1,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {launching ? (
                  <div className="spinner" style={{ borderTopColor: '#ffffff', width: 10, height: 10 }} />
                ) : (
                  <><span>Launch</span><ArrowRight size={13} /></>
                )}
              </motion.button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Popular:</span>
            {['NVIDIA', 'AAPL', 'TSLA', 'RELIANCE.NS', 'TCS.NS'].map(t => (
              <motion.button
                key={t} 
                onClick={() => !launching && handleLaunch(t)}
                disabled={launching}
                style={{
                  padding: '4px 11px', borderRadius: '8px',
                  background: 'var(--bg-tag)',
                  border: '1px solid var(--border-light)',
                  fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
                whileHover={{ background: 'var(--bg-hover)', borderColor: 'var(--accent)' }}
                whileTap={{ scale: 0.96 }}
              >
                {t}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent reports / History Section */}
        <motion.div 
          style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: 36 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={14} color="var(--text-secondary)" />
              <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Recent Reports & Scans
              </h2>
            </div>
            {reports.length > 0 && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
                {reports.length} report{reports.length > 1 ? 's' : ''} saved
              </span>
            )}
          </div>

          {loadingReports ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12, width: '100%' }} />
              ))}
            </div>
          ) : reports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reports.map((r, i) => (
                <motion.div
                  key={r.id || i}
                  onClick={() => !launching && handleLaunch(r.ticker)}
                  className="card"
                  style={{
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: launching ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  whileHover={launching ? {} : { scale: 1.01, boxShadow: 'var(--shadow-sm)' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'var(--accent-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent)', fontWeight: 700, fontSize: 11,
                      fontFamily: 'JetBrains Mono, monospace'
                    }}>
                      {r.ticker.slice(0, 4)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {r.company_name}
                        </span>
                        <span style={{ fontSize: 9.5, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                          {r.ticker}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
                        <span style={{
                          fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                          color: r.verdict?.toLowerCase().includes('bullish') || r.verdict?.toLowerCase().includes('buy') ? 'var(--green)' :
                                 r.verdict?.toLowerCase().includes('bearish') || r.verdict?.toLowerCase().includes('sell') ? 'var(--red)' :
                                 'var(--amber)'
                        }}>
                          {r.verdict}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={(e) => handleDelete(e, r.id)}
                      disabled={launching}
                      style={{
                        padding: 6, borderRadius: '50%',
                        border: 'none', background: 'transparent',
                        color: 'var(--text-muted)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-bg)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                      title="Delete Report"
                    >
                      <Trash2 size={13} />
                    </button>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <BarChart3 size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p style={{ fontSize: 12 }}>No recent reports found. Enter a ticker above to run your first analysis.</p>
            </div>
          )}
        </motion.div>

      </main>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
