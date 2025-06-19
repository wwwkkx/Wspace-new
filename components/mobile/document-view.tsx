'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  FileText,
  Download,
  Star,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb,
  Target,
  BookOpen,
  ExternalLink,
  Trash2
} from 'lucide-react'

interface DocumentViewProps {
  documentId: string
  onBack: () => void
}

interface DocumentDetail {
  id: string
  title: string
  originalFileName: string
  fileType: string
  fileSize: number
  category: string
  tags: string[]
  priority: 'high' | 'medium' | 'low'
  summary: string
  content: string
  actionItems: string[]
  insights: string[]
  keyPoints: string[]
  relatedDocuments: string[]
  createdAt: string
  updatedAt: string
  author?: string
  status: 'processing' | 'completed' | 'error'
}

export function DocumentView({ documentId, onBack }: DocumentViewProps) {
  const [document, setDocument] = useState<DocumentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'summary' | 'content' | 'insights'>('summary')

  useEffect(() => {
    loadDocument()
  }, [documentId])

  const loadDocument = async () => {
    setIsLoading(true)
    try {
      // 从API获取文档数据
      const response = await fetch(`/api/documents/${documentId}`)
      
      if (response.ok) {
        const data = await response.json()
        // 将API返回的数据转换为DocumentDetail格式
        // 注意：originalContent字段现在从Supabase存储中获取
        const documentData: DocumentDetail = {
          id: data.id || documentId,
          title: data.title || '未命名文档',
          originalFileName: data.fileName || data.originalFileName || '未知文件名',
          fileType: data.fileType || data.documentType || 'unknown',
          fileSize: data.fileSize || 0,
          category: data.category || '未分类',
          tags: data.tags || [],
          priority: data.priority || 'medium',
          summary: data.summary || '无摘要信息',
          content: data.originalContent || '无内容', // 使用API返回的originalContent字段
          actionItems: data.actionItems || [],
          insights: data.insights || [],
          keyPoints: data.keyPoints || [],
          relatedDocuments: data.relatedDocuments || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          author: data.author || data.createdBy || '未知作者',
          status: 'completed'
        }

        setDocument(documentData)
      } else {
        console.error('Failed to fetch document')
        // 如果API请求失败，使用基本信息创建一个错误状态的文档
        setDocument({
          id: documentId,
          title: '无法加载文档',
          originalFileName: '未知文件',
          fileType: 'unknown',
          fileSize: 0,
          category: '未知',
          tags: [],
          priority: 'medium',
          summary: '无法加载文档内容，请稍后再试。',
          content: '',
          actionItems: [],
          insights: [],
          keyPoints: [],
          relatedDocuments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'error'
        })
      }
    } catch (error) {
      console.error('Error loading document:', error)
      // 发生错误时设置错误状态
      setDocument({
        id: documentId,
        title: '加载错误',
        originalFileName: '未知文件',
        fileType: 'unknown',
        fileSize: 0,
        category: '未知',
        tags: [],
        priority: 'medium',
        summary: '加载文档时发生错误，请稍后再试。',
        content: '',
        actionItems: [],
        insights: [],
        keyPoints: [],
        relatedDocuments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return '📄'
      case 'doc': case 'docx': return '📝'
      case 'xls': case 'xlsx': return '📊'
      case 'ppt': case 'pptx': return '📈'
      case 'txt': return '📃'
      default: return '📄'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center bg-background dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">文档不存在</p>
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="mt-4 rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
          >
            返回
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getFileTypeIcon(document.fileType)}</span>
            <h1 className="text-lg font-semibold line-clamp-1">{document.title}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`/api/documents/${document.id}/download`, '_blank')}
            className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (confirm('确定要删除这个文档吗？此操作无法撤销。')) {
                // 这里添加删除文档的API调用
                fetch(`/api/documents/${document.id}`, {
                  method: 'DELETE',
                }).then(response => {
                  if (response.ok) {
                    alert('文档已删除');
                    onBack();
                  } else {
                    alert('删除失败，请重试');
                  }
                }).catch(error => {
                  console.error('Error deleting document:', error);
                  alert('删除失败，请重试');
                });
              }
            }}
            className="rounded-xl transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Document Info */}
      <div className="p-4 border-b bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={`${getPriorityColor(document.priority)} rounded-full px-2 py-1`}>
              <Star className="w-3 h-3 mr-1" />
              {document.priority}
            </Badge>
            <Badge variant="outline" className="rounded-full px-2 py-1 border-gray-300 dark:border-gray-600">{document.category}</Badge>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatFileSize(document.fileSize)}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          {document.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs rounded-full px-2 py-1 bg-gray-100 dark:bg-gray-700">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(document.createdAt).toLocaleDateString()}
          </div>
          {document.author && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {document.author}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        {[
          { key: 'summary', label: '摘要', icon: BookOpen },
          { key: 'content', label: '内容', icon: FileText },
          { key: 'insights', label: '洞察', icon: Lightbulb }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeTab === key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 rounded-none border-b-2 ${
              activeTab === key ? 'border-blue-600 dark:border-blue-400' : 'border-transparent'
            } transition-all duration-200`}
          >
            <Icon className="w-4 h-4 mr-1" />
            {label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 bg-background dark:bg-gray-900">
        <div className="p-4 space-y-4">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Summary */}
              <Card className="rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    文档摘要
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-5 pb-5">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{document.summary}</p>
                </CardContent>
              </Card>

              {/* Key Points */}
              <Card className="rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    关键要点
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-5 pb-5">
                  <ul className="space-y-2">
                    {document.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card className="rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    行动建议
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-5 pb-5">
                  <ul className="space-y-3">
                    {document.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <Card className="rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    文档内容
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-5 pb-5">
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="text-5xl mb-4">
                      {document.fileType === 'pdf' ? '📄' : 
                       document.fileType === 'doc' || document.fileType === 'docx' ? '📝' : 
                       document.fileType === 'txt' ? '📃' : 
                       document.fileType === 'md' ? '📑' : '📄'}
                    </div>
                    <div className="text-center mb-6">
                      <p className="font-medium mb-1 dark:text-gray-200">{document.originalFileName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(document.fileSize)}</p>
                    </div>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                      该文件不支持在线预览，请下载后查看
                    </p>
                    <Button 
                      onClick={() => window.open(`/api/documents/${document.id}/download`, '_blank')}
                      className="flex items-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 font-medium transition-all duration-200 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      下载文档
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Insights */}
              <Card className="rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    AI 洞察
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-5 pb-5">
                  {document.insights && document.insights.length > 0 ? (
                    <ul className="space-y-3">
                      {document.insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-6">
                      <Lightbulb className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">暂无AI洞察内容</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">系统正在分析文档中，请稍后查看</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Related Documents */}
              {document.relatedDocuments && document.relatedDocuments.length > 0 ? (
                <Card className="rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <CardHeader className="pb-3 px-5 pt-5">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      相关文档
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-5 pb-5">
                    <ul className="space-y-2">
                      {document.relatedDocuments.map((doc, index) => (
                        <li key={index}>
                          <Button 
                            variant="ghost" 
                            className="h-auto p-2 justify-start w-full rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {doc}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default DocumentView