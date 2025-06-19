"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Tag, Calendar, Edit, Save, ArrowLeft, Trash2, Star } from "lucide-react"

interface NoteViewProps {
  noteId: string
  onBack: () => void
}

export function NoteView({ noteId, onBack }: NoteViewProps) {
  const [note, setNote] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")

  useEffect(() => {
    fetchNote()
  }, [noteId])

  const fetchNote = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/notes/${noteId}`)
      if (response.ok) {
        const data = await response.json()
        setNote(data)
        setEditedContent(data.originalContent || "")
      } else {
        console.error("Failed to fetch note")
      }
    } catch (error) {
      console.error("Error fetching note:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      })

      if (response.ok) {
        setIsEditing(false)
        fetchNote() // 重新获取更新后的笔记
      } else {
        alert("保存失败，请重试")
      }
    } catch (error) {
      console.error("Error saving note:", error)
      alert("保存失败，请重试")
    }
  }

  const handleDelete = async () => {
    if (!confirm("确定要删除这个笔记吗？此操作无法撤销。")) {
      return
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("笔记已删除")
        onBack()
      } else {
        alert("删除失败，请重试")
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      alert("删除失败，请重试")
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 dark:bg-gray-900">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-xl w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-xl w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-xl w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-xl w-5/6 mb-4"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400">加载中...</p>
        </CardContent>
      </Card>
    )
  }

  if (!note) {
    return (
      <Card className="w-full rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 dark:bg-gray-900">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">笔记不存在或已被删除</p>
          <Button onClick={onBack} variant="outline" className="mt-4 rounded-full dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* 移动端顶部返回按钮 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 dark:text-gray-300" />
          </Button>
          <h1 className="text-lg font-semibold line-clamp-1 dark:text-gray-100">{note?.title || '笔记详情'}</h1>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <Button size="sm" onClick={handleSave} className="rounded-full transition-all duration-200">
              <Save className="w-4 h-4 mr-1" />
              保存
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 dark:text-gray-300">
              <Edit className="w-4 h-4 mr-1" />
              编辑
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={handleDelete} className="rounded-full transition-all duration-200">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 使用ScrollArea包裹内容部分，支持滚动 */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Card className="w-full mb-4 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <CardHeader className="flex flex-col gap-4">
              <div>
                <CardTitle className="text-xl mb-2 dark:text-gray-100">{note.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="rounded-full border-gray-300 dark:border-gray-600 dark:text-gray-300">{note.category}</Badge>
                  <Badge variant={note.priority === "高" ? "destructive" : note.priority === "中" ? "default" : "secondary"} className="rounded-full">
                    <Star className="w-3 h-3 mr-1" />
                    {note.priority}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs rounded-full bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 笔记摘要 */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl transition-all duration-200">
                <h3 className="font-medium mb-2 dark:text-gray-200">📝 摘要</h3>
                <p className="text-gray-700 dark:text-gray-300">{note.summary}</p>
              </div>

              {/* 行动项 */}
              {note.actionItems && note.actionItems.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl transition-all duration-200">
                  <h3 className="font-medium mb-2 dark:text-gray-200">✅ 行动项</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {note.actionItems.map((item: string, index: number) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 深度洞察 */}
              {note.insights && note.insights.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl transition-all duration-200">
                  <h3 className="font-medium mb-2 dark:text-gray-200">💡 深度洞察</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {note.insights.map((insight: string, index: number) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 原始内容 */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-200">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 dark:text-gray-300" />
                    <h3 className="font-medium dark:text-gray-200">原始内容</h3>
                  </div>
                </div>
                <div className="p-4">
                  {isEditing ? (
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="min-h-[300px] font-mono text-sm rounded-xl border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 dark:text-gray-200"
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm font-mono dark:text-gray-300">{note.originalContent}</pre>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                创建时间: {new Date(note.createdAt).toLocaleString()}
                {note.updatedAt !== note.createdAt && (
                  <span className="ml-4">更新时间: {new Date(note.updatedAt).toLocaleString()}</span>
                )}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 dark:text-gray-300">
                    取消
                  </Button>
                  <Button onClick={handleSave} className="rounded-full transition-all duration-200">保存更改</Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
