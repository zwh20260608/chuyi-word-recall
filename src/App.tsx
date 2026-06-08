/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserStats, Word } from "./types";
import { JUNIOR_ONE_SEMESTER_TWO_VOCAB } from "./data";
import { playTone } from "./utils";
import Dashboard from "./components/Dashboard";
import VocabBrowser from "./components/VocabBrowser";
import PracticeModes from "./components/PracticeModes";
import DictationMode from "./components/DictationMode";
import EbbinghausReview from "./components/EbbinghausReview";
import MistakesBook from "./components/MistakesBook";
import { BookOpen, Calendar, HelpCircle, Inbox, Award, BookMarked, GraduationCap, Sparkles, TrendingUp, NotebookTabs } from "lucide-react";

const LOCAL_STORAGE_KEY = "junior_english_vocab_memo_stats";

const INITIAL_STATS: UserStats = {
  masteredWords: [],
  favoritedWords: [],
  wrongWords: [],
  checkInDates: [],
  dailyGoal: 10,
  streak: 0
};

export default function App() {
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);

  // Read stats from localStorage on initialization
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setStats(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load user state from cache database:", err);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stats));
    } catch (err) {
      console.error("Failed to persist user state to device localStorage:", err);
    }
  }, [stats]);

  // Tab navigation states
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Helper callbacks to log errors to state
  const handleAddWrongWord = (wordId: string) => {
    setStats(prev => {
      const existing = prev.wrongWords.find(item => item.wordId === wordId);
      let updatedWrongWords;
      if (existing) {
        updatedWrongWords = prev.wrongWords.map(item => 
          item.wordId === wordId 
            ? { ...item, errorCount: item.errorCount + 1, lastTested: new Date().toISOString() }
            : item
        );
      } else {
        updatedWrongWords = [
          ...prev.wrongWords, 
          { wordId, errorCount: 1, lastTested: new Date().toISOString() }
        ];
      }
      return {
        ...prev,
        wrongWords: updatedWrongWords
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans pb-16 md:pb-0 flex flex-col md:flex-row">
      
      {/* 1. LEFT SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-5 space-y-6 shrink-0 relative">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-black text-md">A+</span>
          </div>
          <div className="text-left font-sans">
            <h1 className="font-extrabold text-sm text-slate-900 tracking-tight">课文同步背单词</h1>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">人教同步版</p>
          </div>
        </div>

        {/* Navigation lists */}
        <nav className="flex-1 space-y-1.5 text-left text-xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-2.5 mb-2 select-none">主控制台 Panel</p>
          
          <button
            onClick={() => { playTone("click"); setActiveTab("dashboard"); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-black transition-all cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            📊 学习进度台
          </button>

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-2.5 pt-4 mb-2 select-none">核心学练 Core</p>

          <button
            onClick={() => { playTone("click"); setActiveTab("recite"); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-black transition-all cursor-pointer ${
              activeTab === "recite" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            📖 课本同步词库
          </button>

          <button
            onClick={() => { playTone("click"); setActiveTab("practice"); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-black transition-all cursor-pointer ${
              activeTab === "practice" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            🎯 闯关背词/抽查
          </button>

          <button
            onClick={() => { playTone("click"); setActiveTab("dictation"); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-black transition-all cursor-pointer ${
              activeTab === "dictation" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            🎧 标准听写大师
          </button>

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-2.5 pt-4 mb-2 select-none">高阶防遗忘 Curve</p>

          <button
            onClick={() => { playTone("click"); setActiveTab("ebbinghaus"); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-black transition-all cursor-pointer ${
              activeTab === "ebbinghaus" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            ⏳ 艾宾浩斯复习
          </button>

          <button
            onClick={() => { playTone("click"); setActiveTab("mistakes"); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-black transition-all cursor-pointer ${
              activeTab === "mistakes" 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-3">🚨 错词听写本</span>
            {stats.wrongWords.length > 0 && (
              <span className={`px-2 py-0.2 text-[10px] font-black rounded-full ${
                activeTab === "mistakes" ? "bg-white text-blue-600" : "bg-rose-500 text-white"
              }`}>
                {stats.wrongWords.length}
              </span>
            )}
          </button>
        </nav>

        {/* Mascot / Footer block */}
        <div className="bg-slate-50 p-4 rounded-2xl text-left space-y-1 border border-slate-200 select-none">
          <p className="text-[11px] font-black text-slate-800 flex items-center gap-1">
            <span className="animate-bounce text-xs">🎓</span>
            打卡同步学成器
          </p>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            涵盖PEP人教版七年级英语下册附录生词，Bento 栅格极简美学界面。
          </p>
        </div>
      </aside>

      {/* 2. MOBILE HEADER BAR */}
      <header className="md:hidden flex items-center justify-between bg-white px-5 py-4 border-b border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-black text-sm">A+</span>
          </div>
          <h1 className="font-extrabold text-sm text-slate-900 tracking-tight">课文同步背单词</h1>
        </div>
        {stats.wrongWords.length > 0 && (
          <button
            onClick={() => { playTone("click"); setActiveTab("mistakes"); }}
            className="text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-rose-100"
          >
            🚨 错题 ({stats.wrongWords.length})
          </button>
        )}
      </header>

      {/* 3. CORE COMPONENT PANEL */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-5 overflow-y-auto">
        
        {/* Unified Bento Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-5 mb-1 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <span className="text-white font-black text-lg">A+</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
                {activeTab === "dashboard" && "学霸智能控制台"}
                {activeTab === "recite" && "课本同步词霸"}
                {activeTab === "practice" && "单元多维闯关"}
                {activeTab === "dictation" && "标准听写考测台"}
                {activeTab === "ebbinghaus" && "艾宾浩斯智能提取"}
                {activeTab === "mistakes" && "错词生词归集簿"}
              </h1>
              <p className="text-xs text-slate-400 font-bold font-sans">
                {activeTab === "dashboard" && "初二下学期英语同步背词 · 人教版"}
                {activeTab === "recite" && "PEP人教大纲生词速查点读"}
                {activeTab === "practice" && "四选一拼写单词卡大挑战"}
                {activeTab === "dictation" && "听读音拼写默写标准听力测试"}
                {activeTab === "ebbinghaus" && "德国艾宾浩斯抗遗忘追踪曲线"}
                {activeTab === "mistakes" && "生疏写错的顽固词自救强化归集本"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {/* 打卡天数 */}
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 flex items-center gap-3 shadow-xs select-none">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">背诵打卡</span>
                <span className="text-xs font-black text-slate-700">连续 {stats.streak} 天</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 font-bold">
                🔥
              </div>
            </div>
            
            {/* Mode Indicator badge */}
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-blue-600 font-black text-xs uppercase select-none">
              {activeTab.slice(0, 3)}
            </div>
          </div>
        </header>

        {/* Render child panels with complete injected models */}
        {activeTab === "dashboard" && (
          <Dashboard 
            stats={stats} 
            setStats={setStats} 
            words={JUNIOR_ONE_SEMESTER_TWO_VOCAB} 
            onNavigate={(tab) => { setActiveTab(tab); }}
          />
        )}

        {activeTab === "recite" && (
          <VocabBrowser 
            words={JUNIOR_ONE_SEMESTER_TWO_VOCAB} 
            stats={stats} 
            setStats={setStats} 
          />
        )}

        {activeTab === "practice" && (
          <PracticeModes 
            words={JUNIOR_ONE_SEMESTER_TWO_VOCAB} 
            stats={stats} 
            setStats={setStats} 
            onAddWrongWord={handleAddWrongWord}
          />
        )}

        {activeTab === "dictation" && (
          <DictationMode 
            words={JUNIOR_ONE_SEMESTER_TWO_VOCAB} 
            stats={stats} 
            setStats={setStats} 
            onAddWrongWord={handleAddWrongWord}
          />
        )}

        {activeTab === "ebbinghaus" && (
          <EbbinghausReview 
            words={JUNIOR_ONE_SEMESTER_TWO_VOCAB} 
            stats={stats} 
            setStats={setStats} 
          />
        )}

        {activeTab === "mistakes" && (
          <MistakesBook 
            words={JUNIOR_ONE_SEMESTER_TWO_VOCAB} 
            stats={stats} 
            setStats={setStats} 
          />
        )}
      </main>

      {/* 4. MOBILE BOTTOM NAV-BAR (Fixed) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200/90 flex items-center justify-around z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] text-[10px]">
        <button
          onClick={() => { playTone("click"); setActiveTab("dashboard"); }}
          className={`flex flex-col items-center gap-1.5 py-1 px-3 rounded-lg ${
            activeTab === "dashboard" ? "text-indigo-600 font-extrabold" : "text-slate-400"
          }`}
        >
          <span className="text-lg">📊</span>
          <span>学习台</span>
        </button>

        <button
          onClick={() => { playTone("click"); setActiveTab("recite"); }}
          className={`flex flex-col items-center gap-1.5 py-1 px-3 rounded-lg ${
            activeTab === "recite" ? "text-indigo-600 font-extrabold" : "text-slate-400"
          }`}
        >
          <span className="text-lg">📖</span>
          <span>同步词库</span>
        </button>

        <button
          onClick={() => { playTone("click"); setActiveTab("practice"); }}
          className={`flex flex-col items-center gap-1.5 py-1 px-3 rounded-lg ${
            activeTab === "practice" ? "text-indigo-600 font-extrabold" : "text-slate-400"
          }`}
        >
          <span className="text-lg">🎯</span>
          <span>多维闯关</span>
        </button>

        <button
          onClick={() => { playTone("click"); setActiveTab("dictation"); }}
          className={`flex flex-col items-center gap-1.5 py-1 px-3 rounded-lg ${
            activeTab === "dictation" ? "text-indigo-600 font-extrabold" : "text-slate-400"
          }`}
        >
          <span className="text-lg">🎧</span>
          <span>听音默写</span>
        </button>

        <button
          onClick={() => { playTone("click"); setActiveTab("ebbinghaus"); }}
          className={`flex flex-col items-center gap-1.5 py-1 px-3 rounded-lg ${
            activeTab === "ebbinghaus" ? "text-indigo-600 font-extrabold" : "text-slate-400"
          }`}
        >
          <span className="text-lg">⏳</span>
          <span>抗遗忘</span>
        </button>
      </nav>

    </div>
  );
}
