import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

// 获取AI配置
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查是否为管理员（这里简化处理，实际应该有更严格的权限控制）
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.email !== 'admin@example.com') {
      return Response.json({ error: '权限不足' }, { status: 403 })
    }

    // 获取AI配置
    const configs = await prisma.aiConfig.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ configs })
  } catch (error) {
    console.error('获取AI配置失败:', error)
    return Response.json({ error: '获取AI配置失败' }, { status: 500 })
  }
}

// 保存AI配置
export async function POST(req: NextRequest) {
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

    const { name, endpoint, apiKey, model } = await req.json()

    if (!name || !endpoint || !apiKey || !model) {
      return Response.json({ error: '所有字段都是必需的' }, { status: 400 })
    }

    // 创建AI配置
    const config = await prisma.aiConfig.create({
      data: {
        name,
        endpoint,
        apiKey,
        model,
        status: 'active'
      }
    })

    return Response.json({ config })
  } catch (error) {
    console.error('保存AI配置失败:', error)
    return Response.json({ error: '保存AI配置失败' }, { status: 500 })
  }
}

// 更新AI配置
export async function PUT(req: NextRequest) {
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

    const { id, name, endpoint, apiKey, model } = await req.json()

    if (!id || !name || !endpoint || !apiKey || !model) {
      return Response.json({ error: '所有字段都是必需的' }, { status: 400 })
    }

    // 更新AI配置
    const config = await prisma.aiConfig.update({
      where: { id },
      data: {
        name,
        endpoint,
        apiKey,
        model,
        updatedAt: new Date()
      }
    })

    return Response.json({ config })
  } catch (error) {
    console.error('更新AI配置失败:', error)
    return Response.json({ error: '更新AI配置失败' }, { status: 500 })
  }
}

// 删除AI配置
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'ID是必需的' }, { status: 400 })
    }

    // 删除AI配置
    await prisma.aiConfig.delete({
      where: { id }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('删除AI配置失败:', error)
    return Response.json({ error: '删除AI配置失败' }, { status: 500 })
  }
}