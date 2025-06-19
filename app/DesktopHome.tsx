"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { FileText, Sparkles, Upload, BarChart3, CheckCircle, Brain, Zap, Shield, X } from "lucide-react";
import { useLanguage, useTranslation } from "@/components/language-provider";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DesktopHome() {
  const { language } = useLanguage();
  const t = useTranslation();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  
  // 处理开始使用按钮点击事件
  const handleGetStarted = () => {
    // 如果用户已登录，跳转到仪表盘，否则跳转到登录页面
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Brand Name */}
        <div className="absolute top-8 left-8 z-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">Wspace</h2>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent mb-6 tracking-tight">{t.smartNoteAssistant || "智能笔记助手"}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t.aiDrivenPlatform || "AI驱动的笔记和文档管理平台，自动分析、分类、总结您的内容，并同步到Notion"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-10 py-4 rounded-3xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300" onClick={handleGetStarted}> <Sparkles className="w-5 h-5 mr-2" /> {t.getStarted || "开始使用"} </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 py-4 rounded-3xl border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 hover:scale-105 transition-all duration-300 text-gray-900 dark:text-gray-100" onClick={() => setShowAboutModal(true)}> {t.learnMore || "了解更多"} </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Features */}
      <div className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold mb-4 tracking-tight text-gray-900 dark:text-white">{t.coreFeatures || "核心功能"}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">{t.aiAsAssistant || "让AI成为您的智能助手"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <FileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-3 tracking-tight text-gray-900 dark:text-white">{t.smartNotes || "智能笔记"}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t.smartNotesDesc || "随手记录想法，AI自动生成标题、摘要、分类和标签"}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <Upload className="w-8 h-8 text-green-500 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-3 tracking-tight text-gray-900 dark:text-white">{t.documentAnalysis || "文档分析"}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t.documentAnalysisDesc || "上传文档，AI自动提取关键信息、生成摘要和问答"}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <BarChart3 className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-3 tracking-tight text-gray-900 dark:text-white">{t.monthlyReports || "月度报告"}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t.monthlyReportsDesc || "自动生成工作月报，统计分析您的学习和工作成果"}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold mb-3 tracking-tight">{t.notionSync || "Notion同步"}</h3>
                <p className="text-muted-foreground leading-relaxed">{t.notionSyncDesc || "自动同步到Notion数据库，无缝集成您的工作流"}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <Brain className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold mb-3 tracking-tight">{t.smartClassification || "智能分类"}</h3>
                <p className="text-muted-foreground leading-relaxed">{t.smartClassificationDesc || "按日常、工作、学习等维度自动分类，便于管理和查找"}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold mb-3 tracking-tight">{t.fastEfficient || "快速高效"}</h3>
                <p className="text-muted-foreground leading-relaxed">{t.fastEfficientDesc || "秒级处理，让您专注于创作，而不是整理"}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* How it works */}
      <div className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold mb-4 tracking-tight text-gray-900 dark:text-white">{t.howItWorks || "使用流程"}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">{t.simpleSteps || "简单三步，开启智能工作"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-blue-100/50 dark:border-blue-700/50">
                <span className="text-2xl font-bold text-blue-500 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{t.step1 || "记录内容"}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.step1Desc || "随时记录想法、上传文档或导入现有笔记"}</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-green-50 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-green-100/50 dark:border-green-700/50">
                <span className="text-2xl font-bold text-green-500 dark:text-green-400">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{t.step2 || "AI分析"}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.step2Desc || "AI自动分析内容，生成标题、摘要和标签"}</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-purple-100/50 dark:border-purple-700/50">
                <span className="text-2xl font-bold text-purple-500 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{t.step3 || "智能整理"}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.step3Desc || "自动分类整理，同步到Notion，生成月度报告"}</p>
            </div>
          </div>
        </div>
      </div>
      {/* CTA */}
      <div className="py-32">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 tracking-tight text-gray-900 dark:text-white">{t.readyToStart || "准备开始您的智能笔记之旅？"}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">{t.joinThousands || "加入数千名用户，体验AI驱动的知识管理"}</p>
          <Button size="lg" className="text-lg px-12 py-4 rounded-3xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300" onClick={handleGetStarted}> <Sparkles className="w-5 h-5 mr-2" /> {t.startFree || "免费开始"} </Button>
        </div>
      </div>

      {/* About Modal */}
      <Dialog open={showAboutModal} onOpenChange={setShowAboutModal}>
        <DialogContent className="max-w-2xl mx-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl p-0 overflow-hidden [&>button]:hidden">
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            {/* Content */}
            <div className="px-12 py-16 text-center">
              {/* Logo/Brand */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight mb-2">Wspace</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
              </div>
              
              {/* Main Content */}
              <div className="space-y-6">
                <h1 className="text-5xl font-medium text-gray-900 dark:text-white tracking-tight" style={{fontFamily: 'PingFang SC, -apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif'}}>敬请期待</h1>
                <p className="text-2xl font-medium text-gray-600 dark:text-gray-400 tracking-wide" style={{fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Helvetica Neue, sans-serif'}}>Coming Soon</p>
                
                {/* Decorative Elements */}
                <div className="flex justify-center space-x-2 mt-8">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
            
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 -z-10"></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}