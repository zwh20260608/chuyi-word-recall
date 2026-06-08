import React, { useState, useMemo } from "react";
import { UserStats, Word } from "../types";
import { getFormattedToday, playTone, getRandomMotto, speakWord } from "../utils";
import { CheckCircle2, Award, Calendar, Flame, ChevronRight, Zap, GraduationCap, Sparkles, Volume2, ShieldAlert, Hourglass, Headphones, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  words: Word[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ stats, setStats, words, onNavigate }: DashboardProps) {
  const todayStr = getFormattedToday();
  const isCheckedInToday = stats.checkInDates.includes(todayStr);
  const [currentMotto, setCurrentMotto] = useState(getRandomMotto());

  // Carousel study word inside the main Bento block
  const [learningWordIndex, setLearningWordIndex] = useState(0);

  const activeWord = useMemo(() => {
    if (words.length === 0) return null;
    return words[learningWordIndex % words.length];
  }, [words, learningWordIndex]);

  const handleNextCarouselWord = (isKnown: boolean) => {
    if (isKnown) {
      playTone("success");
      // Optionally mark as mastered in user stats if they say they recognize it
      if (activeWord && !stats.masteredWords.includes(activeWord.id)) {
        setStats(prev => ({
          ...prev,
          masteredWords: [...prev.masteredWords, activeWord.id]
        }));
      }
    } else {
      playTone("click");
    }
    setLearningWordIndex(prev => prev + 1);
  };

  const handleCheckIn = () => {
    if (isCheckedInToday) return;
    
    playTone("level_up");
    const updatedDates = [...stats.checkInDates, todayStr];
    
    // Calculate new streak
    let newStreak = stats.streak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    if (stats.checkInDates.includes(yesterdayStr) || stats.streak === 0) {
      newStreak += 1;
    } else {
      newStreak = 1; // reset streak if gap exists, or keep if today was first
    }
    
    setStats(prev => ({
      ...prev,
      checkInDates: updatedDates,
      streak: newStreak
    }));
  };

  // Compute stats
  const totalWordsCount = words.length;
  const masteredCount = stats.masteredWords.length;
  const masteredPercent = Math.round((masteredCount / totalWordsCount) * 100) || 0;
  const favoriteCount = stats.favoritedWords.length;
  const wrongCount = stats.wrongWords.length;

  // Render month check-in grid for dynamic feedback
  const getDaysInMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const dayArray = [];
    for (let i = 1; i <= numDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      dayArray.push({
        dayNumber: i,
        dateString: dateStr,
        isChecked: stats.checkInDates.includes(dateStr),
        isToday: dateStr === todayStr
      });
    }
    return dayArray;
  };

  const daysGrid = getDaysInMonth();
  const monthNames = [
    "一月 January", "二月 February", "三月 March", "四月 April", 
    "五月 May", "六月 June", "七月 July", "八月 August", 
    "九月 September", "十月 October", "十一月 November", "十二月 December"
  ];
  const currentMonthName = monthNames[new Date().getMonth()];

  const displayedWrongWords = useMemo(() => {
    return stats.wrongWords.slice(0, 3).flatMap(wrongItem => {
      const matchWord = words.find(w => w.id === wrongItem.wordId);
      return matchWord ? [matchWord.word] : [];
    });
  }, [words, stats.wrongWords]);

  return (
    <div className="space-y-6" id="bento-dashboard-wrapper">
      
      {/* Dynamic Motto Banner - Bento Style Header Integration */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl p-6 text-white overflow-hidden shadow-lg shadow-indigo-100"
        id="dashboard-headline-banner"
      >
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
          <GraduationCap size={150} />
        </div>
        <div className="relative z-10 space-y-3 text-left">
          <div className="flex justify-between items-center">
            <span className="bg-white/20 backdrop-blur-md text-[10px] font-bold px-3 py-1.2 rounded-full flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
              初一英语下册同步本 · 极速记忆台
            </span>
            <span className="text-blue-105 font-mono text-xs opacity-90">今日: {todayStr}</span>
          </div>
          
          <h1 className="text-xl md:text-2xl font-black font-sans tracking-tight leading-tight">
            学如逆水行舟，一日千里！💪
          </h1>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-xs md:text-xs border border-white/10 italic flex justify-between items-center gap-4">
            <div className="space-y-0.5">
              <p className="font-bold text-blue-100 font-sans">“ {currentMotto.split(" (")[0]} ”</p>
              <p className="text-slate-100 not-italic opacity-90">
                {currentMotto.includes(" (") ? currentMotto.split(" (")[1].replace(")", "") : ""}
              </p>
            </div>
            <button 
              onClick={() => {
                playTone("click");
                setCurrentMotto(getRandomMotto());
              }}
              className="text-[10px] font-extrabold bg-white/20 hover:bg-white text-white hover:text-indigo-900 px-2.5 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer not-italic"
            >
              换一句鼓励
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="bento-grid-root">
        
        {/* BLOCK 1: Main Learning Card (Col span 8 on desktop, and houses active word learning widget) */}
        {activeWord && (
          <div className="col-span-12 md:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden" id="bento-card-main-study">
            <div className="absolute -top-3 -right-5 text-7xl font-sans italic font-black text-slate-100 hover:text-indigo-120/40 select-none transition-colors duration-200 pointer-events-none">
              U{activeWord.unit}
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="text-left">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-wider">
                  同步精选背诵 · 第 {learningWordIndex + 1} 词
                </span>
                <h2 className="text-xl font-extrabold text-slate-800 mt-2">Unit {activeWord.unit}: 单元同步生词卡</h2>
                <p className="text-xs text-slate-400 font-medium">智能循环打卡库 · {activeWord.page}</p>
              </div>
            </div>

            {/* Word Display area */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 my-4 select-none">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-4">
                  <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {activeWord.word}
                  </h3>
                  <button 
                    onClick={() => {
                      playTone("click");
                      speakWord(activeWord.word);
                    }}
                    className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    title="标准朗朗点读语音"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                <p className="text-sm font-mono text-slate-400 italic">
                  {activeWord.phonetic}
                </p>

                <div className="h-px w-12 bg-slate-200 mx-auto"></div>

                <p className="text-lg font-bold text-slate-700">
                  <span className="text-xs font-serif font-semibold italic text-blue-500 bg-blue-50 px-1.5 py-0.2 rounded mr-1.5">{activeWord.pos}</span>
                  {activeWord.definition}
                </p>

                <div className="max-w-md mx-auto bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/50 relative group transition-all">
                  <div className="flex gap-2.5 items-center justify-between">
                    <p className="text-xs text-slate-550 font-medium leading-relaxed font-sans italic text-left">
                      "{activeWord.example}"
                    </p>
                    <button
                      onClick={() => {
                        playTone("click");
                        speakWord(activeWord.example);
                      }}
                      className="p-1 px-1.5 rounded bg-white hover:bg-slate-105 text-blue-500 hover:text-blue-700 font-semibold cursor-pointer border border-slate-200 shadow-sm shrink-0 flex items-center gap-1 text-[10px]"
                      title="点击点读完整英文例句 🔊"
                    >
                      <Volume2 size={11} />
                      <span>点读</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 text-left">
                    {activeWord.exampleCn}
                  </p>
                </div>
              </div>
            </div>

            {/* Action controls matching Bento specifications */}
            <div className="flex gap-4 mt-1">
              <button 
                onClick={() => handleNextCarouselWord(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer text-xs"
              >
                生疏下个
              </button>
              <button 
                onClick={() => handleNextCarouselWord(true)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all cursor-pointer text-xs"
              >
                认识掌握 (Next)
              </button>
            </div>
          </div>
        )}

        {/* BLOCK 2: Unit Progress Card (col-span-12 md:col-span-4 bg-indigo-600 rounded-3xl p-6 text-white flex flex-col justify-between shadow-lg shadow-indigo-100) */}
        <div className="col-span-12 md:col-span-4 bg-indigo-600 rounded-3xl p-6 text-white flex flex-col justify-between shadow-lg shadow-indigo-100" id="bento-card-progress">
          <div className="flex justify-between items-center text-left">
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">大纲背词进度</p>
            <span className="text-[10px] bg-white/20 font-black px-2.5 py-0.8 rounded-md">{masteredPercent}%</span>
          </div>

          <div className="text-left space-y-3 py-4">
            <div className="flex items-end gap-1">
              <span className="text-5xl font-black tracking-tight">{masteredCount}</span>
              <span className="text-indigo-200 text-xs mb-1 font-bold">/ {totalWordsCount} 掌握</span>
            </div>

            <div className="space-y-1">
              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-white h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${masteredPercent}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-[10px] text-indigo-105 opacity-80">点击下方各单元，可快速检索课本词库进行掌握标注。</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-center border-t border-indigo-500/50">
            <div className="bg-white/10 p-2 rounded-xl">
              <p className="text-[10px] text-indigo-100 font-bold">重点生词</p>
              <p className="text-sm font-extrabold text-white mt-0.5">{favoriteCount}</p>
            </div>
            <div className="bg-white/10 p-2 rounded-xl">
              <p className="text-[10px] text-indigo-100 font-bold">记错词</p>
              <p className="text-sm font-extrabold text-white mt-0.5">{wrongCount}</p>
            </div>
          </div>
        </div>

        {/* BLOCK 3: Ebbinghaus Reminder Card (col-span-12 md:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm) */}
        <div className="col-span-12 md:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm text-left hover:shadow-md transition-shadow" id="bento-card-ebbinghaus">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center text-pink-500">
              <Hourglass size={18} />
            </div>
            <span className="font-black text-slate-700 text-sm">抗遗忘智能复习</span>
          </div>

          <div className="py-4 space-y-1">
            <p className="text-3xl font-black text-slate-800">
              {stats.wrongWords.length + stats.favoritedWords.length || 3} <span className="text-xs text-slate-400 font-bold">词</span>
            </p>
            <p className="text-xs text-slate-400 font-bold leading-relaxed">
              艾宾浩斯记忆模型算法提供科学的时间段错题回溯，有效打破遗忘周期。
            </p>
          </div>

          <button 
            onClick={() => { playTone("click"); onNavigate("ebbinghaus"); }}
            className="w-full py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-black rounded-xl cursor-pointer transition-colors"
          >
            立即温故开始
          </button>
        </div>

        {/* BLOCK 4: Dictation Mode Card (col-span-12 md:col-span-4 bg-emerald-500 rounded-3xl p-6 text-white flex flex-col justify-between hover:bg-emerald-600 transition-colors cursor-pointer) */}
        <div 
          onClick={() => { playTone("click"); onNavigate("dictation"); }}
          className="col-span-12 md:col-span-4 bg-emerald-500 rounded-2xl md:rounded-3xl p-6 text-white flex flex-col justify-between hover:scale-[1.01] active:scale-95 transition-all cursor-pointer shadow-sm text-left" 
          id="bento-card-dictation"
        >
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Headphones size={18} />
          </div>

          <div className="py-4 space-y-1.5">
            <h4 className="font-extrabold text-white text-base">单词听写大师</h4>
            <p className="text-[11px] text-emerald-100 leading-relaxed font-bold">
              播放标准英式发音语音发音，同学们默写拼读单词，考试默写多拿分！
            </p>
          </div>

          <div className="flex items-center text-xs text-white/90 font-bold">
            <span>开始拼写默背听写</span>
            <ChevronRight size={14} className="ml-1" />
          </div>
        </div>

        {/* BLOCK 5: Mistake Book Card */}
        <div 
          onClick={() => { playTone("click"); onNavigate("mistakes"); }}
          className="col-span-12 md:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm border-l-4 border-l-rose-400 hover:shadow-md transition-shadow text-left cursor-pointer"
          id="bento-card-mistakes"
        >
          <div>
            <div className="flex justify-between items-center">
              <h4 className="font-black text-slate-800 text-sm">错词听写本</h4>
              <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full border border-rose-100">重点加强</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-bold leading-relaxed">拼写记错、翻译选错的课本生词已智能搜集记录在册。</p>
          </div>

          {displayedWrongWords.length > 0 ? (
            <div className="flex -space-x-1.5 mt-3 pr-2 overflow-hidden py-1">
              {displayedWrongWords.map((word, i) => (
                <div 
                  key={i} 
                  className="px-2 py-1 max-w-[80px] truncate rounded-full border border-slate-200 bg-slate-50 text-[10px] font-black text-slate-600 font-mono shadow-xs uppercase shrink-0"
                >
                  {word}
                </div>
              ))}
              {wrongCount > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-[10px] font-black text-slate-500 flex items-center justify-center shrink-0">
                  +{wrongCount - 3}
                </div>
              )}
            </div>
          ) : (
            <div className="text-[10px] font-medium text-slate-350 italic mt-3">
              当前错题本一尘不染，太赞啦！🏆
            </div>
          )}

          <div className="flex items-center text-xs text-rose-500 font-bold mt-4 pt-1 border-t border-slate-100/60">
            <span>进入错词复习</span>
            <ChevronRight size={14} className="ml-0.5" />
          </div>
        </div>

        {/* BLOCK 6: Check-In Calendar Box */}
        <div className="col-span-12 md:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between" id="bento-card-checkin">
          
          <div className="flex items-center justify-between text-left">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <Flame className="text-orange-500 fill-orange-100 w-5 h-5" />
              打卡训练营
            </h3>
            <div className="flex items-center gap-1 text-orange-600 font-black text-sm bg-orange-50 px-2.5 py-0.8 rounded-lg border border-orange-100">
              <Zap className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>连续 {stats.streak} 天</span>
            </div>
          </div>

          {/* Calendar element */}
          <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 my-4 text-left">
            <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center justify-between">
              <span>{currentMonthName}</span>
              <span className="text-slate-400">学霸轨迹</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400 mb-1.5">
              <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              <div className="text-center text-xs text-slate-300 p-1 select-none"></div>
              {daysGrid.map((day) => (
                <div 
                  key={day.dateString}
                  className={`relative text-center text-[10px] py-1 rounded-md flex flex-col items-center justify-center font-bold tracking-tight transition-all ${
                    day.isChecked 
                      ? "bg-indigo-600 text-white font-extrabold" 
                      : day.isToday 
                      ? "border border-indigo-400 text-indigo-600 font-extrabold bg-indigo-50" 
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <span>{day.dayNumber}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCheckIn}
            disabled={isCheckedInToday}
            className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isCheckedInToday 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
            }`}
          >
            {isCheckedInToday ? (
              <>
                <CheckCircle2 size={15} className="text-indigo-500" />
                <span>连续打卡中 · 明天继续</span>
              </>
            ) : (
              <>
                <Calendar size={15} />
                <span>点击点燃今日动力</span>
              </>
            )}
          </button>
        </div>

        {/* BLOCK 7: Units Quick Switcher */}
        <div className="col-span-12 md:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col justify-between text-left" id="bento-card-units">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-extrabold text-slate-850 text-sm">课前快速跳转单元</h4>
            <button 
              onClick={() => { playTone("click"); onNavigate("recite"); }} 
              className="text-xs text-blue-600 font-black hover:underline cursor-pointer"
            >
              全部生词库
            </button>
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed font-bold mb-4">
            点击下方单元卡，可自动前往“课本同步词库”进行该章节的详细发音与词意重点收藏突破训练！
          </p>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" id="quick-jump-scroller">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((unitNum) => {
              // Calculate completion or active unit
              const isFirstUnit = unitNum === 1;
              const isEvenUnit = unitNum % 2 === 0;
              return (
                <div 
                  key={unitNum}
                  onClick={() => {
                    playTone("click");
                    onNavigate("recite");
                  }}
                  className={`flex-shrink-0 w-24 h-16 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                    isFirstUnit
                      ? "bg-blue-50 border-blue-400 text-blue-700 shadow-sm"
                      : isEvenUnit
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600"
                  }`}
                >
                  <span className="text-xs font-black uppercase">Unit {unitNum}</span>
                  <span className="text-[9px] opacity-80 mt-0.5">
                    {isFirstUnit ? "背诵中" : isEvenUnit ? "已完成" : "未开启"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
