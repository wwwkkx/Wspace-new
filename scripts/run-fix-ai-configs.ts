/**
 * 运行修复ai_configs表的SQL脚本
 * 此脚本用于修改Supabase数据库中ai_configs表的结构，使其与Prisma模型兼容
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

// 获取环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('错误: 缺少必要的环境变量。请确保设置了 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// 创建Supabase客户端（使用服务角色密钥以获得完全权限）
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runFixScript() {
  try {
    // 读取SQL脚本文件
    const scriptPath = path.join(process.cwd(), 'scripts', 'fix-ai-configs.sql')
    const fixSql = fs.readFileSync(scriptPath, 'utf8')

    console.log('正在执行ai_configs表修复脚本...')

    // 执行SQL脚本
    const { error } = await supabase.rpc('exec_sql', { sql: fixSql })

    if (error) {
      console.error('执行SQL脚本时出错:', error)
      process.exit(1)
    }

    console.log('ai_configs表修复脚本执行成功!')
    console.log('表结构已更新，现在应该与Prisma模型兼容。')
  } catch (error) {
    console.error('运行修复脚本时出错:', error)
    process.exit(1)
  }
}

runFixScript()
