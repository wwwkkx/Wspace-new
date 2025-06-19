'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, FileText, Calendar, Tag, ArrowLeft, Star, Loader2, Upload, File, X } from 'lucide-react'
import DocumentView from './document-view'

interface Document {
  id: string
  title: string
  originalFileName: string
  fileType: string
  fileSize: number
  summary: string
  category: string
  tags: string[]
  priority: string
  actionItems: string[]
  insights: string[]
  createdAt: string
  updatedAt: string
}

// 文档页面的翻译配置
const documentsTranslations = {
  "zh-CN": {
    documentsTitle: "文档管理",
    searchPlaceholder: "搜索文档...",
    uploadDocument: "上传文档",
    noDocuments: "暂无文档",
    uploadFile: "上传文件",
    selectFile: "选择文件",
    uploading: "上传中...",
    cancel: "取消",
    back: "返回",
    loading: "加载中...",
    fileTypeError: "不支持的文件类型。请上传 PDF、Word、Excel、PowerPoint 或文本文件。",
    fileSizeError: "文件大小不能超过 10MB"
  },
  "en-US": {
    documentsTitle: "Document Management",
    searchPlaceholder: "Search documents...",
    uploadDocument: "Upload Document",
    noDocuments: "No documents",
    uploadFile: "Upload File",
    selectFile: "Select File",
    uploading: "Uploading...",
    cancel: "Cancel",
    back: "Back",
    loading: "Loading...",
    fileTypeError: "Unsupported file type. Please upload PDF, Word, Excel, PowerPoint or text files.",
    fileSizeError: "File size cannot exceed 10MB"
  },
  "ja-JP": {
    documentsTitle: "ドキュメント管理",
    searchPlaceholder: "ドキュメントを検索...",
    uploadDocument: "ドキュメントをアップロード",
    noDocuments: "ドキュメントがありません",
    uploadFile: "ファイルをアップロード",
    selectFile: "ファイルを選択",
    uploading: "アップロード中...",
    cancel: "キャンセル",
    back: "戻る",
    loading: "読み込み中...",
    fileTypeError: "サポートされていないファイル形式です。PDF、Word、Excel、PowerPoint、またはテキストファイルをアップロードしてください。",
    fileSizeError: "ファイルサイズは10MBを超えることはできません"
  },
  "ko-KR": {
    documentsTitle: "문서 관리",
    searchPlaceholder: "문서 검색...",
    uploadDocument: "문서 업로드",
    noDocuments: "문서가 없습니다",
    uploadFile: "파일 업로드",
    selectFile: "파일 선택",
    uploading: "업로드 중...",
    cancel: "취소",
    back: "뒤로",
    loading: "로딩 중...",
    fileTypeError: "지원되지 않는 파일 형식입니다. PDF, Word, Excel, PowerPoint 또는 텍스트 파일을 업로드하세요.",
    fileSizeError: "파일 크기는 10MB를 초과할 수 없습니다"
  }
};

interface MobileDocumentsProps {
  onBack: () => void
}

