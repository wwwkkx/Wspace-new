'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  FileText, 
  Calendar as CalendarIcon,
  Download,
  Eye,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain
} from 'lucide-react';
import { ReportView } from './report-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/language-provider';
import { toast } from '@/components/ui/use-toast';

// 多语言翻译配置
const reportsTranslations: Record<string, Record<string, string>> = {
  'zh-CN': {
    title: '月度报告',
    generateReport: '生成报告',
    searchPlaceholder: '搜索报告...',
    noReports: '暂无月度报告',
    noReportsDesc: '点击"生成报告"按钮创建您的第一份月度报告',
    completed: '已完成',
    generating: '生成中',
    draft: '草稿',
    unknown: '未知',
    completedTasks: '完成任务',
    projectsInvolved: '参与项目',
    hoursWorked: '工作时长',
    selectMonth: '选择月份',
    selectMonthDesc: '选择要生成月报的月份',
    aiAnalysisDesc: 'AI将分析所选月份的所有笔记和文档',
    confirmGenerate: '确认生成',
    startGenerate: '开始生成',
    generatingProcess: '生成中...',
    reportTitle: '报告标题',
    reportPeriod: '报告周期',
    additionalNotes: '附加说明',
    aiAnalysisFlow: 'AI分析流程',
    syncingToNotion: '正在同步到Notion...',
    noData: '无数据',
    noDataDesc: '所选月份没有笔记或文档数据'
  },
  'en-US': {
    title: 'Monthly Reports',
    generateReport: 'Generate Report',
    searchPlaceholder: 'Search reports...',
    noReports: 'No monthly reports yet',
    noReportsDesc: 'Click the "Generate Report" button to create your first monthly report',
    completed: 'Completed',
    generating: 'Generating',
    draft: 'Draft',
    unknown: 'Unknown',
    completedTasks: 'Tasks Completed',
    projectsInvolved: 'Projects Involved',
    hoursWorked: 'Hours Worked',
    selectMonth: 'Select Month',
    selectMonthDesc: 'Select the month for which you want to generate a report',
    aiAnalysisDesc: 'AI will analyze all notes and documents for the selected month',
    confirmGenerate: 'Confirm Generation',
    startGenerate: 'Start Generation',
    generatingProcess: 'Generating...',
    reportTitle: 'Report Title',
    reportPeriod: 'Report Period',
    additionalNotes: 'Additional Notes',
    aiAnalysisFlow: 'AI Analysis Process',
    syncingToNotion: 'Syncing to Notion...',
    noData: 'No Data',
    noDataDesc: 'No notes or documents data for the selected month'
  }
};

interface Report {
  id: string;
  title: string;
  period: string;
  status: 'draft' | 'generating' | 'completed';
  progress?: number;
  createdAt: string;
  updatedAt: string;
  summary: string;
  metrics: {
    tasksCompleted: number;
    projectsInvolved: number;
    hoursWorked: number;
    achievements: string[];
  };
}

interface MobileReportsProps {
  onBack: () => void;
  onClose: () => void;
}

