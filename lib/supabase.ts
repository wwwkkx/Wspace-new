import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// 从环境变量中获取Supabase URL和API密钥
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://shyafxbilqgbobygjjad.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeWFmeGJpbHFnYm9ieWdqamFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjU5NjcsImV4cCI6MjA2NTkwMTk2N30.BzusVsxB440zj_0lLrvC5g0aTl6M5EZc7JEYDK4GYzk'

// 创建Supabase客户端
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 创建服务端Supabase客户端（使用服务角色密钥，具有更高权限）
export const createServiceClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}