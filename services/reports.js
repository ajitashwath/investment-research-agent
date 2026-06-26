import { supabase, isSupabaseConfigured } from './auth.js'

export const reportsService = {
  async saveReport(userId, ticker, companyName, resultData) {
    if (!userId) return { data: null, error: 'User ID is required' }

    const report = {
      user_id: userId,
      ticker: ticker || 'UNKNOWN',
      company_name: companyName || ticker || 'Unknown Company',
      verdict: resultData?.decision?.verdict || resultData?.decision?.scores?.valuation || 'N/A',
      score: resultData?.decision?.scores?.valuation || resultData?.risks?.riskScore || 50,
      summary: resultData?.decision?.reasoning || resultData?.company?.description || 'No summary available.',
      report_text: resultData?.report || '',
      created_at: new Date().toISOString()
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('investment_reports')
          .insert([report])
          .select()
        
        if (!error) {
          return { data, error: null }
        }
        
        // Log warning and fall back to local storage
        console.warn('Supabase insert failed, using localStorage fallback:', error.message)
      } catch (err) {
        console.warn('Supabase exception, using localStorage fallback:', err)
      }
    }

    // Local Storage Fallback
    try {
      const reports = JSON.parse(localStorage.getItem(`alpha_reports_${userId}`) || '[]')
      const newReport = {
        id: 'local-' + Math.random().toString(36).substring(2, 9),
        ...report
      }
      reports.unshift(newReport)
      localStorage.setItem(`alpha_reports_${userId}`, JSON.stringify(reports.slice(0, 50)))
      return { data: [newReport], error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  async getReports(userId) {
    if (!userId) return { data: [], error: 'User ID is required' }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('investment_reports')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (!error) {
          return { data, error: null }
        }
        console.warn('Supabase select failed, using localStorage fallback:', error.message)
      } catch (err) {
        console.warn('Supabase exception, using localStorage fallback:', err)
      }
    }

    // Local Storage Fallback
    try {
      const reports = JSON.parse(localStorage.getItem(`alpha_reports_${userId}`) || '[]')
      return { data: reports, error: null }
    } catch (err) {
      return { data: [], error: err }
    }
  },

  async deleteReport(userId, reportId) {
    if (!userId) return { error: 'User ID is required' }

    if (isSupabaseConfigured && supabase) {
      try {
        // If it's a supabase report (doesn't start with 'local-')
        if (!reportId.startsWith('local-')) {
          const { error } = await supabase
            .from('investment_reports')
            .delete()
            .eq('id', reportId)
          
          if (!error) {
            return { error: null }
          }
          console.warn('Supabase delete failed, using localStorage fallback:', error.message)
        }
      } catch (err) {
        console.warn('Supabase delete exception, using localStorage fallback:', err)
      }
    }

    // Local Storage Fallback
    try {
      let reports = JSON.parse(localStorage.getItem(`alpha_reports_${userId}`) || '[]')
      reports = reports.filter(r => r.id !== reportId)
      localStorage.setItem(`alpha_reports_${userId}`, JSON.stringify(reports))
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }
}
