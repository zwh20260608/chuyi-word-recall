import React, { useState, useMemo, useEffect } from "react";
import { Word, UserStats } from "../types";
import { playTone, speakWord } from "../utils";
import { Headphones, CheckCircle, HelpCircle, ArrowRight, CornerDownLeft, Volume2, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DictationProps {
  words: Word[];
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onAddWrongWord: (wordId: string) => void;
}

export default function DictationMode({ words, stats, setStats, onAddWrongWord }: DictationProps) {
  const [selectedUnit, setSelectedUnit] = useState<number>(1);
  const [testWords, setTestWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSpelling, setUserSpelling] = useState("");
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [hintLevel, setHintLevel] = useState(0); // 0=none, 1=show length/first char, 2=show part definition

  // Compile words to test for the selected range
  const handleStartDictation = (unit: number) => {
    setSelectedUnit(unit);
    const pool = words.filter(w => w.unit === unit);
    // Shuffle the test list for authenticity
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setTestWords(shuffled);
    setCurrentIndex(0);
    setUserSpelling("");
    setHasChecked(false);
    setIsCorrect(false);
    setIsCompleted(false);
    setScore(0);
    setHintLevel(0);
    playTone("click");
  };

  // Run start dictation for Unit 1 upon initialization
  useEffect(() => {
    if (words.length > 0 && testWords.length === 0) {
      handleStartDictation(1);
    }
  }, [words]);

  const currentWord = testWords[currentIndex];

  // Self-trigger audio on loading next card
  useEffect(() => {
    if (currentWord) {
      // Small delays to avoid voice collision
      const timer = setTimeout(() => {
        speakWord(currentWord.word);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentWord, currentIndex]);

  const handlePronounce = () => {
    if (currentWord) {
      speakWord(currentWord.word);
      playTone("click");
    }
  };

  const handleCheckSpelling = () => {
    if (!currentWord || hasChecked) return;
    
    // Clean string compare - remove extra spacing, trim and lowercase
    const normalizedInput = userSpelling.trim().toLowerCase();
    const normalizedTarget = currentWord.word.trim().toLowerCase();
    
    const correct = normalizedInput === normalizedTarget;
    setIsCorrect(correct);
    setHasChecked(true);

    if (correct) {
      playTone("success");
      setScore(prev => prev + 1);
    } else {
      playTone("error");
      onAddWrongWord(currentWord.id); // Add spelling error to mistake book!
    }
  };

  const handleNextWord = () => {
    if (currentIndex + 1 < testWords.length) {
      setCurrentIndex(idx => idx + 1);
      setUserSpelling("");
      setHasChecked(false);
      setHintLevel(0);
      playTone("click");
    } else {
      setIsCompleted(true);
      playTone("level_up");
    }
  };

  // Hint helpers
  const handleRequestHint = () => {
    playTone("click");
    setHintLevel(prev => (prev < 2 ? prev + 1 : prev));
  };

  return (
    <div className="space-y-6" id="dictation-mode-root">
      
      {/* Unit Selector Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1 text-left">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Headphones className="text-indigo-500 w-4.5 h-4.5 animate-bounce" />
              听写考测台 (Spelling Dictation)
            </h3>
            <p className="text-xs text-slate-400">听发音拼写出正确的英文单词，考考您的课文单词拼写默写能力！</p>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
            <span className="text-[10px] font-bold text-slate-450 px-2">听写单元:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(u => (
              <button
                key={u}
                onClick={() => handleStartDictation(u)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedUnit === u 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dictation card Desk */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[420px] flex flex-col justify-between" id="dictation-panel-card">
        
        {testWords.length > 0 && !isCompleted ? (
          <>
            {/* Header info bar */}
            <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-slate-400">
                UNIT {selectedUnit} 阶段听写
              </span>
              <span className="text-indigo-600">
                写到第 {currentIndex + 1} 个 / 共 {testWords.length} 词
              </span>
            </div>

            {/* Speaking voice core */}
            <div className="p-6 md:p-8 flex-1 flex flex-col items-center justify-center text-center space-y-5">
              
              {/* Giant auditory round button */}
              <button
                onClick={handlePronounce}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex flex-col items-center justify-center gap-1 shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-transform duration-150 cursor-pointer"
                title="点击播放标准英式发音语音"
              >
                <Volume2 size={32} className="animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider text-indigo-100">点击播放</span>
              </button>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-400">听发音拼写单词，支持重复点击播放发音</span>
                <p className="text-sm font-mono text-slate-400">{currentWord?.phonetic}</p>
              </div>

              {/* Incremental Hints panel */}
              <div className="w-full max-w-sm" id="hints-panel">
                {hintLevel === 0 ? (
                  <button
                    onClick={handleRequestHint}
                    className="text-xs text-slate-400 hover:text-indigo-500 underline cursor-pointer"
                  >
                    💡 需要提示？（点击查看首尾字母与词意）
                  </button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-1"
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-440 border-b border-slate-200/50 pb-1.5 mb-1 bg-none">
                      <span className="font-bold">✨ 单词学练秘钥提示</span>
                      {hintLevel < 2 && (
                        <button onClick={handleRequestHint} className="text-indigo-600 font-bold hover:underline">
                          需要更多提示 →
                        </button>
                      )}
                    </div>

                    {hintLevel >= 1 && (
                      <p className="text-xs text-slate-600 font-mono">
                        长度: <strong className="font-sans font-bold text-slate-800">{currentWord.word.length}</strong> 位 / 
                        首尾字母: <span className="font-bold font-sans text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded">{currentWord.word[0]}</span> ... <span className="font-bold font-sans text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded">{currentWord.word[currentWord.word.length - 1]}</span>
                      </p>
                    )}

                    {hintLevel >= 2 && (
                      <p className="text-xs font-bold text-slate-700 mt-1">
                        含义: {currentWord.definition} ({currentWord.pos})
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Spelling Text Input desk */}
            <div className="px-6 pb-6 space-y-4" id="dictation-input-block">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="在此处输入拼写..."
                  disabled={hasChecked}
                  value={userSpelling}
                  onChange={(e) => setUserSpelling(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !hasChecked && userSpelling.trim().length > 0) {
                      handleCheckSpelling();
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-center text-lg font-bold font-sans tracking-wide text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all uppercase"
                />
                
                {/* Enter icon button */}
                {!hasChecked && (
                  <button
                    onClick={handleCheckSpelling}
                    disabled={userSpelling.trim().length === 0}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                      userSpelling.trim().length > 0 
                        ? "bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700" 
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <CornerDownLeft size={16} />
                  </button>
                )}
              </div>

              {/* Feedback report */}
              {hasChecked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-2xl border max-w-md mx-auto flex items-start gap-3 text-left ${
                    isCorrect 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="text-emerald-500 w-5 h-5" />
                    ) : (
                      <AlertCircle className="text-rose-500 w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <p className="font-extrabold text-sm">
                      {isCorrect ? "回答完全正确！太厉害啦！" : "拼写错误，请仔细核对！"}
                    </p>
                    <div className="text-xs font-medium space-y-1 text-slate-600 font-sans">
                      <p>
                        标准英文: <strong className="text-indigo-600 font-bold bg-indigo-50 px-1.5 rounded">{currentWord.word}</strong>
                      </p>
                      <p>
                        书面汉语: <span className="font-bold text-slate-700">{currentWord.definition}</span>
                      </p>
                      
                      {!isCorrect && (
                        <p className="text-[10px] text-rose-500">
                          您的输入: <span className="line-through text-rose-400">{userSpelling}</span> (该词已录入错词本)。
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleNextWord}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer transition-colors ${
                      isCorrect 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm" 
                        : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                    }`}
                  >
                    {currentIndex + 1 < testWords.length ? "下一词" : "结关报告"}
                    <ArrowRight size={13} />
                  </button>
                </motion.div>
              )}
            </div>
          </>
        ) : (
          /* Finished dictation card view */
          <div className="p-8 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-4xl shadow-md">
              🎯
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold text-slate-800">Unit {selectedUnit} 单词听写考测结束!</h2>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                同学们辛苦啦！本关听写考测已经圆满结束，您挑战了本单元全部 {testWords.length} 个重点单词。
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl max-w-sm w-full space-y-1 text-left">
              <p className="text-xs text-slate-500 font-bold flex justify-between">
                <span>听写总分:</span>
                <span className="text-slate-800 font-extrabold font-mono text-sm">{Math.round((score / testWords.length) * 100) || 0} / 100 分</span>
              </p>
              <p className="text-xs text-slate-500 font-bold flex justify-between">
                <span>拼写正确个数:</span>
                <span className="text-emerald-600 font-bold">{score} 词</span>
              </p>
              <p className="text-xs text-slate-500 font-bold flex justify-between">
                <span>拼写失误个数:</span>
                <span className="text-rose-500 font-bold">{testWords.length - score} 词</span>
              </p>
            </div>

            <button
              onClick={() => handleStartDictation(selectedUnit)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-indigo-700/50"
            >
              <RefreshCw size={13} />
              <span>重新开始本单元听写</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
