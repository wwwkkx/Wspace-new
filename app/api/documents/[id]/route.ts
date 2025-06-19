import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getDocumentContent, saveDocumentContent, deleteDocumentContent } from '@/lib/supabase-storage'

// 获取单个文档
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id

    console.log(`Fetching document with ID: ${documentId}`)

    // 从Prisma数据库中查找文档
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      console.log(`Document not found: ${documentId}`)
      return Response.json({ error: "文档不存在" }, { status: 404 })
    }

    console.log(`Document found: ${document.title}`)

    // 从Supabase存储中获取文档内容
    let content = ""
    try {
      content = await getDocumentContent(document.userId, documentId)
    } catch (storageError) {
      console.error("Failed to get document content from Supabase storage:", storageError)
      // 如果无法从存储中获取，尝试从数据库中获取（兼容旧数据）
      content = document.originalContent || ""
    }

    // 处理JSON字符串字段
    const processedDocument = {
      ...document,
      tags: JSON.parse(document.tags),
      keyPoints: JSON.parse(document.keyPoints),
      actionItems: JSON.parse(document.actionItems),
      originalContent: content, // 添加从Supabase获取的内容
    }

    return Response.json(processedDocument)
  } catch (error) {
    console.error("Error fetching document:", error)
    return Response.json({ error: "获取文档失败" }, { status: 500 })
  }
}

// 更新文档
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id
    const { content } = await req.json()

    // 查找文档
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return Response.json({ error: "文档不存在" }, { status: 404 })
    }

    // 将内容保存到Supabase存储
    try {
      await saveDocumentContent(document.userId, documentId, content)
      console.log(`Document content saved to Supabase storage: ${documentId}`)
    } catch (storageError) {
      console.error("Failed to save document content to Supabase storage:", storageError)
      return Response.json({ error: "保存文档内容失败" }, { status: 500 })
    }

    // 更新文档元数据（不再存储内容在数据库中）
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        originalContent: "", // 不再存储内容在数据库中
        updatedAt: new Date(), // 更新修改时间
      }
    })

    console.log(`Document updated: ${documentId}`)

    // 处理JSON字符串字段
    const processedDocument = {
      ...updatedDocument,
      tags: JSON.parse(updatedDocument.tags),
      keyPoints: JSON.parse(updatedDocument.keyPoints),
      actionItems: JSON.parse(updatedDocument.actionItems),
      originalContent: undefined, // 不返回原始内容以节省带宽
    }

    return Response.json({
      success: true,
      document: processedDocument,
    })
  } catch (error) {
    console.error("Error updating document:", error)
    return Response.json({ error: "更新文档失败" }, { status: 500 })
  }
}

// 删除文档
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }
    
    const documentId = params.id

    // 查找文档并验证所有权
    const document = await prisma.document.findFirst({
      where: { 
        id: documentId,
        userId: session.user.id
      }
    })

    if (!document) {
      return Response.json({ error: "文档不存在或无权访问" }, { status: 404 })
    }

    // 从Supabase存储中删除文档内容
    try {
      await deleteDocumentContent(session.user.id, documentId)
      console.log(`Document content deleted from Supabase storage: ${documentId}`)
    } catch (storageError) {
      console.error("Failed to delete document content from Supabase storage:", storageError)
      // 继续删除数据库记录，即使存储删除失败
    }

    // 删除数据库中的文档记录
    await prisma.document.delete({
      where: { id: documentId }
    })
    console.log(`Document deleted: ${documentId}`)

    return Response.json({ success: true })

  } catch (error) {
    console.error("Error deleting document:", error)
    return Response.json({ error: "删除文档失败" }, { status: 500 })
  }
}
