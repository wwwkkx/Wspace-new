// 模拟笔记数据库 - 应该与 notes/route.ts 共享
import { generateObject } from "ai"
import { z } from "zod"
import { prisma } from '@/lib/db'
import { createOpenAI } from '@ai-sdk/openai'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
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

// 获取单个笔记
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const noteId = params.id

    console.log(`Fetching note with ID: ${noteId}`)

    // 从数据库中查找笔记并验证所有权
    const note = await prisma.note.findFirst({
      where: { 
        id: noteId,
        userId: session.user.id
      }
    })

    if (!note) {
      console.log(`Note not found or access denied: ${noteId}`)
      return Response.json({ error: "笔记不存在或无权访问" }, { status: 404 })
    }

    console.log(`Note found: ${note.title}`)

    // 处理JSON字符串字段
    const processedNote = {
      ...note,
      tags: JSON.parse(note.tags),
      actionItems: JSON.parse(note.actionItems),
      insights: JSON.parse(note.insights),
    }

    return Response.json(processedNote)
  } catch (error) {
    console.error("Error fetching note:", error)
    return Response.json({ error: "获取笔记失败" }, { status: 500 })
  }
}

// 更新笔记
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const noteId = params.id
    const { content } = await req.json()

    if (!content) {
      return Response.json({ error: "内容不能为空" }, { status: 400 })
    }

    // 查找笔记并验证所有权
    const existingNote = await prisma.note.findFirst({
      where: { 
        id: noteId,
        userId: session.user.id
      }
    })

    if (!existingNote) {
      return Response.json({ error: "笔记不存在或无权访问" }, { status: 404 })
    }

    // 如果内容有变化，重新进行AI分析
    let updatedData: any = {
      originalContent: content,
      updatedAt: new Date(),
    }

    if (content !== existingNote.originalContent && process.env.DEEPSEEK_API_KEY) {
      try {
        console.log(`Re-analyzing note content for note ${noteId}`)
        
        // AI重新分析笔记内容
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

        updatedData = {
          ...updatedData,
          title: object.title,
          summary: object.summary,
          category: object.category,
          tags: JSON.stringify(object.tags),
          priority: object.priority,
          actionItems: JSON.stringify(object.actionItems),
          insights: JSON.stringify(object.insights),
        }
      } catch (aiError) {
        console.error("AI analysis failed during update:", aiError)
        // 继续更新，但不更新AI分析的字段
      }
    }

    // 更新笔记
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: updatedData
    })

    console.log(`Note updated: ${noteId}`)

    // 处理JSON字符串字段
    const processedNote = {
      ...updatedNote,
      tags: JSON.parse(updatedNote.tags),
      actionItems: JSON.parse(updatedNote.actionItems),
      insights: JSON.parse(updatedNote.insights),
    }

    return Response.json({
      success: true,
      note: processedNote,
    })
  } catch (error) {
    console.error("Error updating note:", error)
    return Response.json({ error: "更新笔记失败" }, { status: 500 })
  }
}

// 删除笔记
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    const noteId = params.id

    // 查找笔记并验证所有权
    const existingNote = await prisma.note.findFirst({
      where: { 
        id: noteId,
        userId: session.user.id
      }
    })

    if (!existingNote) {
      return Response.json({ error: "笔记不存在或无权访问" }, { status: 404 })
    }

    // 真正删除笔记
    await prisma.note.delete({
      where: { id: noteId }
    })
    
    console.log(`Note deleted: ${noteId}`)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error deleting note:", error)
    return Response.json({ error: "删除笔记失败" }, { status: 500 })
  }
}
