'use client'

import { useState, useEffect } from 'react'
import { authService } from '../services/auth.js'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, ShieldAlert, CheckCircle, Database, Cloud } from 'lucide-react'

export default function AuthOverlay({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const isCloud = authService.isSupabaseConfigured

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }
    
    try {
      if (isSignUp) {
        const { data, error: err } = await authService.signUp(email, password, {
          full_name: fullName || email.split('@')[0]
        })
        if (err) throw err
        setSuccess('Account created successfully! Logging in...')
        setTimeout(() => {
          if (data?.user) onAuthSuccess?.(data.user)
        }, 1500)
      } else {
        const { data, error: err } = await authService.signIn(email, password)
        if (err) throw err
        setSuccess('Welcome back! Initializing terminal...')
        setTimeout(() => {
          if (data?.user) onAuthSuccess?.(data.user)
        }, 1200)
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'inherit'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '44px 36px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(30px)',
          borderRadius: 24,
          border: '1px solid var(--border-light)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Logo and Terminal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, opacity: 0.8 }}>
          <TrendingUp size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', color: 'var(--text-secondary)' }}>ALPHALENS</span>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 10, textAlign: 'center' }}>
          Research every company with AI.
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 28, lineHeight: 1.6, maxWidth: 300 }}>
          Financials, news, risks, and market signals—all in one place.
        </p>

        {/* Cloud/Local Banner */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 11,
          color: 'var(--text-secondary)',
          marginBottom: 24,
          fontFamily: 'JetBrains Mono'
        }}>
          {isCloud ? <Cloud size={14} /> : <Database size={14} />}
          <span>
            {isCloud ? 'Supabase cloud storage active' : 'Local demo sandbox active'}
          </span>
        </div>

        {/* Error / Success Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                width: '100%',
                background: 'rgba(229, 57, 53, 0.1)',
                border: '1px solid rgba(229, 57, 53, 0.2)',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#ef4444',
                fontSize: 12,
                marginBottom: 16
              }}
            >
              <ShieldAlert size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                width: '100%',
                background: 'rgba(0, 169, 110, 0.1)',
                border: '1px solid rgba(0, 169, 110, 0.2)',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#10b981',
                fontSize: 12,
                marginBottom: 16
              }}
            >
              <CheckCircle size={14} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: 3,
          borderRadius: 99,
          width: '100%',
          marginBottom: 24,
          border: '1px solid rgba(255,255,255,0.015)'
        }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(''); setSuccess('') }}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: 'none',
              background: !isSignUp ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              color: !isSignUp ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(''); setSuccess('') }}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: 'none',
              background: isSignUp ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              color: isSignUp ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isSignUp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.015)',
                  border: '1px solid rgba(255, 255, 255, 0.015)',
                  borderRadius: 12,
                  color: '#ffffff',
                  fontSize: 13,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.015)'}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Email Address</label>
            <input
              type="email"
              placeholder="e.g. analyst@firm.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.015)',
                border: '1px solid rgba(255, 255, 255, 0.015)',
                borderRadius: 12,
                color: '#ffffff',
                fontSize: 13,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.015)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.015)',
                border: '1px solid rgba(255, 255, 255, 0.015)',
                borderRadius: 12,
                color: '#ffffff',
                fontSize: 13,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.015)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 20px',
              background: '#ffffff',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(255,255,255,0.05)',
              marginTop: 14
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(255, 255, 255, 0.9)'; e.target.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { e.target.style.background = '#ffffff'; e.target.style.transform = 'none' }}
          >
            {loading ? (
              <div className="spinner" style={{ borderTopColor: 'var(--bg)' }} />
            ) : (
              <span>{isSignUp ? 'Create Analyst Profile' : 'Authenticate'}</span>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 32 }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>FOR INTERNAL USE ONLY.</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>·</span>
          <button 
            type="button" 
            onClick={() => {
              // Bypassing auth with a demo profile
              const demoUser = { id: 'demo-user', email: 'demo@alphalens.io', user_metadata: { full_name: 'Demo Analyst' } }
              localStorage.setItem('alpha_local_session', JSON.stringify(demoUser))
              onAuthSuccess?.(demoUser)
            }}
            style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255, 255, 255, 0.45)', fontSize: 9, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
          >
            BYPASS TO DEMO
          </button>
        </div>
      </motion.div>
    </div>
  )
}
