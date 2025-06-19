import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

// 保存聊天消息
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const { sessionId, role, content, searchResults } = await req.json()

    // 验证会话是否属于当前用户
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      }
    })

    if (!chatSession) {
      return Response.json({ error: '聊天会话不存在' }, { status: 404 })
    }

    // 创建消息
    const message = await prisma.message.create({
      data: {
        sessionId,
        role,
        content,
        searchResults: searchResults ? JSON.stringify(searchResults) : null
      }
    })

    // 更新会话的最后更新时间
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    })

    return Response.json({ message })
  } catch (error) {
    console.error('保存消息失败:', error)
    return Response.json({ error: '保存消息失败' }, { status: 500 })
  }
}

// 获取会话的消息列表
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return Response.json({ error: '会话ID是必需的' }, { status: 400 })
    }

    // 验证会话是否属于当前用户
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      }
    })

    if (!chatSession) {
      return Response.json({ error: '聊天会话不存在' }, { status: 404 })
    }

    const messages = await prisma.message.findMany({
      where: {
        sessionId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // 解析搜索结果JSON
    const messagesWithParsedResults = messages.map((msg: any) => ({
      ...msg,
      searchResults: msg.searchResults ? JSON.parse(msg.searchResults) : null
    }))

    return Response.json({ messages: messagesWithParsedResults })
  } catch (error) {
    console.error('获取消息失败:', error)
    return Response.json({ error: '获取消息失败' }, { status: 500 })
  }
}