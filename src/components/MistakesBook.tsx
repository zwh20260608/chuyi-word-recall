import React, { useState, useMemo } from "react";
import { Word, UserStats } from "../types";
import { speakWord, playTone } from "../utils";
import { Trash2, ShieldCheck, CheckCircle2, RefreshCw, Volume2, ShieldAlert, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MistakesProps {
  words: Word[];
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

export default function MistakesBook({ words, stats, setStats }: MistakesProps) {
  // Map and extract misspelled words from database
  const mistakeWordsResult = useMemo(() => {
    return stats.wrongWords.flatMap(wrongItem => {
      const matchWord = words.find(w => w.id === wrongItem.wordId);
      if (!matchWord) return [];
      return [{
        ...matchWord,
        errorCount: wrongItem.errorCount,
        lastTested: wrongItem.lastTested
      }];
    });
  }, [words, stats.wrongWords]);

  const [activeTestWordId, setActiveTestWordId] = useState<string | null>(null);
  const [testSpellingInput, setTestSpellingInput] = useState("");
  const [checkedTest, setCheckedTest] = useState(false);
  const [isTestCorrect, setIsTestCorrect] = useState(false);

  const handleRemoveMistake = (wordId: string) => {
    playTone("click");
    setStats(prev => ({
      ...prev,
      wrongWords: prev.wrongWords.filter(item => item.wordId !== wordId)
    }));
    
    // Clear out if currently testing this active word
    if (activeTestWordId === wordId) {
      setActiveTestWordId(null);
      setTestSpellingInput("");
      setCheckedTest(false);
    }
  };

  const clearAllMistakes = () => {
    if (window.confirm("您确定要清空错题本里的全部存词吗？（这将把进度重置为0个错词）")) {
      playTone("level_up");
      setStats(prev => ({
        ...prev,
        wrongWords: []
      }));
      setActiveTestWordId(null);
      setTestSpellingInput("");
      setCheckedTest(false);
    }
  };

  const handleStartRetest = (wordId: string) => {
    playTone("click");
    setActiveTestWordId(wordId);
    setTestSpellingInput("");
    setCheckedTest(false);
    setIsTestCorrect(false);
    
    // Auto-pronounced on start retest
    const match = words.find(w => w.id === wordId);
    if (match) {
      speakWord(match.word);
    }
  };

  const handleVerifyRetest = (wordId: string) => {
    const targetWord = words.find(w => w.id === wordId);
    if (!targetWord) return;

    const correct = testSpellingInput.trim().toLowerCase() === targetWord.word.trim().toLowerCase();
    setIsTestCorrect(correct);
    setCheckedTest(true);

    if (correct) {
      playTone("success");
    } else {
      playTone("error");
    }
  };

  const handleCompleteRetestSuccess = (wordId: string) => {
    // If spelling matches successfully, we take it out of mistakes!
    playTone("level_up");
    handleRemoveMistake(wordId);
  };

  return (
    <div className="space-y-6" id="mistakes-book-root">
      
      {/* Visual header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="text-left space-y-1">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <ShieldAlert className="text-rose-500 w-4.5 h-4.5" />
            错题本归集板 (Mistakes Register)
          </h3>
          <p className="text-xs text-slate-400">
            当您在 <b>“🎯 闯关背诵”、“⚡ 随机抽查”</b> 或 <b>“🎧 单词听写”</b> 挑战时遭遇拼写或译词错误，系统会智能为您收容于此。
          </p>
        </div>

        {mistakeWordsResult.length > 0 && (
          <button
            onClick={clearAllMistakes}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 bg-slate-50 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all cursor-pointer border border-slate-205"
          >
            <Trash2 size={13} />
            清空所有错词
          </button>
        )}
      </div>

      {mistakeWordsResult.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="mistakes-cards-grid">
          <AnimatePresence mode="popLayout">
            {mistakeWordsResult.map((item) => {
              const isCurrentlyTesting = activeTestWordId === item.id;
              
              return (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`bg-white p-5 rounded-2xl border transition-all text-left space-y-3.5 ${
                    isCurrentlyTesting 
                      ? "border-rose-450 ring-2 ring-rose-50 md:col-span-2 shadow-md bg-rose-50/10" 
                      : "border-slate-100 shadow-sm hover:border-slate-200"
                  }`}
                  id={`mistake-card-${item.id}`}
                >
                  
                  {/* Word title header block */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-lg font-extrabold text-slate-900 font-sans tracking-tight">
                          {isCurrentlyTesting ? "****" : item.word}
                        </span>
                        <span className="text-[10px] text-indigo-500 bg-indigo-50 px-1.5 rounded font-bold font-serif italic">
                          {item.pos}
                        </span>
                        <span className="text-[10px] text-rose-550 bg-rose-50 border border-rose-100 px-1.5 rounded font-mono font-bold">
                          写错 {item.errorCount} 次
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">教材章节: Unit {item.unit} / {item.page}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Hear spelling button */}
                      <button
                        onClick={() => { speakWord(item.word); playTone("click"); }}
                        className="p-1 px-1.5 rounded bg-slate-50 hover:bg-slate-100/80 text-slate-500 text-xs flex items-center gap-0.5 cursor-pointer"
                        title="标准情调放音"
                      >
                        <Volume2 size={13} />
                        听读音
                      </button>

                      {/* Remove spelling trigger button */}
                      <button
                        onClick={() => handleRemoveMistake(item.id)}
                        className="p-1 px-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs cursor-pointer"
                        title="标记完全掌握并移出错题本"
                      >
                        已掌握移除
                      </button>
                    </div>
                  </div>

                  {/* Standard Definition representation */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">中文定义</p>
                    <p className="text-xs font-bold text-slate-700">{item.definition}</p>
                  </div>

                  {/* Active spelling re-test block inside card */}
                  {isCurrentlyTesting ? (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-rose-50/20 p-4 rounded-xl border border-rose-100 space-y-3"
                    >
                      <p className="text-xs font-extrabold text-rose-800">🎯 课后听音自救默写再测：</p>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="输入重新拼写的英文单词..."
                          value={testSpellingInput}
                          disabled={checkedTest}
                          onChange={(e) => setTestSpellingInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !checkedTest && testSpellingInput.trim().length > 0) {
                              handleVerifyRetest(item.id);
                            }
                          }}
                          className="flex-1 bg-white border border-rose-200 rounded-xl px-3 py-1.8 text-sm outline-none font-bold font-sans text-slate-700 uppercase"
                        />
                        
                        {!checkedTest ? (
                          <button
                            onClick={() => handleVerifyRetest(item.id)}
                            disabled={testSpellingInput.trim().length === 0}
                            className="bg-indigo-600 text-white rounded-xl px-4 text-xs font-extrabold cursor-pointer transition-colors"
                          >
                            核验
                          </button>
                        ) : (
                          <button
                            onClick={() => { setCheckedTest(false); setTestSpellingInput(""); }}
                            className="bg-slate-105 hover:bg-slate-201 text-slate-600 rounded-xl px-3 text-xs font-bold cursor-pointer"
                          >
                            重打
                          </button>
                        )}
                      </div>

                      {checkedTest && (
                        <div className="flex items-center justify-between text-xs pt-1.5">
                          {isTestCorrect ? (
                            <>
                              <span className="text-emerald-600 font-bold">✨ 回答正确！您已克服本错误！</span>
                              <button
                                onClick={() => handleCompleteRetestSuccess(item.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.2 rounded-lg cursor-pointer transition-all"
                              >
                                移出本错题 👏
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-rose-600 font-bold">❌ 拼写依旧不合。正确答案应该为: {item.word}</span>
                              <button
                                onClick={() => setActiveTestWordId(null)}
                                className="text-slate-500 hover:text-slate-705 text-[10px] font-bold cursor-pointer underline"
                              >
                                稍后再试
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="font-mono">错词登记时间: 2026-06-08 22:24</span>
                      <button
                        onClick={() => handleStartRetest(item.id)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                      >
                        🔊 重新播放听音默写再测 →
                      </button>
                    </div>
                  )}

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-12 text-center bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl mx-auto shadow-sm">
            🏆
          </div>
          <p className="text-slate-700 font-bold text-sm">绝伦成就！错题本一尘不染！</p>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            说明您当前所挑战的英语听写、背诵闯关题已经录入了完美的全对战绩！继续保持学霸气势，向新的单元发起冲击吧！
          </p>
        </div>
      )}

    </div>
  );
}
