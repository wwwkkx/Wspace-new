'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Download,
  Share2,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb,
  Target,
  BarChart3,
  TrendingUp,
  PieChart,
  Award,
  FileText,
  BookOpen,
  Brain
} from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

// 多语言翻译配置
const reportViewTranslations: Record<string, Record<string, string>> = {
  'zh-CN': {
    loading: '加载中...',
    notFound: '报告不存在',
    back: '返回',
    share: '分享',
    download: '下载',
    summary: '摘要',
    statistics: '统计',
    insights: '洞察',
    highlights: '亮点',
    actionPlan: '行动计划',
    categoryAnalysis: '分类分析',
    achievements: '成就',
    period: '报告周期',
    createdAt: '创建于',
    updatedAt: '更新于',
    totalNotes: '笔记总数',
    totalDocuments: '文档总数',
    mostActiveDay: '最活跃日期',
    categories: '分类',
    tags: '标签'
  },
  'en-US': {
    loading: 'Loading...',
    notFound: 'Report not found',
    back: 'Back',
    share: 'Share',
    download: 'Download',
    summary: 'Summary',
    statistics: 'Statistics',
    insights: 'Insights',
    highlights: 'Highlights',
    actionPlan: 'Action Plan',
    categoryAnalysis: 'Category Analysis',
    achievements: 'Achievements',
    period: 'Report Period',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    totalNotes: 'Total Notes',
    totalDocuments: 'Total Documents',
    mostActiveDay: 'Most Active Day',
    categories: 'Categories',
    tags: 'Tags'
  }
};

interface ReportViewProps {
  reportId: string
  onBack: () => void
}

interface ReportDetail {
  id: string
  title: string
  period: string
  summary: string
  statistics: {
    totalNotes: number
    totalDocuments: number
    mostActiveDay: string
    categories: Record<string, number>
  }
  highlights: string[]
  insights: string[]
  actionPlan: string[]
  categoryAnalysis: Record<string, string>
  achievements: string[]
  createdAt: string
  updatedAt: string
  year: number
  month: number
  userId: string
}