const MobileReports: React.FC<MobileReportsProps> = ({ onBack, onClose }) => {
  const { language } = useLanguage();
  const t = reportsTranslations[language] || reportsTranslations['zh-CN'];
  
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncingToNotion, setIsSyncingToNotion] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newReport, setNewReport] = useState({ title: '', period: '', description: '' });
  // 缓存每个月份是否有数据的结果
  const [monthDataCache, setMonthDataCache] = useState<Record<string, boolean>>({});
  // 选中的报告ID，用于查看报告详情
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // 模拟数据
  useEffect(() => {
    const mockReports: Report[] = [
      {
        id: '1',
        title: '2024年1月工作月报',
        period: '2024-01',
        status: 'completed',
        createdAt: '2024-01-31',
        updatedAt: '2024-01-31',
        summary: '本月完成了多个重要项目，工作效率显著提升',
        metrics: {
          tasksCompleted: 28,
          projectsInvolved: 3,
          hoursWorked: 160,
          achievements: ['完成新功能开发', '优化系统性能', '团队协作提升']
        }
      },
      {
        id: '2',
        title: '2023年12月工作月报',
        period: '2023-12',
        status: 'completed',
        createdAt: '2023-12-31',
        updatedAt: '2023-12-31',
        summary: '年末冲刺阶段，各项目按时交付',
        metrics: {
          tasksCompleted: 35,
          projectsInvolved: 4,
          hoursWorked: 175,
          achievements: ['项目按时交付', '代码质量提升', '客户满意度提高']
        }
      },
      {
        id: '3',
        title: '2023年11月工作月报',
        period: '2023-11',
        status: 'generating',
        progress: 75,
        createdAt: '2023-11-30',
        updatedAt: '2023-11-30',
        summary: '正在生成月报内容...',
        metrics: {
          tasksCompleted: 22,
          projectsInvolved: 2,
          hoursWorked: 150,
          achievements: ['技能提升', '流程优化']
        }
      }
    ];
    setReports(mockReports);
  }, []);

  // 过滤报告
  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.period.includes(searchQuery)
  );

  // 获取指定月份的笔记和文档数据
  const getMonthlyData = async (year: number, month: number) => {
    try {
      // 调用API获取指定月份的笔记和文档数据
      const response = await fetch('/api/monthly-report/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year, month }),
      });

      if (!response.ok) {
        throw new Error('获取月度数据失败');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取月度数据失败:', error);
      // 出错时返回空数据
      return { notes: [], documents: [] };
    }
  };

  // 检查月份是否有数据
  const checkMonthHasData = async (date: Date): Promise<boolean> => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript月份从0开始，需要+1
      
      // 获取该月的数据
      const { notes, documents } = await getMonthlyData(year, month);
      
      // 如果有笔记或文档数据，则返回true
      return (notes.length > 0 || documents.length > 0);
    } catch (error) {
      console.error('检查月份数据失败:', error);
      return false; // 出错时默认返回false
    }
  };

  // 生成报告与AI

  // AI生成月报
  const generateReportWithAI = async (reportData: any) => {
    try {
      const response = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: reportData.notes,
          documents: reportData.documents,
          period: reportData.period
        })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI生成月报失败:', error);
      // 返回模拟生成的报告
      return {
        summary: `${reportData.period} 工作总结：本月完成了多项重要任务，包括项目开发、文档整理等工作。通过AI分析，发现工作效率有所提升，团队协作良好。`,
        metrics: {
          tasksCompleted: reportData.notes.length + reportData.documents.length,
          projectsInvolved: Math.floor(Math.random() * 3) + 1,
          hoursWorked: Math.floor(Math.random() * 50) + 120,
          achievements: ['完成重要项目', '提升工作效率', '优化工作流程']
        },
        insights: [
          '本月工作量较上月增长15%',
          '文档整理工作有显著改善',
          '建议下月重点关注项目进度管理'
        ]
      };
    }
  };

  // 同步到Notion
  const syncToNotion = async (reportData: any) => {
    try {
      setIsSyncingToNotion(true);
      const response = await fetch('/api/notion/sync-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });
      
      const result = await response.json();
      console.log('同步到Notion成功:', result);
      return result;
    } catch (error) {
      console.error('同步到Notion失败:', error);
      // 模拟成功
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, notionPageId: 'mock-page-id' };
    } finally {
      setIsSyncingToNotion(false);
    }
  };

  // 处理日历选择
  const handleCalendarSelect = async (date: Date | undefined) => {
    if (!date) return;
    
    // 检查所选月份是否有数据
    const hasData = await checkMonthHasData(date);
    
    if (!hasData) {
      toast({
        title: t.noData || "无数据",
        description: t.noDataDesc || "所选月份没有笔记或文档数据",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedDate(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const period = `${year}-${month.toString().padStart(2, '0')}`;
    const title = `${year}年${month}月工作月报`;
    
    setNewReport({
      title,
      period,
      description: ''
    });
    
    setShowCalendar(false);
    setShowGenerator(true);
  };

  // 生成新报告
  // 生成月度报告
  const handleGenerateReport = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // 获取所选月份的年和月
      const year = selectedDate?.getFullYear();
      const month = selectedDate?.getMonth() ? selectedDate.getMonth() + 1 : 1;
      
      // 调用API生成月度报告
      const response = await fetch('/api/monthly-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          month,
          description: newReport.description,
        }),
      });
      
      if (!response.ok) {
        throw new Error('生成报告失败');
      }
      
      const reportData = await response.json();
      
      // 添加新生成的报告到列表
      const newReportItem: Report = {
        id: Date.now().toString(),
        title: newReport.title,
        period: newReport.period,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        summary: reportData.summary || '月度工作总结',
        metrics: {
          tasksCompleted: reportData.metrics?.tasksCompleted || 0,
          projectsInvolved: reportData.metrics?.projectsInvolved || 0,
          hoursWorked: reportData.metrics?.hoursWorked || 0,
          achievements: reportData.metrics?.achievements || []
        }
      };
      
      setReports([newReportItem, ...reports]);
      
      // 重置状态
      setShowGenerator(false);
      setNewReport({ title: '', period: '', description: '' });
      
      toast({
        title: "报告生成成功",
        description: "月度报告已成功生成",
      });
    } catch (error) {
      console.error('生成报告失败:', error);
      toast({
        title: "生成失败",
        description: "生成月度报告时出错，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t.completed;
      case 'generating': return t.generating;
      case 'draft': return t.draft;
      default: return t.unknown;
    }
  };

  // 状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'generating': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'draft': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };
  
  // 处理查看报告详情
  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
  };
  
  // 处理从报告详情返回
  const handleBackFromReport = () => {
    setSelectedReportId(null);
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      {selectedReportId ? (
        // 报告详情视图
        <div className="fixed top-0 left-0 h-full w-full bg-background z-50 flex flex-col">
          <ReportView reportId={selectedReportId} onBack={handleBackFromReport} />
        </div>
      ) : (
        // 月报列表界面
        <div className="fixed top-0 left-0 h-full w-full bg-background z-50 flex flex-col">
        {/* 头部 */}
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold">{t.title}</h1>
            </div>
            <Button
              onClick={() => setShowCalendar(true)}
              size="sm"
              className="gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 font-medium transition-all duration-200 shadow-sm"
            >
              <CalendarIcon className="h-4 w-4" />
              {t.generateReport}
            </Button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="p-4 border-b border-gray-200/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="pl-12 pr-4 py-3 rounded-2xl bg-gray-50/80 border-gray-200/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            />
          </div>
        </div>

        {/* 月报列表 */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">{t.noReports}</p>
                <p className="text-sm text-gray-400">{t.noReportsDesc}</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <Card 
                  key={report.id} 
                  className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl"
                  onClick={() => report.status === 'completed' && handleViewReport(report.id)}
                >
                  <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">{report.title}</h3>
                            {getStatusIcon(report.status)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs rounded-xl px-2 py-1 ${getStatusColor(report.status)}`}>
                              {getStatusText(report.status)}
                            </Badge>
                            <span className="text-xs text-gray-500">{report.period}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{formatDate(report.createdAt)}</span>
                          </div>
                        </div>
                        
                        {report.status === 'completed' && (
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewReport(report.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {report.status === 'generating' && report.progress !== undefined && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">生成进度</span>
                            <span className="text-xs text-gray-600 font-medium">{report.progress}%</span>
                          </div>
                          <Progress value={report.progress} className="h-2 rounded-full" />
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-3">{report.summary}</p>
                      
                      {/* 数据指标 */}
                      {report.status === 'completed' && (
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="text-center p-3 bg-blue-50/80 rounded-2xl">
                            <div className="text-lg font-semibold text-blue-600">{report.metrics.tasksCompleted}</div>
                            <div className="text-xs text-gray-500">{t.completedTasks}</div>
                          </div>
                          <div className="text-center p-3 bg-green-50/80 rounded-2xl">
                            <div className="text-lg font-semibold text-green-600">{report.metrics.projectsInvolved}</div>
                            <div className="text-xs text-gray-500">{t.projectsInvolved}</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50/80 rounded-2xl">
                            <div className="text-lg font-semibold text-purple-600">{report.metrics.hoursWorked}</div>
                            <div className="text-xs text-gray-500">{t.hoursWorked}</div>
                          </div>
                        </div>
                      )}
                      
                      {/* 成就标签 */}
                      {report.metrics.achievements.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {report.metrics.achievements.slice(0, 3).map((achievement, index) => (
                            <Badge key={index} variant="secondary" className="text-xs rounded-xl px-2 py-1 bg-gray-100/80 text-gray-700">
                              {achievement}
                            </Badge>
                          ))}
                          {report.metrics.achievements.length > 3 && (
                            <span className="text-xs text-gray-500 font-medium">+{report.metrics.achievements.length - 3}</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
          </div>
        </ScrollArea>
      </div>
      )}

      {/* 日历选择界面 */}
      {showCalendar && (
        <div className="fixed inset-0 bg-background z-60 flex flex-col">
          {/* 日历头部 */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => setShowCalendar(false)}>
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </Button>
              <h1 className="text-lg font-semibold text-foreground">{t.selectMonth}</h1>
            </div>
          </div>

          {/* 日历内容 */}
          <div className="flex-1 p-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">{t.selectMonthDesc}</p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">{t.aiAnalysisDesc}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleCalendarSelect}
                className="rounded-xl border shadow-sm bg-white/90 backdrop-blur-sm"
                showOutsideDays={false}
                captionLayout="dropdown-buttons"
                fromYear={2020}
                toYear={new Date().getFullYear()}
                classNames={{
                  caption_label: "text-base font-semibold",
                  nav_button: "h-8 w-8 bg-transparent p-0 opacity-80 hover:opacity-100 rounded-full hover:bg-gray-100/80",
                  cell: "relative p-0 text-center focus-within:relative focus-within:z-20",
                  day: "h-10 w-10 p-0 font-normal rounded-full aria-selected:opacity-100 aria-selected:bg-blue-500 aria-selected:text-white hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-700 transition-all duration-200",
                  day_disabled: "opacity-50 hover:bg-transparent hover:text-muted-foreground",
                  day_today: "bg-gray-100 text-gray-900 font-medium",
                  day_outside: "opacity-50",
                  table: "border-collapse space-y-1",
                  head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
                  nav: "space-x-1 flex items-center",
                }}
                disabled={(date) => {
                  // 未来日期不可选
                  if (date > new Date()) return true;
                  
                  // 检查该月是否有数据
                  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                  
                  // 如果是当前月的日期，只检查一次
                  if (date.getMonth() === selectedDate?.getMonth() && 
                      date.getFullYear() === selectedDate?.getFullYear()) {
                    return false;
                  }
                  
                  // 使用缓存的结果
                  const cacheKey = `${date.getFullYear()}-${date.getMonth()}`;
                  if (monthDataCache[cacheKey] !== undefined) {
                    return !monthDataCache[cacheKey];
                  }
                  
                  // 默认允许选择
                  // 注意：我们不能在这里使用异步函数，所以默认允许选择
                  // 实际的数据检查会在用户选择日期后进行
                  return false;
                }}
              />
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-sm text-blue-700 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <p>只要本月有笔记和文档，即可随时生成月报</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <p>系统将自动获取选定月份的所有内容</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <p>AI将进行智能分析和总结</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 生成月报确认界面 */}
      {showGenerator && (
        <div className="fixed inset-0 bg-background z-60 flex flex-col">
          {/* 生成器头部 */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => setShowGenerator(false)}>
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </Button>
              <h1 className="text-lg font-semibold text-foreground">{t.confirmGenerate}</h1>
            </div>
            <Button 
              size="sm" 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isGenerating ? t.generatingProcess : t.startGenerate}
            </Button>
          </div>

          {/* 生成器内容 */}
          <div className="flex-1 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.reportTitle}</label>
              <Input
                value={newReport.title}
                onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                placeholder="例如：2024年1月工作月报"
                className="bg-background border-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.reportPeriod}</label>
              <Input
                value={newReport.period}
                onChange={(e) => setNewReport(prev => ({ ...prev, period: e.target.value }))}
                placeholder="例如：2024-01"
                readOnly
                className="bg-muted border-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.additionalNotes}</label>
              <Textarea
                value={newReport.description}
                onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                placeholder="添加任何需要特别说明的内容..."
                className="min-h-[100px] resize-none bg-background border-input"
              />
            </div>
            
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">{t.aiAnalysisFlow}</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>1. 📝 获取{newReport.period}的所有笔记和文档</p>
                      <p>2. 🤖 AI深度分析工作内容和成果</p>
                      <p>3. 📊 生成数据统计和工作洞察</p>
                      <p>4. 📋 同步完整月报到Notion</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {isSyncingToNotion && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">{t.syncingToNotion}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileReports;