import React, { useState, useMemo, useEffect } from "react";
import { Word, UserStats } from "../types";
import { speakWord, playTone } from "../utils";
import { Flame, Star, Trophy, ArrowRight, RefreshCw, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle, Bookmark, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PracticeProps {
  words: Word[];
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onAddWrongWord: (wordId: string) => void;
}

type PracticeSubTab = "breakthrough" | "custom" | "randomQuiz";

export default function PracticeModes({ words, stats, setStats, onAddWrongWord }: PracticeProps) {
  const [subTab, setSubTab] = useState<PracticeSubTab>("breakthrough");

  // ================= 1. BREAKTHROUGH CHALLENGE (闯关背诵) =================
  const [activeUnit, setActiveUnit] = useState<number>(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [completedBreakthrough, setCompletedBreakthrough] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Generate words for the selected Unit
  const unitWords = useMemo(() => {
    return words.filter(w => w.unit === activeUnit);
  }, [words, activeUnit]);

  // Generate 4 multiple-choice options (the correct one + 3 random ones from ALL other words)
  const choices = useMemo(() => {
    if (unitWords.length === 0 || questionIndex >= unitWords.length) return [];
    
    const correctWord = unitWords[questionIndex];
    const pool = words.filter(w => w.id !== correctWord.id);
    
    // Choose 3 distinct random words for wrong options
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const wrongOptions = shuffledPool.slice(0, 3);
    
    const optionsList = [
      { id: correctWord.id, isCorrect: true, definition: correctWord.definition, word: correctWord.word },
      ...wrongOptions.map(w => ({ id: w.id, isCorrect: false, definition: w.definition, word: w.word }))
    ];
    
    // Shuffle the options
    return optionsList.sort(() => 0.5 - Math.random());
  }, [unitWords, questionIndex, words]);

  // Handle unit select resets
  const handleUnitChange = (unit: number) => {
    setActiveUnit(unit);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setHasCheckedAnswer(false);
    setCompletedBreakthrough(false);
    setCorrectCount(0);
    playTone("click");
  };

  const handleSelectAnswer = (optionId: string) => {
    if (hasCheckedAnswer) return;
    setSelectedAnswer(optionId);
    setHasCheckedAnswer(true);

    const isRight = optionId === unitWords[questionIndex].id;
    if (isRight) {
      playTone("success");
      setCorrectCount(prev => prev + 1);
    } else {
      playTone("error");
      onAddWrongWord(unitWords[questionIndex].id); // Auto logged into Mistakes Notebook!
    }
  };

  const handleNextQuestion = () => {
    playTone("click");
    if (questionIndex + 1 < unitWords.length) {
      setQuestionIndex(index => index + 1);
      setSelectedAnswer(null);
      setHasCheckedAnswer(false);
    } else {
      setCompletedBreakthrough(true);
      playTone("level_up");
      
      // If the user achieved perfection, automatically record daily check for them or reward
      if (correctCount + (selectedAnswer === unitWords[questionIndex].id ? 1 : 0) === unitWords.length && !stats.masteredWords.includes(unitWords[0].id)) {
        // Boost feedback
      }
    }
  };

  const handleRestartUnit = () => {
    playTone("click");
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setHasCheckedAnswer(false);
    setCompletedBreakthrough(false);
    setCorrectCount(0);
  };


  // ================= 2. CUSTOM FAIVORITE RECITALS (自定义背词列表) =================
  const [hideMeanings, setHideMeanings] = useState<Record<string, boolean>>({});
  const favoriteWords = useMemo(() => {
    return words.filter(w => stats.favoritedWords.includes(w.id));
  }, [words, stats.favoritedWords]);

  const toggleMeaningVisibility = (id: string) => {
    playTone("click");
    setHideMeanings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleFavorite = (wordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playTone("click");
    setStats(prev => ({
      ...prev,
      favoritedWords: prev.favoritedWords.filter(id => id !== wordId)
    }));
  };


  // ================= 3. RANDOM ASSESSMENT QUIZ (随机抽查评估) =================
  const [randomQuizWords, setRandomQuizWords] = useState<Word[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const startRandomQuiz = () => {
    playTone("click");
    // Pick 10 random words from entire list
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    setRandomQuizWords(shuffled.slice(0, 10));
    setQuizIndex(0);
    setQuizSelected(null);
    setQuizChecked(false);
    setQuizCorrect(0);
    setQuizCompleted(false);
  };

  useEffect(() => {
    if (words.length > 0 && randomQuizWords.length === 0) {
      const shuffled = [...words].sort(() => 0.5 - Math.random());
      setRandomQuizWords(shuffled.slice(0, 10));
    }
  }, [words]);

  const quizChoices = useMemo(() => {
    if (randomQuizWords.length === 0 || quizIndex >= randomQuizWords.length) return [];
    
    const correctW = randomQuizWords[quizIndex];
    const pool = words.filter(w => w.id !== correctW.id);
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const wrongOptions = shuffledPool.slice(0, 3);
    
    const list = [
      { id: correctW.id, isCorrect: true, definition: correctW.definition, word: correctW.word },
      ...wrongOptions.map(w => ({ id: w.id, isCorrect: false, definition: w.definition, word: w.word }))
    ];
    return list.sort(() => 0.5 - Math.random());
  }, [randomQuizWords, quizIndex, words]);

  const handleSelectQuiz = (optionId: string) => {
    if (quizChecked) return;
    setQuizSelected(optionId);
    setQuizChecked(true);

    const isRight = optionId === randomQuizWords[quizIndex].id;
    if (isRight) {
      playTone("success");
      setQuizCorrect(prev => prev + 1);
    } else {
      playTone("error");
      onAddWrongWord(randomQuizWords[quizIndex].id); // Auto log to mistake notebook
    }
  };

  const nextQuizQuestion = () => {
    playTone("click");
    if (quizIndex + 1 < randomQuizWords.length) {
      setQuizIndex(idx => idx + 1);
      setQuizSelected(null);
      setQuizChecked(false);
    } else {
      setQuizCompleted(true);
      playTone("level_up");
    }
  };

  return (
    <div className="space-y-6" id="practice-modes-root">
      
      {/* Sub tabs selectors */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 max-w-lg mx-auto" id="subtabs-bar">
        {(["breakthrough", "custom", "randomQuiz"] as PracticeSubTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { playTone("click"); setSubTab(tab); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === tab 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab === "breakthrough" && "🎯 闯关背诵"}
            {tab === "custom" && "⭐ 重点记词"}
            {tab === "randomQuiz" && "⚡ 随机抽查"}
          </button>
        ))}
      </div>

      {/* Mode Renderings */}
      <AnimatePresence mode="wait">
        
        {/* ================= 1. BREAKTHROUGH CHALLENGE ================= */}
        {subTab === "breakthrough" && (
          <motion.div 
            key="breakthrough"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Unit Picker for level selection */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3.5">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Trophy className="text-amber-500 w-4.5 h-4.5" />
                选择单元关卡
              </h3>
              
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(unit => (
                  <button
                    key={unit}
                    onClick={() => handleUnitChange(unit)}
                    className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeUnit === unit 
                        ? "bg-indigo-600 text-white shadow" 
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/50"
                    }`}
                  >
                    第 {unit} 关
                  </button>
                ))}
              </div>
            </div>

            {/* Main challenge board */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[380px] flex flex-col justify-between" id="challenge-board-card">
              
              {!completedBreakthrough ? (
                <>
                  {/* Word Info Header */}
                  <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      单元闯关 / UNIT {activeUnit}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-mono">
                      进度: {questionIndex + 1} / {unitWords.length} 词
                    </span>
                  </div>

                  {/* Question Section */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <span className="text-xs font-serif italic font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                      {unitWords[questionIndex]?.pos}
                    </span>
                    
                    <h2 className="text-3.5xl font-extrabold text-slate-900 tracking-tight font-sans">
                      {unitWords[questionIndex]?.word}
                    </h2>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-sm">{unitWords[questionIndex]?.phonetic}</span>
                      <button 
                        onClick={() => { speakWord(unitWords[questionIndex]?.word); playTone("click"); }}
                        className="p-1 px-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        英音 🔊
                      </button>
                    </div>

                    <p className="text-xs text-slate-400">
                      请选择上方英文单词所对应的正确中文释义：
                    </p>
                  </div>

                  {/* 4 Choices Grid */}
                  <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-3" id="breakthrough-answers-grid">
                    {choices.map((option) => {
                      const isSelected = selectedAnswer === option.id;
                      const isCorrectAnswer = option.isCorrect;
                      
                      // Highlight styles after checking
                      let cardStyle = "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/80";
                      if (hasCheckedAnswer) {
                        if (isCorrectAnswer) {
                          cardStyle = "bg-emerald-500 border-emerald-500 text-white font-bold";
                        } else if (isSelected) {
                          cardStyle = "bg-rose-500 border-rose-500 text-white font-bold";
                        } else {
                          cardStyle = "bg-slate-50 border-slate-200 text-slate-300 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={option.id}
                          disabled={hasCheckedAnswer}
                          onClick={() => handleSelectAnswer(option.id)}
                          className={`w-full p-4 rounded-xl border text-left text-xs md:text-sm transition-all duration-200 cursor-pointer ${cardStyle}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span>{option.definition}</span>
                            {hasCheckedAnswer && isCorrectAnswer && (
                              <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
                            )}
                            {hasCheckedAnswer && isSelected && !isCorrectAnswer && (
                              <AlertCircle className="w-5 h-5 shrink-0 text-white" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Proceed Panel */}
                  {hasCheckedAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3"
                    >
                      <div className="text-left">
                        {selectedAnswer === unitWords[questionIndex].id ? (
                          <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <span>✅ 回答正确！十分优秀！</span>
                          </p>
                        ) : (
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                              <span>❌ 回答有误：正确答案是【{unitWords[questionIndex].definition}】</span>
                            </p>
                            <p className="text-[10px] text-slate-400">该单词已自动加入错题本，稍后可在错题本里进行巩固学练。</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleNextQuestion}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 hover:bg-indigo-700 cursor-pointer"
                      >
                        {questionIndex + 1 < unitWords.length ? "下一词" : "查看结关情况"}
                        <ArrowRight size={13} />
                      </button>
                    </motion.div>
                  )}
                </>
              ) : (
                /* Completed Stage card view */
                <div className="p-8 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
                  <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-4xl shadow-md">
                    👑
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-slate-800">Unit {activeUnit} 关卡闯关完成!</h2>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                      太棒了！本关卡共有 {unitWords.length} 个重点单词，您答对了其中 <strong className="text-emerald-600 font-bold">{correctCount}</strong> 个！
                    </p>
                  </div>

                  {/* Rating indicator stars */}
                  <div className="flex gap-1 text-2xl text-amber-400 justify-center">
                    {Array.from({ length: 3 }).map((_, i) => {
                      const scoreRatio = correctCount / unitWords.length;
                      let starFilled = false;
                      if (i === 0 && scoreRatio >= 0.3) starFilled = true;
                      if (i === 1 && scoreRatio >= 0.7) starFilled = true;
                      if (i === 2 && scoreRatio >= 0.95) starFilled = true;
                      
                      return (
                        <span key={i} className={starFilled ? "opacity-100 scale-110" : "opacity-30"}>
                          ★
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-3 max-w-xs justify-center">
                    <button
                      onClick={handleRestartUnit}
                      className="flex-1 min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      重新闯此关
                    </button>
                    <button
                      onClick={() => handleUnitChange(activeUnit < 8 ? activeUnit + 1 : 1)}
                      className="flex-1 min-w-[120px] bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      {activeUnit < 8 ? "点击进入下一关" : "回至第一关"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}

        {/* ================= 2. CUSTOM SECRETS RECITAL LISTS ================= */}
        {subTab === "custom" && (
          <motion.div 
            key="custom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header description */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Star className="text-amber-500 w-4.5 h-4.5 fill-amber-100" />
                我的重点词汇收藏本
              </h3>
              <p className="text-xs text-slate-400">
                本栏目汇总了您在查词列表中点击 “⭐星标” 按钮标记的多记单词，可独立隐藏中文释义，便于高效、反复自测、听写背记。
              </p>
            </div>

            {favoriteWords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="custom-recite-grid">
                {favoriteWords.map((item) => {
                  const hideMeaning = hideMeanings[item.id] !== false; // defaulted to hide meanings for test
                  return (
                    <div
                      key={item.id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3 relative hover:shadow transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-extrabold text-slate-900 font-sans">{item.word}</span>
                            <span className="text-[10px] font-serif italic text-indigo-500 bg-indigo-50 px-1.5 rounded">{item.pos}</span>
                          </div>
                          <p className="text-xs font-mono text-slate-400">{item.phonetic}</p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Pronounce word */}
                          <button
                            onClick={() => { speakWord(item.word); playTone("click"); }}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 cursor-pointer text-xs"
                            title="点读"
                          >
                            🔊 播音
                          </button>

                          {/* Heart delete */}
                          <button
                            onClick={(e) => toggleFavorite(item.id, e)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 cursor-pointer"
                            title="移出生词卡"
                          >
                            移出
                          </button>
                        </div>
                      </div>

                      {/* Cover-up mask for testing */}
                      <div className="p-3 bg-slate-50 rounded-xl relative overflow-hidden text-left min-h-[48px] flex items-center justify-between border border-slate-100">
                        {hideMeaning ? (
                          <div className="flex items-center gap-1 text-xs text-slate-400 select-none italic font-mono">
                            <EyeOff size={13} />
                            <span>释义已隐藏，遮挡背诵中</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-700 font-sans leading-tight">
                            {item.definition}
                          </span>
                        )}

                        <button
                          onClick={() => toggleMeaningVisibility(item.id)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline shrink-0 cursor-pointer"
                        >
                          {hideMeaning ? "点我显示" : "点击遮挡"}
                        </button>
                      </div>

                      {/* Display Example sentence */}
                      <div className="text-[11px] text-slate-400 text-left border-t border-dashed border-slate-100 pt-2 font-mono">
                        <span>课本来源: Unit {item.unit} / {item.page}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
                <p className="text-4xl text-slate-300">⭐</p>
                <p className="text-slate-700 font-bold text-sm">重点记词本里空空如也</p>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  您可以先前往 <b>“📖 同步词库”</b> 列表中，把您觉得难记、或者重点需要复习的词汇，点击 <b>“⭐” 星标星号</b>，它便会收集在这里啦！
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ================= 3. RANDOM ASSESSMENT QUIZ ================= */}
        {subTab === "randomQuiz" && (
          <motion.div 
            key="randomQuiz"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header intro widgets */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="text-left space-y-1">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Flame className="text-indigo-500 w-4.5 h-4.5" />
                  大纲交叉随机抽查
                </h3>
                <p className="text-xs text-slate-400">
                  随机抽取大纲中任意 10 个词汇，考核您的瞬间识词反映力与释义拼写匹配技巧。
                </p>
              </div>

              <button
                onClick={startRandomQuiz}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-all border border-indigo-700/50"
              >
                <RefreshCw size={13} />
                换一组词重测
              </button>
            </div>

            {/* Random Quiz main dashboard */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[380px] flex flex-col justify-between" id="quiz-board">
              
              {randomQuizWords.length > 0 && !quizCompleted ? (
                <>
                  {/* Status header */}
                  <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      随机全词库统考抽测
                    </span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-mono">
                      Question: {quizIndex + 1} / 10
                    </span>
                  </div>

                  {/* Body question content */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <span className="text-xs font-serif italic font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                      Unit {randomQuizWords[quizIndex]?.unit} / {randomQuizWords[quizIndex]?.pos}
                    </span>

                    <h2 className="text-3.5xl font-extrabold text-slate-900 tracking-tight font-sans">
                      {randomQuizWords[quizIndex]?.word}
                    </h2>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-450 font-mono text-sm">{randomQuizWords[quizIndex]?.phonetic}</span>
                      <button
                        onClick={() => { speakWord(randomQuizWords[quizIndex]?.word); playTone("click"); }}
                        className="p-1 px-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-semibold cursor-pointer"
                      >
                        读音 🔊
                      </button>
                    </div>
                  </div>

                  {/* MCQ choices */}
                  <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quizChoices.map((choice) => {
                      const isChooseThis = quizSelected === choice.id;
                      const isCorrect = choice.isCorrect;

                      let itemStyle = "bg-slate-50 border-slate-200 hover:bg-slate-100/90 text-slate-705";
                      if (quizChecked) {
                        if (isCorrect) {
                          itemStyle = "bg-emerald-500 border-emerald-500 text-white font-bold";
                        } else if (isChooseThis) {
                          itemStyle = "bg-rose-500 border-rose-500 text-white font-bold";
                        } else {
                          itemStyle = "bg-slate-50 border-slate-100 text-slate-350 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={choice.id}
                          disabled={quizChecked}
                          onClick={() => handleSelectQuiz(choice.id)}
                          className={`p-4 rounded-xl border text-left text-xs md:text-sm transition-all cursor-pointer ${itemStyle}`}
                        >
                          <div className="flex items-start justify-between">
                            <span>{choice.definition}</span>
                            {quizChecked && isCorrect && <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />}
                            {quizChecked && isChooseThis && !isCorrect && <ShieldAlert className="w-5 h-5 shrink-0 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer proceed panel */}
                  {quizChecked && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3"
                    >
                      <div className="text-left space-y-1">
                        {quizSelected === randomQuizWords[quizIndex].id ? (
                          <p className="text-xs font-bold text-emerald-600">👍 打得很棒！顺利斩获本题！</p>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-rose-600">
                              💔 回答失误。正确翻译是【{randomQuizWords[quizIndex].definition}】
                            </p>
                            <p className="text-[10px] text-slate-400">该生词已为您智能塞入错题本。</p>
                          </>
                        )}
                      </div>

                      <button
                        onClick={nextQuizQuestion}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-indigo-700 cursor-pointer shrink-0 transition-colors"
                      >
                        {quizIndex + 1 < 10 ? "下一题" : "查看综合报告"}
                        <ArrowRight size={13} />
                      </button>
                    </motion.div>
                  )}
                </>
              ) : (
                /* Completed quiz card reporting */
                <div className="p-8 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-4xl shadow-md">
                    🎓
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-2xl font-extrabold text-slate-800">随机抽考测试顺利完成!</h2>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                      辛苦了！在精选的 10 个全单元交叉抽测词中，您共答对了 <strong className="text-indigo-600 font-extrabold">{quizCorrect}</strong> 个！
                    </p>
                  </div>

                  {/* Encouraging badge text based on grade percentage */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm w-full">
                    {quizCorrect === 10 ? (
                      <p className="text-xs font-bold text-emerald-600">🏆 完美分！满分学霸降临！全词库词汇掌控登峰造极！</p>
                    ) : quizCorrect >= 8 ? (
                      <p className="text-xs font-bold text-indigo-600">✨ 极佳战绩！优秀成绩！离满分成就学神只有一步之遥！</p>
                    ) : quizCorrect >= 6 ? (
                      <p className="text-xs font-bold text-amber-600">⚡ 还算合格！加油，可以通过多次抽测让正确率跃升到 90% 以上哦！</p>
                    ) : (
                      <p className="text-xs font-bold text-rose-500">📖 需要加深温习！错题已被系统安全汇总错题本，多去消化错词哦！</p>
                    )}
                  </div>

                  <button
                    onClick={startRandomQuiz}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs cursor-pointer transition-all"
                  >
                    立即再测一次
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
