import { createDeepSeek } from "@ai-sdk/deepseek"
import { generateObject } from "ai"
import { z } from "zod"
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { saveDocumentContent } from '@/lib/supabase-storage'

// 使用正确的DeepSeek SDK创建客户端
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
})

const DocumentAnalysisSchema = z.object({
  title: z.string().describe("文档标题"),
  summary: z.string().describe("文档摘要，控制在200字以内"),
  category: z.enum(["日常", "工作", "学习", "其他"]).describe("文档分类"),
  tags: z.array(z.string()).describe("关键词标签"),
  keyPoints: z.array(z.string()).describe("关键要点，3-5个"),
  actionItems: z.array(z.string()).describe("可执行的行动项"),
  documentType: z.string().describe("文档类型：报告、方案、笔记、资料等"),
})

export async function POST(req: Request) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return Response.json({ error: "文件是必填的" }, { status: 400 })
    }

    const userId = session.user.id

    // 增加文件大小限制到 25MB
    if (file.size > 25 * 1024 * 1024) {
      return Response.json({ error: "文件大小不能超过 25MB" }, { status: 400 })
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return Response.json({ error: "AI服务未配置" }, { status: 500 })
    }

    // 读取文件内容
    const content = await file.text()

    // 增加内容长度限制
    if (content.length > 200000) {
      return Response.json({ error: "文件内容过长，请上传小于200KB的文件" }, { status: 400 })
    }

    console.log(`Analyzing document for user ${userId}`)

    try {
      // AI分析文档内容
      console.log("Starting AI analysis with DeepSeek SDK")
      
      try {
        const { object } = await generateObject({
          model: deepseek("deepseek-chat"),
          schema: DocumentAnalysisSchema,
          prompt: `
请分析以下文档内容，将其结构化处理：

文档名称：${file.name}
文档内容：
${content}

要求：
1. 生成合适的文档标题
2. 写一个200字以内的摘要
3. 确定文档分类（日常、工作、学习、其他）
4. 提取关键词标签
5. 总结3-5个关键要点
6. 识别可执行的行动项
7. 判断文档类型

请用中文回复，分析要准确且实用。
          `,
        })
        
        if (!object) {
          console.error("AI analysis returned empty result")
          return Response.json({ error: "AI分析失败，请稍后重试" }, { status: 500 })
        }

        // 创建文档记录
        const document = await prisma.document.create({
          data: {
            userId,
            fileName: file.name,
            fileSize: file.size,
            // 不再存储原始内容在数据库中
            originalContent: "", // 保留字段但不存储内容
            title: object.title,
            summary: object.summary,
            category: object.category,
            tags: JSON.stringify(object.tags),
            keyPoints: JSON.stringify(object.keyPoints),
            actionItems: JSON.stringify(object.actionItems),
            documentType: object.documentType,
          }
        })

        console.log(`Document created with ID: ${document.id}`)

        // 将文档内容保存到Supabase存储
        try {
          await saveDocumentContent(userId, document.id, content)
          console.log(`Document content saved to Supabase storage: ${document.id}`)
        } catch (storageError) {
          console.error("Failed to save document content to Supabase storage:", storageError)
          return Response.json({ error: "保存文档内容失败" }, { status: 500 })
        }

        // 保存到Notion（如果用户已授权）
        try {
          await saveDocumentToNotion(userId, document)
        } catch (error) {
          console.error("Failed to save document to Notion:", error)
        }

        return Response.json({
          success: true,
          document: {
            ...document,
            tags: object.tags,
            keyPoints: object.keyPoints,
            actionItems: object.actionItems,
          },
        })
      } catch (aiAnalysisError: unknown) {
        console.error("Error during AI analysis:", aiAnalysisError)
        return Response.json({ error: "AI分析文档失败: " + (aiAnalysisError as Error).message }, { status: 500 })
      }
    } catch (aiError: unknown) {
      console.error("AI分析文档失败:", aiError)
      return Response.json({ error: "AI分析文档失败，请稍后重试" }, { status: 500 })
    }
  } catch (error: unknown) {
    console.error("Error processing document:", error)
    return Response.json({ error: "处理文档失败" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // 只获取当前用户的文档
    const documents = await prisma.document.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
    })

    // 处理JSON字符串字段
    const processedDocuments = documents.map(doc => ({
      ...doc,
      tags: JSON.parse(doc.tags || '[]'),
      keyPoints: JSON.parse(doc.keyPoints || '[]'),
      actionItems: JSON.parse(doc.actionItems || '[]'),
    }))

    const totalDocuments = await prisma.document.count({
      where: {
        userId
      }
    })

    return Response.json({
      documents: processedDocuments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDocuments / limit),
        totalDocuments
      }
    })
  } catch (error: unknown) {
    console.error("Error fetching documents:", error)
    return Response.json({ error: "获取文档失败" }, { status: 500 })
  }
}

// 保存到Notion的函数
async function saveDocumentToNotion(userId: string, document: any) {
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
  console.log(`Saving document ${document.id} to Notion for user ${userId}`)
}
