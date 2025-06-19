import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { generateObject } from 'ai'
import { deepseek } from '@ai-sdk/deepseek'
import { z } from 'zod'

// AI回复模式
const AIResponseSchema = z.object({
  content: z.string().describe('AI助手的回复内容'),
  needsWebSearch: z.boolean().describe('是否需要网络搜索来提供更准确的答案')
})

// 处理聊天消息并生成AI回复
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return Response.json({ error: 'AI服务未配置' }, { status: 500 })
    }

    const { sessionId, message, webSearchEnabled = false } = await req.json()

    if (!sessionId || !message) {
      return Response.json({ error: '会话ID和消息内容是必需的' }, { status: 400 })
    }

    // 验证会话是否属于当前用户
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 10 // 获取最近10条消息作为上下文
        }
      }
    })

    if (!chatSession) {
      return Response.json({ error: '聊天会话不存在' }, { status: 404 })
    }

    // 保存用户消息
    const userMessage = await prisma.message.create({
      data: {
        sessionId,
        role: 'user',
        content: message
      }
    })

    // 构建对话历史
    const conversationHistory = chatSession.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))
    
    // 添加当前用户消息
    conversationHistory.push({ role: 'user', content: message })

    let searchResults = null
    
    // 如果启用了网络搜索，先执行搜索
    if (webSearchEnabled) {
      try {
        const searchResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/ai/web-search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: message })
        })
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          searchResults = searchData.results
        }
      } catch (error) {
        console.error('网络搜索失败:', error)
      }
    }

    // 构建AI提示词
    let prompt = `你是Ares，一个智能助手。请根据用户的消息提供有用的回复。

对话历史：
${conversationHistory.slice(-5).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

`

    if (searchResults && searchResults.length > 0) {
      prompt += `网络搜索结果：
${searchResults.map((result: any) => `标题: ${result.title}\n内容: ${result.snippet}`).join('\n\n')}\n\n`
    }

    prompt += `请基于以上信息回复用户的最新消息。回复要自然、有用且符合Ares助手的身份。`

    // 生成AI回复
    const { object } = await generateObject({
      model: deepseek('deepseek-chat'),
      schema: AIResponseSchema,
      prompt
    })

    // 保存AI回复
    const assistantMessage = await prisma.message.create({
      data: {
        sessionId,
        role: 'assistant',
        content: object.content,
        searchResults: searchResults ? JSON.stringify(searchResults) : null
      }
    })

    // 更新会话标题（如果是第一条消息）
    if (chatSession.messages.length === 0) {
      const title = message.slice(0, 20) + (message.length > 20 ? '...' : '')
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { 
          title,
          updatedAt: new Date()
        }
      })
    } else {
      // 只更新最后更新时间
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      })
    }

    return Response.json({ 
      userMessage,
      assistantMessage: {
        ...assistantMessage,
        searchResults
      }
    })
  } catch (error) {
    console.error('处理聊天消息失败:', error)
    return Response.json({ error: '处理聊天消息失败' }, { status: 500 })
  }
}