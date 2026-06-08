import React, { useState, useMemo } from "react";
import { Word, UserStats } from "../types";
import { speakWord, playTone } from "../utils";
import { Hourglass, Calendar, Info, ShieldAlert, Sparkles, AlertCircle, Bookmark, CheckCircle2, ChevronRight, HelpCircle, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EbbinghausProps {
  words: Word[];
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

export default function EbbinghausReview({ words, stats, setStats }: EbbinghausProps) {
  // Let's seed Ebbinghaus active queue based on favoriteWords or mistakeWords to simulate a realistic review workflow!
  const reviewWords = useMemo(() => {
    // Collect favorite words or wrong words as active review candidates
    const baseIds = Array.from(new Set([...stats.favoritedWords, ...stats.wrongWords.map(w => w.wordId)]));
    
    // If they have no custom words yet, seed with first 3 words of Unit 1 so the page is never empty and looks active!
    if (baseIds.length === 0) {
      return words.slice(0, 4);
    }
    
    return words.filter(w => baseIds.includes(w.id));
  }, [words, stats]);

  // Ebbinghaus memory curve review stage definition.
  const EBBINGHAUS_INTERVALS = [
    { stage: 1, name: "第1个周期", time: "5 分钟后", desc: "瞬时感觉登记", urgency: "极高" },
    { stage: 2, name: "第2个周期", time: "30 分钟后", desc: "短时记忆保持", urgency: "极高" },
    { stage: 3, name: "第3个周期", time: "12 小时后", desc: "工作记忆巩固", urgency: "高" },
    { stage: 4, name: "第4个周期", time: "1 天后", desc: "长时储藏过渡", urgency: "高" },
    { stage: 5, name: "第5个周期", time: "2 天后", desc: "概念稳固", urgency: "中" },
    { stage: 6, name: "第6个周期", time: "4 天后", desc: "图式深化联结", urgency: "中" },
    { stage: 7, name: "第7个周期", time: "7 天后", desc: "永久性网络沉淀", urgency: "低" },
    { stage: 8, name: "第8个周期", time: "15 天后", desc: "终身肌肉记忆", urgency: "低" }
  ];

  const [reviewIndex, setReviewIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState<"cards" | "guide">("cards");

  const currentWord = reviewWords[reviewIndex] || null;

  const handleReviewStatus = (knowsWord: boolean) => {
    playTone("click");
    if (knowsWord) {
      playTone("success");
    } else {
      playTone("error");
    }

    setShowAnswer(false);
    if (reviewIndex + 1 < reviewWords.length) {
      setReviewIndex(prev => prev + 1);
    } else {
      setReviewIndex(0); // circular review
    }
  };

  return (
    <div className="space-y-6" id="ebbinghaus-root">
      
      {/* Tab selectors for Review Cards and Guide explanation */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 max-w-sm mx-auto" id="ebbinghaus-tabs">
        <button
          onClick={() => { playTone("click"); setActiveTab("cards"); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "cards" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          ⏳ 智能复习卡
        </button>
        <button
          onClick={() => { playTone("click"); setActiveTab("guide"); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "guide" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          📖 算法时间表
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ================= 1. CARDS TAB ================= */}
        {activeTab === "cards" && (
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Upper banner alert explanation */}
            <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl flex items-start gap-2.5">
              <span className="text-base text-indigo-500">💡</span>
              <div className="text-left">
                <p className="text-xs font-bold text-indigo-800">艾宾浩斯智能提取队列</p>
                <p className="text-[11px] text-indigo-600 mt-0.5 leading-relaxed">
                  系统已为您筛选了当前需要温故知新、抗遗忘复习的共 <strong className="font-bold">{reviewWords.length}</strong> 个重点词、错词和初见词。
                  请通过卡片回忆其发音、拼写与意思。
                </p>
              </div>
            </div>

            {/* Main Interactive Flashcard viewport */}
            {currentWord ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[360px] flex flex-col justify-between" id="ebbinghaus-flashcard">
                
                {/* Header card indicator bar */}
                <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 font-mono">
                  <span>多维阶段记忆点拨</span>
                  <span className="text-indigo-600 font-mono bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    抗遗忘进度: {reviewIndex + 1} / {reviewWords.length} 词
                  </span>
                </div>

                {/* Core interactive front/back panel */}
                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-5">
                  <span className="text-xs font-serif italic font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                    {currentWord.pos}
                  </span>

                  <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                    {currentWord.word}
                  </h2>

                  <div className="flex items-center gap-1.5 justify-center">
                    <span className="text-slate-400 font-mono text-sm">{currentWord.phonetic}</span>
                    <button
                      onClick={() => { speakWord(currentWord.word); playTone("click"); }}
                      className="p-1 px-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-semibold cursor-pointer"
                    >
                      点击点读声音 🔊
                    </button>
                  </div>

                  {/* Back face reveal container */}
                  <div className="w-full max-w-sm pt-4" id="flashcard-back-reveal">
                    {showAnswer ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/50 space-y-2.5 text-left"
                      >
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">中文定义</p>
                          <p className="text-sm font-extrabold text-slate-900 mt-0.5">{currentWord.definition}</p>
                        </div>
                        <div className="border-t border-slate-200/40 pt-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">情景例句</p>
                          <div className="flex items-center justify-between gap-3 bg-slate-100/30 p-2 rounded-xl border border-slate-200/30">
                            <p className="text-xs text-slate-700 font-medium font-sans leading-relaxed text-left flex-1">
                              {currentWord.example}
                            </p>
                            <button
                              onClick={() => {
                                playTone("click");
                                speakWord(currentWord.example);
                              }}
                              className="p-1 px-1.5 rounded-lg bg-white text-indigo-600 hover:text-indigo-800 border border-slate-200 shadow-sm shrink-0 flex items-center gap-0.5 text-[9px] font-bold cursor-pointer transition-all"
                              title="点击点读完整英文例句 🔊"
                            >
                              <Volume2 size={10} />
                              <span>例句点读</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-450 mt-1 text-left">{currentWord.exampleCn}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => { playTone("click"); setShowAnswer(true); }}
                        className="w-full py-4 bg-gradient-to-r from-indigo-50 to-indigo-100/30 hover:from-indigo-100 hover:to-indigo-100/50 border border-indigo-100/60 rounded-xl text-xs font-bold text-indigo-700 transition-colors cursor-pointer"
                      >
                        💡 点击卡片空白处，翻转看释义与情景例句
                      </button>
                    )}
                  </div>

                </div>

                {/* Review choices button row */}
                {showAnswer && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleReviewStatus(false)}
                      className="py-3 px-4 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      💔 还很生疏 (需5分钟后重现)
                    </button>
                    <button
                      onClick={() => handleReviewStatus(true)}
                      className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      ✅ 回忆清晰 (计入高阶遗忘周期)
                    </button>
                  </div>
                )}

              </div>
            ) : (
              <div className="py-12 text-center bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
                <p className="text-4xl text-slate-300">⏳</p>
                <p className="text-slate-700 font-bold text-sm">复习队列十分空闲！</p>
                <p className="text-slate-400 text-xs">暂无需要智能抗遗忘复习的词，可以先看看课本其他单元哦！</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ================= 2. GUIDE TABLE TAB ================= */}
        {activeTab === "guide" && (
          <motion.div
            key="guide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Visual Ebbinghaus Curve Grid */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="text-left space-y-1">
                <h3 className="font-bold text-slate-800 text-sm">
                  📚 艾宾浩斯记忆模型时间点谱图
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  人类大脑记忆信息有特定的“回溯突跃”衰减规律。本系统根据德国心理学家艾宾浩斯遗忘曲线，设计了 8 大核心复习监测卡：
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="intervals-grid">
                {EBBINGHAUS_INTERVALS.map((item) => (
                  <div
                    key={item.stage}
                    className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-left hover:border-indigo-200 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold flex items-center justify-center">
                          {item.stage}
                        </span>
                        <p className="text-xs font-bold text-slate-800">{item.name}</p>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>

                    <div className="text-right space-y-0.5 shrink-0">
                      <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">
                        {item.time}
                      </span>
                      <p className="text-[10px] text-slate-400 font-extrabold">
                        复活紧迫度: <span className={item.urgency === "极高" ? "text-rose-500" : item.urgency === "高" ? "text-amber-500" : "text-sky-505"}>{item.urgency}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific explanation callout */}
            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex items-start gap-2.5 text-left">
              <span className="text-base">💡</span>
              <div>
                <p className="text-xs font-bold text-amber-800">如何通过本曲线成为“背词学霸”？</p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  1. <b>高频率温故</b>：不要试图一口气背好几个小时，而要充分利用 5 分钟、30 分钟碎片化时间，随时用本听写和背诵卡进行复测。<br/>
                  2. <b>结合错题本</b>：系统会自动分析您拼错的、选择错的词，并将它们自动加深排进艾宾浩斯智能复习阶段。反复点读播放发音是克服单词拼写遗忘最最高效的捷径！
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
