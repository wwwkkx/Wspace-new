import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

// 获取用户的聊天会话列表
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return Response.json({ sessions: chatSessions })
  } catch (error) {
    console.error('获取聊天会话失败:', error)
    return Response.json({ error: '获取聊天会话失败' }, { status: 500 })
  }
}

// 创建新的聊天会话
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('创建会话 - 会话信息:', JSON.stringify(session))
    console.log('创建会话 - 用户ID:', session?.user?.id)
    console.log('创建会话 - 用户Email:', session?.user?.email)
    
    if (!session) {
      console.log('创建会话失败 - 未授权访问: 没有会话')
      return Response.json({ error: '未授权访问 - 请登录' }, { status: 401 })
    }
    
    if (!session.user) {
      console.log('创建会话失败 - 未授权访问: 会话中没有用户信息')
      return Response.json({ error: '未授权访问 - 会话中没有用户信息' }, { status: 401 })
    }
    
    if (!session.user.id) {
      console.log('创建会话失败 - 未授权访问: 用户ID不存在')
      return Response.json({ error: '未授权访问 - 用户ID不存在' }, { status: 401 })
    }

    const { title } = await req.json()
    console.log('创建会话 - 标题:', title)

    const chatSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        title: title || '新对话'
      },
      include: {
        messages: true
      }
    })

    console.log('创建会话成功:', chatSession)
    return Response.json({ session: chatSession })
  } catch (error) {
    console.error('创建会话失败:', error)
    return Response.json({ error: '创建会话失败' }, { status: 500 })
  }
}

// 删除聊天会话
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const { sessionId } = await req.json()

    if (!sessionId) {
      return Response.json({ error: '会话ID不能为空' }, { status: 400 })
    }

    // 验证会话是否属于当前用户
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      }
    })

    if (!chatSession) {
      return Response.json({ error: '会话不存在或无权限删除' }, { status: 404 })
    }

    // 删除会话相关的消息
    await prisma.message.deleteMany({
      where: { sessionId }
    })

    // 删除会话
    await prisma.chatSession.delete({
      where: { id: sessionId }
    })

    return Response.json({ 
      success: true,
      message: '会话删除成功'
    })
  } catch (error) {
    console.error('删除会话失败:', error)
    return Response.json({ error: '删除会话失败' }, { status: 500 })
  }
}