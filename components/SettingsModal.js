'use client'

import { useState, useEffect } from 'react'
import { authService } from '../services/auth.js'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Palette, Settings, Key, User, LogOut, Check, Terminal } from 'lucide-react'

// Theme definition matching CSS variable injection
export const applyTheme = (themeName) => {
  const themes = {
    jeton: {
      '--bg': '#ffffff',
      '--bg-card': 'rgba(254, 245, 243, 0.85)',
      '--bg-sidebar': '#ffffff',
      '--bg-hover': 'rgba(247, 59, 32, 0.04)',
      '--bg-input': '#ffffff',
      '--bg-tag': 'rgba(247, 59, 32, 0.05)',
      '--border': 'rgba(54, 8, 2, 0.08)',
      '--border-light': 'rgba(54, 8, 2, 0.04)',
      '--text-primary': '#360802',
      '--text-secondary': 'rgba(54, 8, 2, 0.7)',
      '--text-muted': 'rgba(54, 8, 2, 0.45)',
      '--text-sidebar': '#360802',
      '--green': '#34c771',
      '--green-bg': 'rgba(52, 199, 113, 0.05)',
      '--green-border': 'rgba(52, 199, 113, 0.15)',
      '--red': '#fb2d54',
      '--red-bg': 'rgba(251, 45, 84, 0.05)',
      '--red-border': 'rgba(251, 45, 84, 0.15)',
      '--amber': '#f73b20',
      '--amber-bg': 'rgba(247, 59, 32, 0.05)',
      '--amber-border': 'rgba(247, 59, 32, 0.15)',
      '--blue': '#477ee9',
      '--blue-bg': 'rgba(71, 126, 233, 0.05)',
      '--blue-border': 'rgba(71, 126, 233, 0.15)',
      '--purple': '#fb2d54',
      '--purple-bg': 'rgba(251, 45, 84, 0.05)',
      '--shadow-card': 'rgba(0, 0, 0, 0.04) 0px -4px 16px 0px',
      '--bg-hover-card': '#ffffff',
      '--border-hover': 'rgba(54, 8, 2, 0.12)',
      '--shadow-card-hover': 'rgba(0, 0, 0, 0.08) 0px -6px 20px 0px',
      '--btn-primary-bg': '#ffffff',
      '--btn-primary-text': '#f73b20',
      '--btn-primary-border': '1.5px solid #f73b20',
      '--btn-primary-shadow': 'none',
      '--btn-primary-hover-bg': '#ffffff',
      '--btn-primary-hover-border': '#f73b20'
    },
    cyberpunk: {
      '--bg': '#0b0f19',
      '--bg-card': 'rgba(17, 24, 39, 0.85)',
      '--bg-sidebar': '#0e131f',
      '--bg-hover': 'rgba(255, 255, 255, 0.04)',
      '--bg-input': 'rgba(255, 255, 255, 0.02)',
      '--bg-tag': 'rgba(255, 255, 255, 0.03)',
      '--border': 'rgba(255, 255, 255, 0.08)',
      '--border-light': 'rgba(255, 255, 255, 0.04)',
      '--text-primary': '#f8fafc',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#64748b',
      '--text-sidebar': '#94a3b8',
      '--accent': '#6366f1',
      '--accent-light': 'rgba(99, 102, 241, 0.08)',
      '--green': '#10b981',
      '--green-bg': 'rgba(16, 185, 129, 0.04)',
      '--green-border': 'rgba(16, 185, 129, 0.1)',
      '--red': '#ef4444',
      '--red-bg': 'rgba(239, 68, 68, 0.04)',
      '--red-border': 'rgba(239, 68, 68, 0.1)',
      '--amber': '#f59e0b',
      '--amber-bg': 'rgba(245, 158, 11, 0.04)',
      '--amber-border': 'rgba(245, 158, 11, 0.1)',
      '--blue': '#3b82f6',
      '--blue-bg': 'rgba(59, 130, 246, 0.04)',
      '--blue-border': 'rgba(59, 130, 246, 0.1)',
      '--purple': '#6366f1',
      '--purple-bg': 'rgba(99, 102, 241, 0.04)',
      '--shadow-card': '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      '--bg-hover-card': 'rgba(255, 255, 255, 0.025)',
      '--border-hover': 'rgba(255, 255, 255, 0.035)',
      '--shadow-card-hover': '0 20px 48px rgba(0, 0, 0, 0.7)',
      '--btn-primary-bg': '#f8fafc',
      '--btn-primary-text': '#0b0f19',
      '--btn-primary-border': 'none',
      '--btn-primary-shadow': '0 4px 16px rgba(255, 255, 255, 0.05)',
      '--btn-primary-hover-bg': 'rgba(255, 255, 255, 0.9)',
      '--btn-primary-hover-border': 'currentColor'
    },
    amber: {
      '--bg': '#0f0f11',
      '--bg-card': 'rgba(22, 22, 25, 0.85)',
      '--bg-sidebar': '#121214',
      '--bg-hover': 'rgba(255, 255, 255, 0.04)',
      '--bg-input': 'rgba(255, 255, 255, 0.02)',
      '--bg-tag': 'rgba(255, 255, 255, 0.03)',
      '--border': 'rgba(255, 255, 255, 0.06)',
      '--border-light': 'rgba(255, 255, 255, 0.03)',
      '--text-primary': '#f4f4f5',
      '--text-secondary': '#a1a1aa',
      '--text-muted': '#52525b',
      '--text-sidebar': '#a1a1aa',
      '--accent': '#a1a1aa',
      '--accent-light': 'rgba(255, 255, 255, 0.04)',
      '--green': '#22c55e',
      '--green-bg': 'rgba(34, 197, 94, 0.04)',
      '--green-border': 'rgba(34, 197, 94, 0.08)',
      '--red': '#ef4444',
      '--red-bg': 'rgba(239, 68, 68, 0.04)',
      '--red-border': 'rgba(239, 68, 68, 0.08)',
      '--amber': '#eab308',
      '--amber-bg': 'rgba(234, 179, 8, 0.04)',
      '--amber-border': 'rgba(234, 179, 8, 0.08)',
      '--blue': '#3b82f6',
      '--blue-bg': 'rgba(59, 130, 246, 0.04)',
      '--blue-border': 'rgba(59, 130, 246, 0.08)',
      '--purple': '#a1a1aa',
      '--purple-bg': 'rgba(255, 255, 255, 0.04)',
      '--shadow-card': '0 8px 32px rgba(0, 0, 0, 0.4)',
      '--bg-hover-card': 'rgba(255, 255, 255, 0.025)',
      '--border-hover': 'rgba(255, 255, 255, 0.035)',
      '--shadow-card-hover': '0 20px 48px rgba(0, 0, 0, 0.5)',
      '--btn-primary-bg': '#f4f4f5',
      '--btn-primary-text': '#0f0f11',
      '--btn-primary-border': 'none',
      '--btn-primary-shadow': '0 4px 16px rgba(255, 255, 255, 0.05)',
      '--btn-primary-hover-bg': 'rgba(255, 255, 255, 0.9)',
      '--btn-primary-hover-border': 'currentColor'
    },
    emerald: {
      '--bg': '#08080a',
      '--bg-card': 'rgba(18, 18, 21, 0.85)',
      '--bg-sidebar': '#0e0e11',
      '--bg-hover': 'rgba(255, 255, 255, 0.04)',
      '--bg-input': 'rgba(255, 255, 255, 0.02)',
      '--bg-tag': 'rgba(255, 255, 255, 0.03)',
      '--border': '#222226',
      '--border-light': '#1a1a1e',
      '--text-primary': '#f4f4f7',
      '--text-secondary': '#a3a3a9',
      '--text-muted': '#525258',
      '--text-sidebar': '#a3a3a9',
      '--accent': '#10b981',
      '--accent-light': 'rgba(16, 185, 129, 0.05)',
      '--green': '#10b981',
      '--green-bg': 'rgba(16, 185, 129, 0.02)',
      '--green-border': '#222226',
      '--red': '#ef4444',
      '--red-bg': 'rgba(239, 68, 68, 0.02)',
      '--red-border': '#222226',
      '--amber': '#f59e0b',
      '--amber-bg': 'rgba(245, 158, 11, 0.02)',
      '--amber-border': '#222226',
      '--blue': '#3b82f6',
      '--blue-bg': 'rgba(59, 130, 246, 0.02)',
      '--blue-border': '#222226',
      '--purple': '#8b5cf6',
      '--purple-bg': 'rgba(139, 92, 246, 0.02)',
      '--shadow-card': 'none',
      '--bg-hover-card': 'rgba(255, 255, 255, 0.025)',
      '--border-hover': '#222226',
      '--shadow-card-hover': 'none',
      '--btn-primary-bg': '#f4f4f7',
      '--btn-primary-text': '#08080a',
      '--btn-primary-border': 'none',
      '--btn-primary-shadow': 'none',
      '--btn-primary-hover-bg': 'rgba(255, 255, 255, 0.9)',
      '--btn-primary-hover-border': 'currentColor'
    },
    silver: {
      '--bg': '#030408',
      '--bg-card': 'rgba(15, 23, 42, 0.65)',
      '--bg-sidebar': 'rgba(10, 15, 30, 0.8)',
      '--bg-hover': 'rgba(255, 255, 255, 0.04)',
      '--bg-input': 'rgba(255, 255, 255, 0.02)',
      '--bg-tag': 'rgba(255, 255, 255, 0.03)',
      '--border': 'rgba(255, 255, 255, 0.08)',
      '--border-light': 'rgba(255, 255, 255, 0.04)',
      '--text-primary': '#f8fafc',
      '--text-secondary': '#cbd5e1',
      '--text-muted': '#64748b',
      '--text-sidebar': '#cbd5e1',
      '--accent': '#38bdf8',
      '--accent-light': 'rgba(56, 189, 248, 0.08)',
      '--green': '#34d399',
      '--green-bg': 'rgba(52, 211, 153, 0.06)',
      '--green-border': 'rgba(52, 211, 153, 0.12)',
      '--red': '#f87171',
      '--red-bg': 'rgba(248, 113, 113, 0.06)',
      '--red-border': 'rgba(248, 113, 113, 0.12)',
      '--amber': '#fbbf24',
      '--amber-bg': 'rgba(251, 191, 36, 0.06)',
      '--amber-border': 'rgba(251, 191, 36, 0.12)',
      '--blue': '#38bdf8',
      '--blue-bg': 'rgba(56, 189, 248, 0.06)',
      '--blue-border': 'rgba(56, 189, 248, 0.12)',
      '--purple': '#c084fc',
      '--purple-bg': 'rgba(192, 132, 252, 0.06)',
      '--shadow-card': '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      '--bg-hover-card': 'rgba(255, 255, 255, 0.03)',
      '--border-hover': 'rgba(255, 255, 255, 0.12)',
      '--shadow-card-hover': '0 12px 40px rgba(0, 0, 0, 0.7)',
      '--btn-primary-bg': '#f8fafc',
      '--btn-primary-text': '#030408',
      '--btn-primary-border': 'none',
      '--btn-primary-shadow': '0 4px 16px rgba(255, 255, 255, 0.05)',
      '--btn-primary-hover-bg': 'rgba(255, 255, 255, 0.9)',
      '--btn-primary-hover-border': 'currentColor'
    }
  }

  const root = document.documentElement
  const styles = themes[themeName] || themes.jeton
  
  Object.keys(styles).forEach((key) => {
    root.style.setProperty(key, styles[key])
  })
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('alpha_terminal_theme_v2', themeName)
  }
}

