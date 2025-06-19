'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, FileText, Calendar, Tag, ArrowLeft, Star, Loader2 } from 'lucide-react'
import { NoteView } from '@/components/note-view'
import { useLanguage } from '@/components/language-provider'

// 多语言翻译配置
const notesTranslations = {
  'zh-CN': {
    title: '智能笔记',
    newNote: '新建',
    searchPlaceholder: '搜索笔记...',
    loading: '加载中...',
    noNotes: '暂无笔记',
    noNotesDesc: '点击右上角新建按钮创建第一个笔记',
    createNote: '新建笔记',
    cancel: '取消',
    create: '创建',
    creating: '创建中...',
    notePlaceholder: '在这里输入你的想法...\n\nAI 将自动为你：\n• 生成简洁的标题\n• 提炼核心摘要\n• 智能分类整理\n• 提取关键标签\n• 识别行动项\n• 提供深度洞察\n• 同步到 Notion'
  },
  'en-US': {
    title: 'Smart Notes',
    newNote: 'New',
    searchPlaceholder: 'Search notes...',
    loading: 'Loading...',
    noNotes: 'No notes yet',
    noNotesDesc: 'Click the new button in the top right to create your first note',
    createNote: 'New Note',
    cancel: 'Cancel',
    create: 'Create',
    creating: 'Creating...',
    notePlaceholder: 'Enter your thoughts here...\n\nAI will automatically:\n• Generate concise titles\n• Extract core summaries\n• Smart categorization\n• Extract key tags\n• Identify action items\n• Provide deep insights\n• Sync to Notion'
  },
  'ja-JP': {
    title: 'スマートノート',
    newNote: '新規',
    searchPlaceholder: 'ノートを検索...',
    loading: '読み込み中...',
    noNotes: 'ノートがありません',
    noNotesDesc: '右上の新規ボタンをクリックして最初のノートを作成してください',
    createNote: '新規ノート',
    cancel: 'キャンセル',
    create: '作成',
    creating: '作成中...',
    notePlaceholder: 'ここにあなたの考えを入力してください...\n\nAIが自動的に：\n• 簡潔なタイトルを生成\n• 核心要約を抽出\n• スマート分類\n• キータグを抽出\n• アクション項目を特定\n• 深い洞察を提供\n• Notionに同期'
  },
  'ko-KR': {
    title: '스마트 노트',
    newNote: '새로 만들기',
    searchPlaceholder: '노트 검색...',
    loading: '로딩 중...',
    noNotes: '노트가 없습니다',
    noNotesDesc: '오른쪽 상단의 새로 만들기 버튼을 클릭하여 첫 번째 노트를 만드세요',
    createNote: '새 노트',
    cancel: '취소',
    create: '만들기',
    creating: '만드는 중...',
    notePlaceholder: '여기에 생각을 입력하세요...\n\nAI가 자동으로：\n• 간결한 제목 생성\n• 핵심 요약 추출\n• 스마트 분류\n• 키 태그 추출\n• 액션 항목 식별\n• 깊은 통찰 제공\n• Notion에 동기화'
  }
}

interface Note {
  id: string
  title: string
  originalContent: string
  summary: string
  category: string
  tags: string[]
  priority: string
  actionItems: string[]
  insights: string[]
  createdAt: string
  updatedAt: string
}

interface MobileNotesProps {
  onBack: () => void
}

export function MobileNotes({ onBack }: MobileNotesProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewNote, setShowNewNote] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 获取用户ID（这里简化处理，实际应该从认证系统获取）
  const userId = 'user-123'
  
  // 多语言支持
  const { language } = useLanguage()
  const nt = notesTranslations[language] || notesTranslations['zh-CN']

  useEffect(() => {
    loadNotes()
  }, [currentPage])

  const loadNotes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/notes?page=${currentPage}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        console.error('Failed to load notes')
      }
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return

    try {
      setIsCreating(true)
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newNoteContent,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNewNoteContent('')
          setShowNewNote(false)
          await loadNotes() // 重新加载笔记列表
        } else {
          alert('创建笔记失败，请重试')
        }
      } else {
        alert('创建笔记失败，请重试')
      }
    } catch (error) {
      console.error('Error creating note:', error)
      alert('创建笔记失败，请重试')
    } finally {
      setIsCreating(false)
    }
  }

  const handleNoteClick = (noteId: string) => {
    setSelectedNoteId(noteId)
  }

  const handleBackFromNote = () => {
    setSelectedNoteId(null)
    loadNotes() // 重新加载笔记列表以获取最新数据
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高': return 'bg-red-100 text-red-800'
      case '中': return 'bg-yellow-100 text-yellow-800'
      case '低': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // 如果选中了笔记，显示笔记详情
  if (selectedNoteId) {
    return (
      <div className="h-full">
        <NoteView noteId={selectedNoteId} onBack={handleBackFromNote} />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 dark:text-gray-300" />
          </Button>
          <h1 className="text-lg font-semibold dark:text-gray-100">{nt.title}</h1>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-gray-400 w-4 h-4" />
          <Input
            placeholder={nt.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary dark:text-blue-400" />
              <p className="text-muted-foreground dark:text-gray-400">{nt.loading}</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50 dark:text-gray-600" />
              <p>{nt.noNotes}</p>
              <p className="text-sm dark:text-gray-500">{nt.noNotesDesc}</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <Card 
                key={note.id} 
                className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                onClick={() => handleNoteClick(note.id)}
              >
                <CardHeader className="pb-3 px-5 pt-5">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-1 font-semibold dark:text-gray-100">{note.title}</CardTitle>
                    <Badge className={`text-xs rounded-full px-2 py-1 ${getPriorityColor(note.priority)}`}>
                      <Star className="w-3 h-3 mr-1" />
                      {note.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-5 pb-5">
                  <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2 mb-4">
                    {note.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-xs rounded-full px-2 py-1 border-gray-300 dark:border-gray-600 dark:text-gray-300">
                        {note.category}
                      </Badge>
                      {note.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs rounded-full px-2 py-1 bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs rounded-full px-2 py-1 bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                          +{note.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground dark:text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* New Note Editor Modal */}
      {showNewNote && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-end">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md w-full h-3/4 rounded-t-3xl flex flex-col border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-lg font-semibold dark:text-gray-100">{nt.createNote}</h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowNewNote(false)
                    setNewNoteContent('')
                  }}
                  disabled={isCreating}
                  className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 dark:text-gray-300"
                >
                  {nt.cancel}
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateNote}
                  disabled={isCreating || !newNoteContent.trim()}
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 font-medium transition-all duration-200 shadow-sm"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      {nt.creating}
                    </>
                  ) : (
                    nt.create
                  )}
                </Button>
              </div>
            </div>
            <div className="flex-1 p-5">
              <Textarea
                placeholder={nt.notePlaceholder}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full h-full resize-none rounded-2xl border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 dark:text-gray-200"
                disabled={isCreating}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

export default MobileNotes;