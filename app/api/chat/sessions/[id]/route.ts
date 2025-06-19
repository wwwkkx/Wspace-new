import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

// 获取单个聊天会话
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!chatSession) {
      return Response.json({ error: '聊天会话不存在' }, { status: 404 })
    }

    return Response.json({ session: chatSession })
  } catch (error) {
    console.error('获取聊天会话失败:', error)
    return Response.json({ error: '获取聊天会话失败' }, { status: 500 })
  }
}

// 更新聊天会话
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const { title } = await req.json()

    const chatSession = await prisma.chatSession.updateMany({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: {
        title,
        updatedAt: new Date()
      }
    })

    if (chatSession.count === 0) {
      return Response.json({ error: '聊天会话不存在' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('更新聊天会话失败:', error)
    return Response.json({ error: '更新聊天会话失败' }, { status: 500 })
  }
}

// 删除聊天会话
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    // 验证会话是否属于当前用户
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!chatSession) {
      return Response.json({ error: '聊天会话不存在或无权限删除' }, { status: 404 })
    }

    // 先删除会话相关的消息
    await prisma.message.deleteMany({
      where: {
        sessionId: params.id
      }
    })

    // 再删除会话
    await prisma.chatSession.delete({
      where: {
        id: params.id
      }
    })

    return Response.json({ 
      success: true,
      message: '会话删除成功'
    })
  } catch (error) {
    console.error('删除聊天会话失败:', error)
    return Response.json({ error: '删除聊天会话失败' }, { status: 500 })
  }
}