export default function SettingsModal({ isOpen, onClose, user, onLogOut }) {
  const [activeTab, setActiveTab] = useState('appearance')
  const [theme, setTheme] = useState('jeton')
  const [model, setModel] = useState('gemini-2.5-flash-lite')
  const [depth, setDepth] = useState('advanced')
  const [geminiKey, setGeminiKey] = useState('')
  const [tavilyKey, setTavilyKey] = useState('')
  const [keysSaved, setKeysSaved] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('alpha_terminal_theme_v2') || 'jeton'
      setTheme(savedTheme)
      
      const savedModel = localStorage.getItem('alpha_terminal_model') || 'gemini-2.5-flash-lite'
      setModel(savedModel)
      
      const savedDepth = localStorage.getItem('alpha_terminal_depth') || 'advanced'
      setDepth(savedDepth)

      setGeminiKey(localStorage.getItem('alpha_custom_gemini_key') || '')
      setTavilyKey(localStorage.getItem('alpha_custom_tavily_key') || '')
    }
  }, [isOpen])

  const handleSaveKeys = (e) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('alpha_custom_gemini_key', geminiKey.trim())
      localStorage.setItem('alpha_custom_tavily_key', tavilyKey.trim())
      setKeysSaved(true)
      setTimeout(() => setKeysSaved(false), 2000)
    }
  }

  const handleClearKeys = () => {
    setGeminiKey('')
    setTavilyKey('')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('alpha_custom_gemini_key')
      localStorage.removeItem('alpha_custom_tavily_key')
    }
  }

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  const changeModel = (newModel) => {
    setModel(newModel)
    if (typeof window !== 'undefined') {
      localStorage.setItem('alpha_terminal_model', newModel)
    }
  }

  const changeDepth = (newDepth) => {
    setDepth(newDepth)
    if (typeof window !== 'undefined') {
      localStorage.setItem('alpha_terminal_depth', newDepth)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'research', label: 'Research Config', icon: Terminal },
    { id: 'keys', label: 'API Keys (BYOK)', icon: Key },
    { id: 'profile', label: 'Account Profile', icon: User }
  ]

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'inherit'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          width: '100%',
          maxWidth: 620,
          height: 440,
          background: 'var(--bg-card)',
          borderRadius: 24,
          border: '1px solid var(--border-light)',
          boxShadow: 'none',
          display: 'flex',
          overflow: 'hidden',
          color: 'var(--text-primary)'
        }}
      >
        {/* Sidebar Menu */}
        <div style={{
          width: 180,
          borderRight: '1px solid var(--border-light)',
          background: 'rgba(255, 255, 255, 0.01)',
          padding: '28px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', paddingLeft: 12, marginBottom: 16 }}>
              Terminal Settings
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tabs.map(tab => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 14px',
                      borderRadius: 99,
                      border: 'none',
                      background: active ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: 12,
                      fontWeight: active ? 500 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Icon size={14} color={active ? 'var(--text-primary)' : 'var(--text-secondary)'} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 99,
              border: 'none',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
          >
            <X size={12} />
            <span>Close</span>
          </button>
        </div>

        {/* Content Pane */}
        <div style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>
          {activeTab === 'appearance' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Terminal Customization</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 24 }}>Select your preferred workspace theme.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { id: 'jeton', label: 'Jeton Sunrise (Default)', desc: 'Coral sunrise & white paper', color: '#f73b20' },
                  { id: 'cyberpunk', label: 'Slate Executive', desc: 'Refined slate & indigo', color: '#6366f1' },
                  { id: 'amber', label: 'Charcoal Matte', desc: 'Premium flat dark gray', color: '#a1a1aa' },
                  { id: 'emerald', label: 'Stealth Matte', desc: 'Minimalist pitch dark theme', color: '#10b981' },
                  { id: 'silver', label: 'Midnight Obsidian', desc: 'Obsidian glassmorphism', color: '#38bdf8' }
                ].map(opt => {
                  const selected = theme === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => changeTheme(opt.id)}
                      style={{
                        padding: '16px',
                        borderRadius: 16,
                        border: 'none',
                        background: selected ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)',
                        boxShadow: selected ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        position: 'relative',
                        transition: 'all 0.25s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: selected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt.label}</span>
                        {selected && <Check size={14} color="var(--text-primary)" />}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{opt.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'research' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Research Core Configuration</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Configure LLM routing and crawling details.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Intelligence Engine</label>
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
                    <button
                      onClick={() => changeModel('gemini-2.5-flash-lite')}
                      style={{
                        flex: 1, padding: '8px', border: 'none',
                        background: model === 'gemini-2.5-flash-lite' ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: model === 'gemini-2.5-flash-lite' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer'
                      }}
                    >
                      Gemini Flash Lite (Fast)
                    </button>
                    <button
                      onClick={() => changeModel('gemini-2.5-pro')}
                      style={{
                        flex: 1, padding: '8px', border: 'none',
                        background: model === 'gemini-2.5-pro' ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: model === 'gemini-2.5-pro' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer'
                      }}
                    >
                      Gemini Pro (Heavy Reasoning)
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Search Query Depth</label>
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
                    <button
                      onClick={() => changeDepth('advanced')}
                      style={{
                        flex: 1, padding: '8px', border: 'none',
                        background: depth === 'advanced' ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: depth === 'advanced' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer'
                      }}
                    >
                      Advanced Multi-Agent Depth (60 Days)
                    </button>
                    <button
                      onClick={() => changeDepth('basic')}
                      style={{
                        flex: 1, padding: '8px', border: 'none',
                        background: depth === 'basic' ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: depth === 'basic' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer'
                      }}
                    >
                      Quick Standard Scan (30 Days)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <form onSubmit={handleSaveKeys} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Bring Your Own Keys (BYOK)</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Override backend keys with your personal browser sessions.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Custom Gemini API Key</label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiKey}
                    onChange={e => setGeminiKey(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Custom Tavily API Key</label>
                  <input
                    type="password"
                    placeholder="tvly-..."
                    value={tavilyKey}
                    onChange={e => setTavilyKey(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: 'var(--text-primary)',
                    color: 'var(--bg)',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {keysSaved ? 'Saved Locally!' : 'Save Overrides'}
                </button>
                {(geminiKey || tavilyKey) && (
                  <button
                    type="button"
                    onClick={handleClearKeys}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: 'var(--red)',
                      border: '1px solid var(--red)',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Clear Keys
                  </button>
                )}
              </div>
            </form>
          )}

          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Analyst Session</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Credentials matching your active database profile.</p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Profile Email</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.email || 'N/A'}</div>
                </div>

                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Session Identity ID</div>
                  <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>{user?.id || 'demo-user-id'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    onClose();
                    window.location.href = '/account';
                  }}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--bg-tag)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: 'fit-content',
                    fontFamily: 'inherit'
                  }}
                >
                  <User size={14} />
                  <span>Open Account Dashboard</span>
                </button>

                <button
                  onClick={onLogOut}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--red-bg)',
                    color: 'var(--red)',
                    border: '1px solid var(--red-border)',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: 'fit-content'
                  }}
                >
                  <LogOut size={14} />
                  <span>Terminate Session (Sign Out)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