export function MobileDocuments({ onBack }: MobileDocumentsProps) {
  const { language } = useLanguage();
  const dt = documentsTranslations[language as keyof typeof documentsTranslations];
  const [searchQuery, setSearchQuery] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 获取用户ID（这里简化处理，实际应该从认证系统获取）
  const userId = 'user-123'

  useEffect(() => {
    loadDocuments()
  }, [currentPage])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/documents?page=${currentPage}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        console.error('Failed to load documents')
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    doc.originalFileName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 检查文件类型
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        alert(dt.fileTypeError)
        return
      }
      
      // 检查文件大小（限制为 10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert(dt.fileSizeError)
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleUploadDocument = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSelectedFile(null)
          setShowUpload(false)
          await loadDocuments() // 重新加载文档列表
        } else {
          alert('上传文档失败，请重试')
        }
      } else {
        alert('上传文档失败，请重试')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('上传文档失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDocumentClick = (documentId: string) => {
    setSelectedDocumentId(documentId)
  }

  const handleBackFromDocument = () => {
    setSelectedDocumentId(null)
    loadDocuments() // 重新加载文档列表以获取最新数据
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高': return 'bg-red-100 text-red-800'
      case '中': return 'bg-yellow-100 text-yellow-800'
      case '低': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈'
    if (fileType.includes('text')) return '📃'
    return '📄'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 如果选中了文档，显示文档详情
  if (selectedDocumentId) {
    return (
      <div className="h-full">
        <DocumentView documentId={selectedDocumentId} onBack={handleBackFromDocument} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background dark:bg-gray-950 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="mr-3 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5 dark:text-gray-300" />
        </Button>
        <h1 className="text-xl font-semibold flex-1 dark:text-gray-100">{dt.documentsTitle}</h1>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-gray-400 w-4 h-4" />
          <Input
            placeholder={dt.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Documents List */}
      <ScrollArea className="flex-1 p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary dark:text-blue-400" />
            <p className="text-muted-foreground dark:text-gray-400">{dt.loading}</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50 dark:text-gray-600" />
            <p className="text-muted-foreground dark:text-gray-400">{dt.noDocuments}</p>
            <p className="text-sm text-muted-foreground/70 dark:text-gray-500">点击右上角上传按钮添加第一个文档</p>
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <Card 
              key={document.id} 
              className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
              onClick={() => handleDocumentClick(document.id)}
            >
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                    <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-1 font-semibold dark:text-gray-100">{document.title}</CardTitle>
                    <CardDescription className="text-sm mt-1 truncate text-gray-500 dark:text-gray-400">
                      {document.originalFileName} • {formatFileSize(document.fileSize)}
                    </CardDescription>
                  </div>
                  <Badge className={`text-xs rounded-full px-2 py-1 ${getPriorityColor(document.priority)}`}>
                    <Star className="w-3 h-3 mr-1" />
                    {document.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-5 pb-5">
                <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2 mb-4">
                  {document.summary}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs rounded-full px-2 py-1 border-gray-300 dark:border-gray-600 dark:text-gray-300">
                      {document.category}
                    </Badge>
                    {document.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs rounded-full px-2 py-1 bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {document.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs rounded-full px-2 py-1 bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                        +{document.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground dark:text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(document.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </ScrollArea>

      {/* Upload Document Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-end">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md w-full h-3/4 rounded-t-3xl flex flex-col border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-lg font-semibold dark:text-gray-100">{dt.uploadFile}</h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowUpload(false)
                    setSelectedFile(null)
                  }}
                  disabled={isUploading}
                  className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 dark:text-gray-300"
                >
                  {dt.cancel}
                </Button>
                <Button
                  size="sm"
                  onClick={handleUploadDocument}
                  disabled={isUploading || !selectedFile}
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 font-medium transition-all duration-200 shadow-sm"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      {dt.uploading}
                    </>
                  ) : (
                    dt.uploadFile
                  )}
                </Button>
              </div>
            </div>
            <div className="flex-1 p-5">
              {!selectedFile ? (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl bg-gray-50/50 dark:bg-gray-800/50">
                  <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2 dark:text-gray-200">{dt.selectFile}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
                    支持 PDF、Word、Excel、PowerPoint 和文本文件<br />
                    文件大小不超过 10MB
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 font-medium transition-all duration-200 shadow-sm"
                  >
                    <File className="w-4 h-4 mr-2" />
                    {dt.selectFile}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <Card className="mb-4 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                            <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium dark:text-gray-200">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(selectedFile.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                          className="rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
                        >
                          <X className="w-4 h-4 dark:text-gray-400" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="flex-1 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                    <CardContent className="p-5">
                      <h4 className="font-medium mb-3 dark:text-gray-200">AI 将为您：</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <li>• 提取文档内容并生成摘要</li>
                        <li>• 智能分类和标签标注</li>
                        <li>• 识别关键信息和行动项</li>
                        <li>• 提供深度分析和洞察</li>
                        <li>• 建立知识关联和索引</li>
                        <li>• 同步到 Notion 知识库</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

export default MobileDocuments;