import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { getDocumentContent } from '@/lib/supabase-storage'

// 文档下载API
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id

    // 验证用户身份
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return Response.json({ error: '未授权访问' }, { status: 401 })
    }

    // 查找文档
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return Response.json({ error: "文档不存在" }, { status: 404 })
    }

    // 从Supabase存储中获取文档内容
    let content = ""
    try {
      content = await getDocumentContent(document.userId, documentId)
    } catch (storageError) {
      console.error("Failed to get document content from Supabase storage:", storageError)
      // 如果无法从存储中获取，尝试从数据库中获取（兼容旧数据）
      content = document.originalContent || ""
      
      if (!content) {
        return Response.json({ error: "文档内容不存在" }, { status: 404 })
      }
    }

    // 创建Blob并返回
    const blob = new Blob([content], { type: 'text/plain' })
    return new Response(blob, {
      headers: {
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
        'Content-Type': 'text/plain',
      },
    })
  } catch (error) {
    console.error("Error downloading document:", error)
    return Response.json({ error: "下载文档失败" }, { status: 500 })
  }
}