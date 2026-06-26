'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, TrendingUp, LogOut, ArrowLeft, Trash2, Download,
  ExternalLink, Search, FileText, Database, ShieldAlert,
  CheckCircle, Globe, Cloud, Calendar, Briefcase, Award, X, Edit2
} from 'lucide-react'
import { authService } from '../../services/auth.js'
import { reportsService } from '../../services/reports.js'
import AuthOverlay from '../../components/AuthOverlay.js'
import { applyTheme } from '../../components/SettingsModal.js'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Initialize theme & auth listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('alpha_terminal_theme_v2') || 'jeton'
      applyTheme(savedTheme)
    }

    const unsubscribe = authService.onAuthStateChange(async (event, sessionUser) => {
      setUser(sessionUser)
      if (sessionUser) {
        setEditName(sessionUser.user_metadata?.full_name || '')
        setEditRole(sessionUser.user_metadata?.role || 'Lead Investment Strategist')
      }
      setAuthInitialized(true)
      
      if (sessionUser) {
        // Fetch reports for the logged in user
        setLoadingReports(true)
        const { data, error } = await reportsService.getReports(sessionUser.id)
        if (!error) {
          setReports(data || [])
        } else {
          console.error('Error fetching reports:', error)
        }
        setLoadingReports(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogOut = async () => {
    await authService.signOut()
    router.push('/')
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!editName.trim() || !editRole.trim()) {
      setErrorMsg('All profile fields are required')
      setTimeout(() => setErrorMsg(''), 3000)
      return
    }
    setSavingProfile(true)
    const { error } = await authService.updateUser({
      full_name: editName.trim(),
      role: editRole.trim()
    })
    setSavingProfile(false)
    if (!error) {
      setUser(prev => ({
        ...prev,
        user_metadata: {
          ...prev.user_metadata,
          full_name: editName.trim(),
          role: editRole.trim()
        }
      }))
      setIsEditing(false)
      setSuccessMsg('Profile updated successfully')
      setTimeout(() => setSuccessMsg(''), 2500)
    } else {
      setErrorMsg(error.message || 'Failed to update profile')
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (!user) return
    const confirmDelete = window.confirm('Are you sure you want to delete this report from your history?')
    if (!confirmDelete) return

    const { error } = await reportsService.deleteReport(user.id, reportId)
    if (!error) {
      setReports(prev => prev.filter(r => r.id !== reportId))
      setSuccessMsg('Report deleted successfully')
      setTimeout(() => setSuccessMsg(''), 2500)
    } else {
      setErrorMsg('Failed to delete report')
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  const handleDownloadReport = (report) => {
    const blob = new Blob([report.report_text || report.summary || ''], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.ticker}-report.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredReports = reports.filter(r => {
    const term = searchQuery.toLowerCase()
    return (
      r.ticker?.toLowerCase().includes(term) ||
      r.company_name?.toLowerCase().includes(term) ||
      r.verdict?.toLowerCase().includes(term)
    )
  })

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

  const isCloud = authService.isSupabaseConfigured
  const formattedDate = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Joined Today'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      transition: 'background 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-sequel-sans)'
    }}>
      
      {!isCloud && (
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
          ⚠️ Development Mode: Supabase not configured. Using local sandbox sessionStorage & localStorage.
        </div>
      )}

      {/* ─── HEADER ────────────────────────────────────────────────────────── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: 72,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
            PRISMA / MY ACCOUNT
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'var(--btn-primary-bg, #ffffff)',
              color: 'var(--btn-primary-text, var(--accent))',
              border: 'var(--btn-primary-border, 1.5px solid var(--accent))',
              borderRadius: 99,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--btn-primary-bg)'}
          >
            Terminal
          </button>
          <button 
            onClick={handleLogOut}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--red)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </header>

      {/* ─── CONTENT GRID ───────────────────────────────────────────────────── */}
      <main style={{
        flex: 1,
        maxWidth: 1240,
        width: '100%',
        margin: '0 auto',
        padding: '40px 24px',
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 32,
        alignItems: 'start'
      }}>

        {/* ─── COLUMN A: PROFILE ─── */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}>
          {/* Profile Card */}
          <div className="card" style={{
            padding: '32px 24px',
            background: 'var(--bg-card)',
            borderRadius: 24,
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}>
            {!isEditing ? (
              <>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent, #f73b20) 0%, #ff9a82 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: 20,
                  boxShadow: 'rgba(247, 59, 32, 0.25) 0px 12px 32px'
                }}>
                  {(user.user_metadata?.full_name || user.email || 'A')[0].toUpperCase()}
                </div>

                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {user.user_metadata?.full_name || 'Prisma Analyst'}
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  {user.email}
                </p>

                <button 
                  onClick={() => {
                    setEditName(user.user_metadata?.full_name || '')
                    setEditRole(user.user_metadata?.role || 'Lead Investment Strategist')
                    setIsEditing(true)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 99,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: 24
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Edit2 size={10} />
                  Edit Profile
                </button>

                <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Briefcase size={14} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role</div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{user.user_metadata?.role || 'Lead Investment Strategist'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Member Since</div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{formattedDate}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Award size={14} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>VIP Account Active</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleSaveProfile} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>
                  Modify Profile
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                    placeholder="Prisma Analyst"
                    style={{
                      padding: '10px 14px',
                      background: 'var(--bg-sidebar)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    required
                    placeholder="e.g. Lead Investment Strategist"
                    style={{
                      padding: '10px 14px',
                      background: 'var(--bg-sidebar)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: 'var(--text-primary)',
                      color: 'var(--bg)'
                    }}
                  >
                    {savingProfile ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Database Info Card */}
          <div className="card" style={{
            padding: '20px 24px',
            background: 'var(--bg-card)',
            borderRadius: 20,
            border: '1px solid var(--border-light)',
            fontSize: 12
          }}>
            <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Database size={12} />
              Session Storage info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justify: 'space-between', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Connection Type:</span>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {isCloud ? <Cloud size={12} color="var(--blue)" /> : <Database size={12} color="var(--amber)" />}
                  {isCloud ? 'Supabase DB' : 'Local Sandbox'}
                </span>
              </div>
              <div style={{ display: 'flex', justify: 'space-between', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Reports:</span>
                <span style={{ fontWeight: 600 }}>{reports.length}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4, lineHeight: 1.4 }}>
                {isCloud 
                  ? 'All analyst reports are synced securely in your cloud profile databases.' 
                  : 'Sandbox mode uses localStorage. To persist forever, configure Supabase credentials.'}
              </div>
            </div>
          </div>
        </section>

        {/* ─── COLUMN B: REPORTS LIST ─── */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}>
          {/* Top filter section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap'
          }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
                Analyst Portfolio Logs
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                A compilation of all investment logs, scorecards, and reports generated by your sessions.
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '6px 12px',
              width: 320,
              maxWidth: '100%'
            }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by Ticker, Company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  width: '100%',
                  fontFamily: 'inherit'
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Success/Error Alerts */}
          <AnimatePresence>
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ padding: '10px 16px', background: 'var(--green-bg)', border: '1px solid var(--green-border)', color: 'var(--green)', borderRadius: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={14} /> {successMsg}
              </motion.div>
            )}
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ padding: '10px 16px', background: 'var(--red-bg)', border: '1px solid var(--red-border)', color: 'var(--red)', borderRadius: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={14} /> {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reports Content */}
          {loadingReports ? (
            <div className="card" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <div className="spinner" style={{ width: 24, height: 24, marginBottom: 12 }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading reports archive...</span>
            </div>
          ) : filteredReports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredReports.map((report) => {
                const isPositive = report.verdict?.toLowerCase().includes('buy') || report.verdict?.toLowerCase().includes('strong') || report.score > 60
                const isNegative = report.verdict?.toLowerCase().includes('sell') || report.verdict?.toLowerCase().includes('underperform') || report.score < 40
                const badgeColor = isPositive ? 'var(--green)' : isNegative ? 'var(--red)' : 'var(--amber)'
                const badgeBg = isPositive ? 'var(--green-bg)' : isNegative ? 'var(--red-bg)' : 'var(--amber-bg)'
                const dateString = new Date(report.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })

                return (
                  <motion.div 
                    key={report.id} 
                    className="card"
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '20px 24px',
                      background: 'var(--bg-card)',
                      borderRadius: 16,
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 20,
                      transition: 'border 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-light)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {/* Left details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', background: 'var(--bg-tag)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)', fontWeight: 600 }}>
                          {report.ticker}
                        </span>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {report.company_name}
                        </h3>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={10} />
                          {dateString}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {report.summary}
                      </p>
                    </div>

                    {/* Verdict / Score Badge */}
                    <div style={{ textAlign: 'center', minWidth: 100 }}>
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: 8,
                        background: badgeBg,
                        color: badgeColor,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 4,
                        display: 'inline-block'
                      }}>
                        {report.verdict || 'Neutral'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                        Score: {report.score}<span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <button 
                        onClick={() => setSelectedReport(report)}
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                          background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                        title="View Report Details"
                      >
                        <FileText size={13} />
                      </button>

                      <button 
                        onClick={() => router.push(`/dashboard/${encodeURIComponent(report.ticker)}`)}
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                          background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                        title="Open Terminal Session"
                      >
                        <ExternalLink size={13} />
                      </button>

                      <button 
                        onClick={() => handleDownloadReport(report)}
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                          background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                        title="Export Markdown Report"
                      >
                        <Download size={13} />
                      </button>

                      <button 
                        onClick={() => handleDeleteReport(report.id)}
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: '1px solid var(--red-border, rgba(251, 45, 84, 0.15))',
                          background: 'transparent', color: 'var(--red)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.borderColor = 'var(--red)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--red-border, rgba(251, 45, 84, 0.15))' }}
                        title="Delete Report Log"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="card" style={{ padding: 64, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-light)' }}>
              <FileText size={48} color="var(--border)" style={{ marginBottom: 16, opacity: 0.8 }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>No Reports Discovered</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, maxWidth: 320, margin: '0 auto 20px' }}>
                {searchQuery ? 'No reports matched your search term.' : 'You have not completed any stock analysis sessions yet.'}
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => router.push('/')}
                  className="btn btn-primary"
                  style={{
                    padding: '8px 20px',
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: 'var(--btn-primary-bg, var(--text-primary))',
                    color: 'var(--btn-primary-text, var(--bg))',
                    border: 'none'
                  }}
                >
                  Initiate New Analysis
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ─── DETAIL POPUP MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedReport && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: '90%',
                maxWidth: 800,
                maxHeight: '85vh',
                background: 'var(--bg-card)',
                borderRadius: 24,
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                color: 'var(--text-primary)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)'
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', background: 'var(--bg-tag)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)', fontWeight: 600 }}>
                      {selectedReport.ticker}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                      {selectedReport.company_name}
                    </h3>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Report generated on {new Date(selectedReport.created_at).toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button 
                    onClick={() => handleDownloadReport(selectedReport)}
                    className="btn-ghost btn"
                    style={{ padding: '6px 14px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Download size={13} /> Export .md
                  </button>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div style={{
                padding: '32px',
                overflowY: 'auto',
                flex: 1,
                lineHeight: 1.8,
                fontSize: 13,
                color: 'var(--text-secondary)'
              }}>
                <div style={{
                  background: 'var(--bg-sidebar)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '16px 20px',
                  marginBottom: 24
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Executive Verdict Summary</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedReport.verdict} (Score: {selectedReport.score}/100)</div>
                  <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>{selectedReport.summary}</p>
                </div>

                {selectedReport.report_text ? (
                  <pre style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'inherit',
                    margin: 0,
                    color: 'var(--text-primary)'
                  }}>
                    {selectedReport.report_text}
                  </pre>
                ) : (
                  <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    No extended report body available. Executive summary only.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