export function ReportView({ reportId, onBack }: ReportViewProps) {
  const { language } = useLanguage();
  const t = reportViewTranslations[language] || reportViewTranslations['zh-CN'];
  
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'summary' | 'statistics' | 'insights'>('summary')

  useEffect(() => {
    loadReport()
  }, [reportId])

  const loadReport = async () => {
    setIsLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟报告数据
      const mockReport: ReportDetail = {
        id: reportId,
        title: '2024年1月工作月报',
        period: '2024-01',
        summary: '本月工作总结：完成了多项重要任务，包括项目开发、文档整理等工作。通过分析，发现工作效率有所提升，团队协作良好。重点项目按计划推进，文档管理系统升级工作取得显著进展。',
        statistics: {
          totalNotes: 28,
          totalDocuments: 15,
          mostActiveDay: '2024-01-15',
          categories: {
            '工作计划': 10,
            '会议记录': 8,
            '项目文档': 12,
            '学习笔记': 6,
            '其他': 7
          }
        },
        highlights: [
          '完成了新版文档管理系统的设计和开发',
          '主导了团队协作流程优化，提升工作效率15%',
          '成功解决了3个关键技术难题',
          '完成了季度工作计划的制定',
          '参与了2次重要客户会议并获得积极反馈'
        ],
        insights: [
          '项目开发速度有所提升，但质量保证环节仍需加强',
          '团队协作模式改进后，沟通效率显著提高',
          '文档整理工作量大，建议引入自动化工具提高效率',
          '技术难题解决过程中积累了宝贵经验，应形成知识库',
          '客户反馈表明产品易用性有待提高'
        ],
        actionPlan: [
          '优化质量保证流程，引入自动化测试工具',
          '继续完善团队协作机制，定期举行经验分享会',
          '评估并引入文档自动化管理工具',
          '建立技术难题解决方案知识库',
          '根据客户反馈优化产品界面和交互设计'
        ],
        categoryAnalysis: {
          '工作计划': '工作计划类文档和笔记主要集中在月初，质量较高，执行情况良好',
          '会议记录': '会议记录内容完整，但后续任务跟踪有待加强',
          '项目文档': '项目文档结构清晰，但更新频率不够，部分文档已过时',
          '学习笔记': '学习笔记内容丰富，但缺乏系统性整理',
          '其他': '其他类型文档和笔记较为零散，建议进一步分类'
        },
        achievements: [
          '项目按时交付',
          '客户满意度提升',
          '技术能力提升',
          '团队协作改进',
          '文档质量提高'
        ],
        createdAt: '2024-01-31T10:30:00Z',
        updatedAt: '2024-01-31T14:20:00Z',
        year: 2024,
        month: 1,
        userId: 'user123'
      }
      
      setReport(mockReport)
    } catch (error) {
      console.error('Failed to load report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 下载报告（占位函数）
  const handleDownload = () => {
    console.log('Downloading report:', reportId)
    // 实际实现中应调用API下载报告
  }

  // 分享报告（占位函数）
  const handleShare = () => {
    console.log('Sharing report:', reportId)
    // 实际实现中应调用分享API或显示分享对话框
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t.notFound}</p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            {t.back}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-semibold line-clamp-1">{report.title}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Report Info */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap gap-3 mb-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {t.period}: {report.period}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {t.createdAt}: {new Date(report.createdAt).toLocaleDateString()}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 p-2 rounded-lg">
            <div className="text-lg font-semibold text-blue-600">{report.statistics.totalNotes}</div>
            <div className="text-xs text-gray-500">{t.totalNotes}</div>
          </div>
          <div className="bg-green-50 p-2 rounded-lg">
            <div className="text-lg font-semibold text-green-600">{report.statistics.totalDocuments}</div>
            <div className="text-xs text-gray-500">{t.totalDocuments}</div>
          </div>
          <div className="bg-purple-50 p-2 rounded-lg">
            <div className="text-lg font-semibold text-purple-600">{Object.keys(report.statistics.categories).length}</div>
            <div className="text-xs text-gray-500">{t.categories}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        {[
          { key: 'summary', label: t.summary, icon: BookOpen },
          { key: 'statistics', label: t.statistics, icon: PieChart },
          { key: 'insights', label: t.insights, icon: Lightbulb }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeTab === key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 rounded-none border-b-2 ${
              activeTab === key ? 'border-blue-600' : 'border-transparent'
            }`}
          >
            <Icon className="w-4 h-4 mr-1" />
            {label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {t.summary}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{report.summary}</p>
                </CardContent>
              </Card>

              {/* Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {t.highlights}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {t.actionPlan}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {report.actionPlan.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    {t.achievements}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {report.achievements.map((achievement, index) => (
                      <Badge key={index} variant="secondary" className="text-xs py-1 px-2 bg-yellow-50 text-yellow-700 border border-yellow-200">
                        <Award className="w-3 h-3 mr-1 text-yellow-500" />
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              {/* Statistics Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {t.statistics}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t.totalNotes}:</span>
                      <span className="font-medium">{report.statistics.totalNotes}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t.totalDocuments}:</span>
                      <span className="font-medium">{report.statistics.totalDocuments}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t.mostActiveDay}:</span>
                      <span className="font-medium">{new Date(report.statistics.mostActiveDay).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    {t.categories}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(report.statistics.categories).map(([category, count], index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">{category}</span>
                          <span className="text-gray-500">{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(count / (report.statistics.totalNotes + report.statistics.totalDocuments) * 100).toFixed(0)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    {t.insights}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {report.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Category Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    {t.categoryAnalysis}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(report.categoryAnalysis).map(([category, analysis], index) => (
                      <div key={index} className="space-y-1">
                        <h4 className="font-medium text-gray-800">{category}</h4>
                        <p className="text-gray-600 text-sm">{analysis}</p>
                        {index < Object.entries(report.categoryAnalysis).length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default ReportView