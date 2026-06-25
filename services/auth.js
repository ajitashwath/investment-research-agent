import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// We only consider Supabase configured if valid placeholder names are replaced
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your_supabase') && 
  !supabaseAnonKey.includes('your_supabase')
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper functions for base64 encoding/decoding of Unicode strings
function base64Encode(str) {
  if (typeof window === 'undefined') return ''
  return btoa(unescape(encodeURIComponent(str)))
}

function base64Decode(str) {
  if (typeof window === 'undefined') return ''
  return decodeURIComponent(escape(atob(str)))
}

// Password hashing function (SHA-256 via Web Crypto API)
async function hashPassword(password) {
  if (typeof window === 'undefined') return password
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (err) {
    console.error('Password hashing failed, falling back to plaintext:', err)
    return password
  }
}

// Mock JWT helpers for mock session tokens
const createMockJWT = (user) => {
  if (typeof window === 'undefined') return ''
  const header = base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64Encode(JSON.stringify({
    sub: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours validity
  }))
  const signature = 'mock-signature'
  return `${header}.${payload}.${signature}`
}

const parseMockJWT = (token) => {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(base64Decode(parts[1]))
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null // Token expired
    }
    return {
      id: payload.sub,
      email: payload.email,
      user_metadata: payload.user_metadata
    }
  } catch (err) {
    console.error('Failed to parse mock JWT token:', err)
    return null
  }
}

// Mock Database using sessionStorage for transient sandbox sessions
const getLocalUsers = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(sessionStorage.getItem('alpha_local_users') || '[]')
  } catch {
    return []
  }
}

const saveLocalUsers = (users) => {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('alpha_local_users', JSON.stringify(users))
}

const getLocalSession = () => {
  if (typeof window === 'undefined') return null
  const token = sessionStorage.getItem('alpha_local_token')
  return parseMockJWT(token)
}

const saveLocalSession = (user) => {
  if (typeof window === 'undefined') return
  if (user) {
    const token = createMockJWT(user)
    sessionStorage.setItem('alpha_local_token', token)
  } else {
    sessionStorage.removeItem('alpha_local_token')
  }
}

// Active listeners for auth changes
const listeners = new Set()

export const authService = {
  isSupabaseConfigured,
  
  async signUp(email, password, metadata = {}) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      })
      return { data, error }
    } else {
      // Mock Auth SignUp
      const users = getLocalUsers()
      if (users.some(u => u.email === email)) {
        return { data: null, error: { message: 'User already exists' } }
      }
      
      const hashedPassword = await hashPassword(password)
      const newUser = {
        id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
        email,
        password: hashedPassword,
        user_metadata: metadata,
        created_at: new Date().toISOString()
      }
      
      users.push(newUser)
      saveLocalUsers(users)
      
      const sessionUser = { id: newUser.id, email: newUser.email, user_metadata: newUser.user_metadata }
      saveLocalSession(sessionUser)
      
      // Notify listeners
      listeners.forEach(cb => cb('SIGNED_IN', sessionUser))
      
      return { data: { user: sessionUser }, error: null }
    }
  },
  
  async signIn(email, password) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } else {
      // Mock Auth SignIn
      const users = getLocalUsers()
      const hashedPassword = await hashPassword(password)
      const user = users.find(u => u.email === email && u.password === hashedPassword)
      
      if (!user) {
        return { data: null, error: { message: 'Invalid email or password' } }
      }
      
      const sessionUser = { id: user.id, email: user.email, user_metadata: user.user_metadata }
      saveLocalSession(sessionUser)
      
      // Notify listeners
      listeners.forEach(cb => cb('SIGNED_IN', sessionUser))
      
      return { data: { user: sessionUser }, error: null }
    }
  },

  async signInDemo() {
    if (isSupabaseConfigured) {
      return { data: null, error: { message: 'Demo bypass is not available when Supabase is active' } }
    } else {
      const demoUser = {
        id: 'demo-user',
        email: 'demo@alphalens.io',
        user_metadata: { full_name: 'Demo Analyst' }
      }
      saveLocalSession(demoUser)
      listeners.forEach(cb => cb('SIGNED_IN', demoUser))
      return { data: { user: demoUser }, error: null }
    }
  },
  
  async signOut() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut()
      return { error }
    } else {
      saveLocalSession(null)
      listeners.forEach(cb => cb('SIGNED_OUT', null))
      return { error: null }
    }
  },
  
  async getUser() {
    if (isSupabaseConfigured) {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } else {
      const user = getLocalSession()
      return { user, error: null }
    }
  },
  
  onAuthStateChange(callback) {
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session?.user || null)
      })
      return () => subscription.unsubscribe()
    } else {
      listeners.add(callback)
      // Call once with current state
      const currentUser = getLocalSession()
      callback(currentUser ? 'SIGNED_IN' : 'INITIAL_SESSION', currentUser)
      
      return () => {
        listeners.delete(callback)
      }
    }
  }
}
