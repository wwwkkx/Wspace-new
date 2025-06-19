'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation, useLanguage } from '@/components/language-provider';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Search, 
  Edit, 
  Edit2,
  Menu, 
  X, 
  MessageSquare, 
  FileText, 
  Upload, 
  BarChart3,
  ChevronDown,
  Settings,
  Sun,
  Moon,
  Monitor,
  Globe,
  Settings as SettingsIcon,
  Trash,
  Trash2
} from 'lucide-react';
import MobileSettings from './settings';
import MobileNotes from './notes';
import MobileDocuments from './documents';
import MobileReports from './reports';

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onSessionsUpdate: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  isOpen, 
  onClose, 
  sessions, 
  currentSessionId, 
  onSessionSelect, 
  onNewSession,
  onSessionsUpdate 
}) => {
  const t = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [editingSession, setEditingSession] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);



  // 开始重命名
  const startRename = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setEditingSession({ id: sessionId, title: session.title });
    }
  };

  // 保存重命名
  const saveRename = async () => {
    if (!editingSession) return;
    
    console.log('开始重命名会话:', editingSession.id, '新标题:', editingSession.title);
    
    try {
      const response = await fetch('/api/chat/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: editingSession.id,
          newTitle: editingSession.title
        })
      });
      
      console.log('重命名API响应状态:', response.status);
      const responseData = await response.text();
      console.log('重命名API响应内容:', responseData);
      
      if (response.ok) {
        console.log('重命名成功，更新会话列表');
        // 通知父组件更新会话列表
        onSessionsUpdate();
      } else {
        console.error('重命名失败，状态码:', response.status);
      }
    } catch (error) {
      console.error('重命名请求异常:', error);
    }
    
    setEditingSession(null);
  };

  // 取消重命名
  const cancelRename = () => {
    setEditingSession(null);
  };

  // 确认删除对话框
  const confirmDelete = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  // 删除会话
  const deleteSession = async (sessionId: string) => {
    if (!sessionId) return;
    
    console.log('开始删除会话:', sessionId);
    
    try {
      // 使用与桌面端相同的API路由格式
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      
      console.log('删除API响应状态:', response.status);
      
      if (response.ok) {
        console.log('删除成功，更新会话列表');
        // 通知父组件更新会话列表
        onSessionsUpdate();
        
        // 如果删除的是当前会话，需要处理会话切换
        if (currentSessionId === sessionId) {
          // 找到其他可用的会话
          const remainingSessions = sessions.filter(s => s.id !== sessionId);
          if (remainingSessions.length > 0) {
            // 选择第一个剩余会话
            onSessionSelect(remainingSessions[0].id);
          } else {
            // 如果没有其他会话，创建新会话
            onNewSession();
          }
        }
      } else {
        const responseText = await response.text();
        console.error('删除失败，状态码:', response.status, '响应内容:', responseText);
        alert(`删除会话失败: ${response.status}`);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert(`删除会话失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  // 防止滚动穿透
  useEffect(() => {
    if (isOpen) {
      // 侧边栏打开时锁定body滚动
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      // 侧边栏关闭时恢复body滚动
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    // 清理函数：组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);



  // 格式化时间显示
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      return t.justNow || '刚刚';
    } else if (diffHours < 24) {
      return `${diffHours}${t.hoursAgo || '小时前'}`;
    } else if (diffDays < 7) {
      return `${diffDays}${t.daysAgo || '天前'}`;
    } else {
      return `${Math.floor(diffDays / 7)}${t.weeksAgo || '周前'}`;
    }
  };

  // 增强的搜索功能：支持准确搜索和模糊搜索
  const filteredSessions = sessions.filter(session => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const title = session.title.toLowerCase();
    
    // 准确搜索：完全匹配
    if (title === query) {
      return true;
    }
    
    // 模糊搜索：包含关键词
    if (title.includes(query)) {
      return true;
    }
    
    // 分词搜索：支持空格分隔的多个关键词
    const keywords = query.split(/\s+/).filter(word => word.length > 0);
    if (keywords.length > 1) {
      return keywords.every(keyword => title.includes(keyword));
    }
    
    // 拼音首字母搜索（简单实现）
    const firstLetters = title.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '').split('').map(char => {
      // 这里可以扩展为完整的拼音首字母映射
      return char;
    }).join('').toLowerCase();
    
    if (firstLetters.includes(query)) {
      return true;
    }
    
    return false;
  });

  // 处理编辑按钮点击 - 创建新会话
  const handleEditClick = () => {
    // 检查会话数量限制
    if (sessions.length >= 66) {
      alert('已达到最大会话数量限制（66条），请删除一些历史会话后再创建新会话。');
      return;
    }
    onNewSession();
    onClose();
  };

  // 清空搜索
  const clearSearch = () => {
    setSearchQuery('');
  };

  // 处理功能按钮点击
  const handleFeatureClick = (feature: string) => {
    setCurrentFeature(feature);
  };

  // 返回主界面
  const handleBackToMain = () => {
    setCurrentFeature(null);
  };

  if (showSettings) {
    return (
      <MobileSettings 
        isOpen={isOpen}
        onClose={() => setShowSettings(false)}
        onBack={() => setShowSettings(false)}
      />
    );
  }

  // 渲染功能子页面
  if (currentFeature === 'notes') {
    return (
      <div className={`
        fixed inset-0 bg-white z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <MobileNotes onBack={handleBackToMain} />
      </div>
    );
  }

  if (currentFeature === 'documents') {
    return (
      <div className={`
        fixed inset-0 bg-white z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <MobileDocuments onBack={handleBackToMain} />
      </div>
    );
  }

  if (currentFeature === 'reports') {
    return (
      <div className={`
        fixed inset-0 bg-white z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <MobileReports onBack={handleBackToMain} onClose={onClose} />
      </div>
    );
  }

  return (
    <>
      {/* 确认删除对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除会话</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该会话及其所有消息，且无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => sessionToDelete && deleteSession(sessionToDelete)}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 背景遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          onTouchMove={(e) => e.preventDefault()}
          style={{ touchAction: 'none' }}
        />
      )}
      
      {/* 侧边栏 */}
      <div 
        className={`
          fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onTouchMove={(e) => {
          // 允许侧边栏内部滚动，但阻止事件冒泡到背景
          e.stopPropagation();
        }}
      >
        {/* 毛玻璃背景层 */}
        <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl border-r border-border shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent"></div>
        </div>
        
        {/* 内容层 */}
        <div className="relative z-10 h-full flex flex-col">
          {/* 固定头部区域 */}
          <div className="flex-shrink-0 p-3 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{t.ares || 'Ares 助手'}</h2>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowQuickSettings(!showQuickSettings)}
                  className="hover:bg-accent h-8 w-8"
                  title={t.quickSettings || '快速设置'}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-accent h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* 快速设置面板 */}
            {showQuickSettings && (
              <Card className="mb-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-1 pt-2">
                  <CardTitle className="text-sm font-medium">{t.quickSettings || '快速设置'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pb-2">
                  {/* 主题切换 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.theme || '主题'}</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant={theme === 'light' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setTheme('light')}
                        className="h-6 px-2 text-xs rounded-lg"
                      >
                        <Sun className="h-3 w-3 mr-1" />
                        {t.light || '浅色'}
                      </Button>
                      <Button
                        variant={theme === 'dark' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setTheme('dark')}
                        className="h-6 px-2 text-xs rounded-lg"
                      >
                        <Moon className="h-3 w-3 mr-1" />
                        {t.dark || '深色'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* 语言切换 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.language || '语言'}</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant={language === 'zh-CN' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setLanguage('zh-CN')}
                        className="h-6 px-2 text-xs rounded-lg"
                      >
                        中文
                      </Button>
                      <Button
                        variant={language === 'en-US' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setLanguage('en-US')}
                        className="h-6 px-2 text-xs rounded-lg"
                      >
                        EN
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* 功能按键区域 */}
            <div className="grid grid-cols-3 gap-2 mb-4 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFeature('notes')}
                className="h-12 flex flex-col items-center justify-center space-y-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] text-xs"
              >
                <FileText className="h-4 w-4" />
                <span>{t.notes || '笔记'}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFeature('documents')}
                className="h-12 flex flex-col items-center justify-center space-y-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] text-xs"
              >
                <FileText className="h-4 w-4" />
                <span>{t.documents || '文档'}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFeature('reports')}
                className="h-12 flex flex-col items-center justify-center space-y-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] text-xs"
              >
                <BarChart3 className="h-4 w-4" />
                <span>{t.reports || '月报'}</span>
              </Button>
            </div>
            
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchHistory || '搜索历史聊天...'}
                className="pl-10 pr-10 h-9 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg focus:shadow-xl transition-all duration-200 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-lg hover:bg-accent/50"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
          </div>
          
          {/* 可滚动的历史会话区域 */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 px-3 py-2 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {searchQuery ? `搜索结果 (${filteredSessions.length})` : (t.chatHistory || '聊天历史')}
                </h3>
                {searchQuery && filteredSessions.length === 0 && (
                  <span className="text-xs text-muted-foreground">未找到匹配的会话</span>
                )}
              </div>
            </div>
            
            <ScrollArea 
              className="flex-1 px-3"
              onTouchMove={(e) => {
                // 确保ScrollArea内部可以正常滚动
                e.stopPropagation();
              }}
            >
              {/* 会话数量提醒 */}
              {sessions.length >= 60 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="text-sm text-yellow-800">
                    {sessions.length >= 66 
                      ? '⚠️ 已达到最大会话数量（66条），无法创建新会话'
                      : `⚠️ 会话数量较多（${sessions.length}/66），建议清理历史会话`
                    }
                  </div>
                </div>
              )}
              
              {filteredSessions.length === 0 && searchQuery ? (
                /* 搜索无结果提示 */
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="p-2 bg-muted/50 rounded-lg w-fit mx-auto mb-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">未找到匹配的会话</div>
                  <div className="text-xs text-muted-foreground/70 mb-3">尝试使用不同的关键词搜索</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSearch}
                    className="h-6 px-2 text-xs"
                  >
                    清空搜索
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  {/* 显示所有会话，支持滚动 */}
                  {filteredSessions.map((session) => (
                    <Card
                      key={session.id}
                      onClick={() => {
                        if (!editingSession || editingSession.id !== session.id) {
                          console.log('点击会话，切换到:', session.id);
                          onSessionSelect(session.id);
                          onClose();
                        }
                      }}
                      className={`relative cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:scale-[1.01] rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-xl select-none ${
                        currentSessionId === session.id 
                          ? 'bg-accent/70 border-primary/30 shadow-primary/20' 
                          : ''
                      }`}
                      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                    >
                      <CardHeader className="py-2 px-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            {editingSession && editingSession.id === session.id ? (
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={editingSession.title}
                                  onChange={(e) => setEditingSession({
                                    ...editingSession,
                                    title: e.target.value
                                  })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      saveRename();
                                    } else if (e.key === 'Escape') {
                                      cancelRename();
                                    }
                                  }}
                                  className="text-sm h-6 px-2"
                                  style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                                  autoFocus
                                />
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      saveRename();
                                    }}
                                    className="h-6 w-6 p-0 text-green-600"
                                  >
                                    ✓
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cancelRename();
                                    }}
                                    className="h-6 w-6 p-0 text-red-600"
                                  >
                                    ✕
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <CardTitle className="text-sm font-medium truncate">
                                  {/* 高亮搜索关键词 */}
                                  {searchQuery ? (
                                    <span dangerouslySetInnerHTML={{
                                      __html: session.title.replace(
                                        new RegExp(`(${searchQuery})`, 'gi'),
                                        '<mark class="bg-yellow-200 text-black px-1 rounded">$1</mark>'
                                      )
                                    }} />
                                  ) : (
                                    session.title
                                  )}
                                </CardTitle>
                                <CardDescription className="text-xs truncate mt-0.5">
                                  {formatTimestamp(session.updatedAt)}
                                </CardDescription>
                              </>
                            )}
                          </div>
                          
                          {/* 操作按钮 */}
                          {!editingSession && (
                            <div className="flex space-x-1">
                              {/* 重命名按钮 */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  console.log('点击重命名按钮，sessionId:', session.id);
                                  startRename(session.id);
                                }}
                                className="h-6 w-6 p-0 text-blue-500 hover:text-blue-600 hover:bg-accent rounded-full"
                                title="重命名会话"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              
                              {/* 删除按钮 */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  console.log('点击删除按钮，sessionId:', session.id);
                                  confirmDelete(session.id);
                                }}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-accent rounded-full"
                                title="删除会话"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* 固定底部用户信息 */}
          <div className="flex-shrink-0 border-t p-3">
            <Card className="hover:bg-accent/50 transition-all duration-200 hover:scale-[1.01] rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-xl">
              <CardHeader className="py-2 px-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    {session?.user?.image ? (
                      <AvatarImage src={session.user.image} alt={session.user.name || "用户"} />
                    ) : null}
                    <AvatarFallback className={session?.user ? "bg-green-600 text-white text-xs" : "bg-gray-400 text-white text-xs"}>
                      {session?.user?.name 
                        ? session.user.name.charAt(0).toUpperCase() 
                        : "U"
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium truncate">
                      {session?.user?.name || (t.notLoggedIn || "未登录")}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">在线</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

    </>
  );
};

export default MobileSidebar;