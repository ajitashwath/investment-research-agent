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

// Mock Database for fallback demo mode
const getLocalUsers = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('alpha_local_users') || '[]')
  } catch {
    return []
  }
}

const saveLocalUsers = (users) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('alpha_local_users', JSON.stringify(users))
}

const getLocalSession = () => {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem('alpha_local_session') || 'null')
  } catch {
    return null
  }
}

const saveLocalSession = (user) => {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem('alpha_local_session', JSON.stringify(user))
  } else {
    localStorage.removeItem('alpha_local_session')
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
      
      const newUser = {
        id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
        email,
        password, // saved in plaintext for demo only, ok for local fallback mock
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
      const user = users.find(u => u.email === email && u.password === password)
      
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
