import { generateObject } from "ai"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { z } from "zod"
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

// 使用正确的DeepSeek SDK创建客户端
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
})

const NoteAnalysisSchema = z.object({
  title: z.string().describe("笔记标题，简洁有吸引力"),
  summary: z.string().describe("内容摘要，提炼核心要点"),
  category: z.enum(["日常", "工作", "学习", "其他"]).describe("内容分类"),
  tags: z.array(z.string()).describe("关键词标签，3-5个"),
  priority: z.enum(["低", "中", "高"]).describe("重要程度"),
  actionItems: z.array(z.string()).describe("可执行的行动项"),
  insights: z.array(z.string()).describe("深度洞察和思考点"),
})

export async function POST(req: Request) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const { content } = await req.json()

    if (!content) {
      return Response.json({ error: "内容是必填的" }, { status: 400 })
    }

    const userId = session.user.id

    if (!process.env.DEEPSEEK_API_KEY) {
      return Response.json({ error: "AI服务未配置" }, { status: 500 })
    }

    console.log(`Analyzing note for user ${userId}`)

    try {
      // AI分析笔记内容
      const { object } = await generateObject({
        model: deepseek("deepseek-chat"),
        schema: NoteAnalysisSchema,
        prompt: `
请分析以下笔记内容，将其结构化处理：

笔记内容：
${content}

要求：
1. 生成一个简洁有吸引力的标题
2. 提炼内容的核心摘要
3. 确定内容分类（日常、工作、学习、其他）
4. 提取3-5个关键词标签
5. 评估重要程度（低、中、高）
6. 识别可执行的行动项
7. 提供深度洞察和思考点

请用中文回复，分析要准确且实用。
        `,
      })

      // 创建笔记记录
      const note = await prisma.note.create({
        data: {
          userId,
          originalContent: content,
          title: object.title,
          summary: object.summary,
          category: object.category,
          tags: JSON.stringify(object.tags),
          priority: object.priority,
          actionItems: JSON.stringify(object.actionItems),
          insights: JSON.stringify(object.insights),
        }
      })

      // 保存到Notion（如果用户已授权）
      try {
        await saveToNotion(userId, note as { id: string })
      } catch (error) {
        console.error("Failed to save to Notion:", error)
        // 不影响主流程，继续返回成功
      }
      return Response.json({
        success: true,
        note: {
          ...note,
          tags: object.tags,
          actionItems: object.actionItems,
          insights: object.insights,
        },
      })
    } catch (aiError) {
      console.error("AI分析笔记失败:", aiError)
      return Response.json({ error: "AI分析笔记失败，请稍后重试" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating note:", error)
    return Response.json({ error: "创建笔记失败" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const userId = session.user.id

    // 构建查询条件
    const where = {
      userId,
      ...(category ? { category } : {}),
    }

    // 获取笔记总数
    const total = await prisma.note.count({ where })

    // 获取分页笔记
    const notes = await prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    // 处理JSON字符串字段
    const processedNotes = notes.map((note: { tags: string; actionItems: string; insights: string }) => ({
      ...note,
      tags: JSON.parse(note.tags),
      actionItems: JSON.parse(note.actionItems),
      insights: JSON.parse(note.insights),
    }))

    return Response.json({
      success: true,
      notes: processedNotes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching notes:", error)
    return Response.json({ error: "获取笔记失败" }, { status: 500 })
  }
}

// 保存到Notion的函数
async function saveToNotion(userId: string, note: any) {
  // 检查用户是否已授权Notion
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notionToken: true, notionDatabaseId: true }
  })

  if (!user?.notionToken || !user?.notionDatabaseId) {
    console.log(`User ${userId} has not connected Notion`)
    return
  }

  // 这里应该实现实际的Notion API调用
  // 由于这超出了当前任务范围，我们只记录一条日志
  console.log(`Saving note ${note.id} to Notion for user ${userId}`)
}
