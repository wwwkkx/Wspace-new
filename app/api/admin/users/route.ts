import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

// 获取所有用户
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查是否为管理员
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.email !== 'admin@example.com') {
      return Response.json({ error: '权限不足' }, { status: 403 })
    }

    // 获取所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ users })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return Response.json({ error: '获取用户列表失败' }, { status: 500 })
  }
}

// 创建用户
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查是否为管理员
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!adminUser || adminUser.email !== 'admin@example.com') {
      return Response.json({ error: '权限不足' }, { status: 403 })
    }

    const { name, email, password, role } = await req.json()

    if (!name || !email) {
      return Response.json({ error: '姓名和邮箱是必填字段' }, { status: 400 })
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return Response.json({ error: '该邮箱已被注册' }, { status: 400 })
    }

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: password ? await hashPassword(password) : null,
        // 其他字段可以根据需要添加
      }
    })

    return Response.json({ 
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      } 
    })
  } catch (error) {
    console.error('创建用户失败:', error)
    return Response.json({ error: '创建用户失败' }, { status: 500 })
  }
}

// 更新用户
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查是否为管理员
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!adminUser || adminUser.email !== 'admin@example.com') {
      return Response.json({ error: '权限不足' }, { status: 403 })
    }

    const { id, name, email, password, role } = await req.json()

    if (!id) {
      return Response.json({ error: '用户ID是必需的' }, { status: 400 })
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return Response.json({ error: '用户不存在' }, { status: 404 })
    }

    // 如果更改邮箱，检查新邮箱是否已被使用
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })
      
      if (emailExists) {
        return Response.json({ error: '该邮箱已被其他用户使用' }, { status: 400 })
      }
    }

    // 准备更新数据
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (password) updateData.password = await hashPassword(password)

    // 更新用户
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    })

    return Response.json({ 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        updatedAt: updatedUser.updatedAt
      } 
    })
  } catch (error) {
    console.error('更新用户失败:', error)
    return Response.json({ error: '更新用户失败' }, { status: 500 })
  }
}

// 删除用户
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查是否为管理员
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!adminUser || adminUser.email !== 'admin@example.com') {
      return Response.json({ error: '权限不足' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: '用户ID是必需的' }, { status: 400 })
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return Response.json({ error: '用户不存在' }, { status: 404 })
    }

    // 防止删除管理员账户
    if (existingUser.email === 'admin@example.com') {
      return Response.json({ error: '不能删除管理员账户' }, { status: 403 })
    }

    // 删除用户
    await prisma.user.delete({
      where: { id }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('删除用户失败:', error)
    return Response.json({ error: '删除用户失败' }, { status: 500 })
  }
}

// 密码哈希函数
async function hashPassword(password: string): Promise<string> {
  // 使用Web Crypto API
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}