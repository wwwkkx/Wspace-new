/**
 * 运行Supabase数据库架构脚本
 * 此脚本用于在Supabase数据库中创建所需的表和关系
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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

async function runSchema() {
  try {
    // 读取SQL脚本文件
    const schemaPath = path.join(process.cwd(), 'scripts', 'supabase-schema.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')

    console.log('正在执行Supabase数据库架构脚本...')

    // 执行SQL脚本
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSql })

    if (error) {
      console.error('执行SQL脚本时出错:', error)
      process.exit(1)
    }

    console.log('Supabase数据库架构脚本执行成功!')
    console.log('数据库表和关系已创建。')
  } catch (error) {
    console.error('运行架构脚本时出错:', error)
    process.exit(1)
  }
}

runSchema()