'use client'

import { useState, useEffect } from 'react'
import { authService } from '../services/auth.js'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Palette, Settings, Key, User, LogOut, Check, Terminal } from 'lucide-react'

// Theme definition matching CSS variable injection
export const applyTheme = (themeName) => {
  const themes = {
    cyberpunk: {
      '--bg': '#000000',
      '--bg-card': 'rgba(255, 255, 255, 0.02)',
      '--bg-sidebar': 'rgba(255, 255, 255, 0.01)',
      '--border': 'rgba(255, 255, 255, 0.08)',
      '--border-light': 'rgba(255, 255, 255, 0.04)',
      '--text-primary': '#ffffff',
      '--text-secondary': '#cbd5e1',
      '--text-muted': '#52525b',
      '--text-sidebar': '#cbd5e1',
      '--accent': '#ffffff',
      '--accent-light': 'rgba(255, 255, 255, 0.08)',
      '--green': '#34d399',
      '--green-bg': 'rgba(52, 211, 153, 0.04)',
      '--green-border': 'rgba(52, 211, 153, 0.08)',
      '--red': '#f87171',
      '--red-bg': 'rgba(248, 113, 113, 0.04)',
      '--red-border': 'rgba(248, 113, 113, 0.08)',
      '--amber': '#fde047',
      '--amber-bg': 'rgba(253, 224, 71, 0.04)',
      '--amber-border': 'rgba(253, 224, 71, 0.08)',
      '--blue': '#cbd5e1',
      '--blue-bg': 'rgba(255, 255, 255, 0.04)',
      '--blue-border': 'rgba(255, 255, 255, 0.08)',
      '--purple': '#cbd5e1',
      '--purple-bg': 'rgba(255, 255, 255, 0.04)',
      '--shadow-card': '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    },
    amber: {
      '--bg': '#0a0b0d',
      '--bg-card': 'rgba(255, 255, 255, 0.02)',
      '--bg-sidebar': 'rgba(255, 255, 255, 0.01)',
      '--border': 'rgba(255, 255, 255, 0.06)',
      '--border-light': 'rgba(255, 255, 255, 0.03)',
      '--text-primary': '#ffffff',
      '--text-secondary': '#94a3b8',
      '--text-muted': 'rgba(255, 255, 255, 0.5)',
      '--text-sidebar': '#cbd5e1',
      '--accent': '#cbd5e1',
      '--accent-light': 'rgba(255, 255, 255, 0.08)',
      '--green': '#34d399',
      '--green-bg': 'rgba(52, 211, 153, 0.04)',
      '--green-border': 'rgba(52, 211, 153, 0.08)',
      '--red': '#f87171',
      '--red-bg': 'rgba(248, 113, 113, 0.04)',
      '--red-border': 'rgba(248, 113, 113, 0.08)',
      '--amber': '#cbd5e1',
      '--amber-bg': 'rgba(255, 255, 255, 0.04)',
      '--amber-border': 'rgba(255, 255, 255, 0.08)',
      '--blue': '#cbd5e1',
      '--blue-bg': 'rgba(255, 255, 255, 0.04)',
      '--blue-border': 'rgba(255, 255, 255, 0.08)',
      '--purple': '#94a3b8',
      '--purple-bg': 'rgba(255, 255, 255, 0.04)',
      '--shadow-card': '0 8px 32px rgba(0, 0, 0, 0.35)'
    },
    emerald: {
      '--bg': '#080808',
      '--bg-card': '#121212',
      '--bg-sidebar': '#0e0e0e',
      '--border': '#222222',
      '--border-light': '#1a1a1a',
      '--text-primary': '#ffffff',
      '--text-secondary': '#a3a3a3',
      '--text-muted': '#525252',
      '--text-sidebar': '#a3a3a3',
      '--accent': '#ffffff',
      '--accent-light': 'rgba(255, 255, 255, 0.05)',
      '--green': '#a3a3a3',
      '--green-bg': 'rgba(255, 255, 255, 0.02)',
      '--green-border': '#222222',
      '--red': '#a3a3a3',
      '--red-bg': 'rgba(255, 255, 255, 0.02)',
      '--red-border': '#222222',
      '--amber': '#a3a3a3',
      '--amber-bg': 'rgba(255, 255, 255, 0.02)',
      '--amber-border': '#222222',
      '--blue': '#a3a3a3',
      '--blue-bg': 'rgba(255, 255, 255, 0.02)',
      '--blue-border': '#222222',
      '--purple': '#a3a3a3',
      '--purple-bg': 'rgba(255, 255, 255, 0.02)',
      '--shadow-card': 'none'
    },
    silver: {
      '--bg': '#101011',
      '--bg-card': 'rgba(28, 28, 30, 0.65)',
      '--bg-sidebar': 'rgba(20, 20, 22, 0.8)',
      '--border': 'rgba(255, 255, 255, 0.06)',
      '--border-light': 'rgba(255, 255, 255, 0.03)',
      '--text-primary': '#ffffff',
      '--text-secondary': '#cbd5e1',
      '--text-muted': 'rgba(255, 255, 255, 0.5)',
      '--text-sidebar': '#cbd5e1',
      '--accent': '#ffffff',
      '--accent-light': 'rgba(255, 255, 255, 0.08)',
      '--green': '#30d158',
      '--green-bg': 'rgba(48, 209, 88, 0.06)',
      '--green-border': 'rgba(48, 209, 88, 0.12)',
      '--red': '#ff453a',
      '--red-bg': 'rgba(255, 69, 58, 0.06)',
      '--red-border': 'rgba(255, 69, 58, 0.12)',
      '--amber': '#ff9f0a',
      '--amber-bg': 'rgba(255, 159, 10, 0.06)',
      '--amber-border': 'rgba(255, 159, 10, 0.12)',
      '--blue': '#0a84ff',
      '--blue-bg': 'rgba(10, 132, 255, 0.06)',
      '--blue-border': 'rgba(10, 132, 255, 0.12)',
      '--purple': '#bf5af2',
      '--purple-bg': 'rgba(191, 90, 242, 0.06)',
      '--shadow-card': '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    }
  }

  const root = document.documentElement
  const styles = themes[themeName] || themes.cyberpunk
  
  Object.keys(styles).forEach((key) => {
    root.style.setProperty(key, styles[key])
  })
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('alpha_terminal_theme', themeName)
  }
}

export default function SettingsModal({ isOpen, onClose, user, onLogOut }) {
  const [activeTab, setActiveTab] = useState('appearance')
  const [theme, setTheme] = useState('cyberpunk')
  const [model, setModel] = useState('gemini-2.5-flash-lite')
  const [depth, setDepth] = useState('advanced')
  const [geminiKey, setGeminiKey] = useState('')
  const [tavilyKey, setTavilyKey] = useState('')
  const [keysSaved, setKeysSaved] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('alpha_terminal_theme') || 'cyberpunk'
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
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
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
                  { id: 'cyberpunk', label: 'Obsidian Monochrome', desc: 'Obsidian glass & silver', color: '#ffffff' },
                  { id: 'amber', label: 'Slate Monochrome', desc: 'Dark slate glassmorphism', color: '#cbd5e1' },
                  { id: 'emerald', label: 'Stealth Matte', desc: 'Minimalist flat dark matte', color: '#71717a' },
                  { id: 'silver', label: 'Apple Classic Silver', desc: 'Premium brushed steel', color: '#a1a1aa' }
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
          )}
        </div>
      </motion.div>
    </div>
  )
}
