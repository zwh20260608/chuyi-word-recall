import React, { useState, useMemo } from "react";
import { Word, UserStats } from "../types";
import { speakWord, playTone } from "../utils";
import { Search, Volume2, Star, CheckCircle, HelpCircle, BookOpen, ChevronRight, Bookmark, CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VocabBrowserProps {
  words: Word[];
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

export default function VocabBrowser({ words, stats, setStats }: VocabBrowserProps) {
  const [selectedUnit, setSelectedUnit] = useState<number>(1); // Unit 1 to 8, or 0 for All
  const [searchQuery, setSearchQuery] = useState("");
  const [activeWordId, setActiveWordId] = useState<string | null>(null);

  // Filter words
  const filteredWords = useMemo(() => {
    return words.filter(item => {
      const matchUnit = selectedUnit === 0 ? true : item.unit === selectedUnit;
      const matchSearch = searchQuery.trim() === "" 
        ? true 
        : item.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.definition.includes(searchQuery);
      return matchUnit && matchSearch;
    });
  }, [words, selectedUnit, searchQuery]);

  const toggleFavorite = (wordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playTone("click");
    setStats(prev => {
      const favorited = prev.favoritedWords.includes(wordId);
      const newFavs = favorited 
        ? prev.favoritedWords.filter(id => id !== wordId) 
        : [...prev.favoritedWords, wordId];
      return { ...prev, favoritedWords: newFavs };
    });
  };

  const toggleMastered = (wordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStats(prev => {
      const mastered = prev.masteredWords.includes(wordId);
      if (!mastered) {
        playTone("success");
      } else {
        playTone("click");
      }
      const newMasters = mastered 
        ? prev.masteredWords.filter(id => id !== wordId) 
        : [...prev.masteredWords, wordId];
      return { ...prev, masteredWords: newMasters };
    });
  };

  return (
    <div className="space-y-6" id="vocab-browser-root">
      
      {/* Unit Filter Row & Search bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="text-indigo-500 w-5 h-5" />
              课本同步生词库 (初一下册)
            </h2>
            <p className="text-xs text-slate-400">完整涵盖 Unit 1 至 Unit 8 课本附录单词表</p>
          </div>
          
          {/* Search Box */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索英文单词、中文含义..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Unit Selectors */}
        <div className="flex flex-wrap gap-1.5 pt-1.5 overflow-x-auto pb-1" id="unit-buttons-row">
          <button
            onClick={() => { playTone("click"); setSelectedUnit(0); }}
            className={`px-3.5 py-1.8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedUnit === 0 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            全部大纲词
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(u => (
            <button
              key={u}
              onClick={() => { playTone("click"); setSelectedUnit(u); }}
              className={`px-3.5 py-1.8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedUnit === u 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              Unit {u}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics info inline */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-medium">
        <span>当前选择条件下共有 <strong className="text-indigo-600 font-bold">{filteredWords.length}</strong> 个单词</span>
        <span>提示：点击单词卡片展示 精美例句与拼写解析 💡</span>
      </div>

      {/* Words Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="vocab-cards-grid">
        <AnimatePresence mode="popLayout">
          {filteredWords.map((item, index) => {
            const isFav = stats.favoritedWords.includes(item.id);
            const isMastered = stats.masteredWords.includes(item.id);
            const isOpen = activeWordId === item.id;
            
            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => { playTone("click"); setActiveWordId(isOpen ? null : item.id); }}
                className={`relative bg-white p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                  isOpen 
                    ? "border-indigo-400 ring-2 ring-indigo-50 shadow-md md:col-span-2" 
                    : "border-slate-100 hover:border-slate-300 shadow-sm hover:shadow"
                }`}
                id={`vocab-card-${item.id}`}
              >
                {/* Header: Word, part of speech, bookmark and status toggle */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-slate-900 font-sans tracking-tight">
                        {item.word}
                      </h3>
                      <span className="text-xs font-serif font-semibold italic text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                        {item.pos}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {item.page}
                      </span>
                    </div>
                    
                    {/* Phonetic & Sound player trigger button */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm font-mono">{item.phonetic}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTone("click");
                          speakWord(item.word);
                        }}
                        className="p-1 rounded-md bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="英式点读发音"
                      >
                        <Volume2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Right side controls: Check and Bookmark Stars */}
                  <div className="flex items-center gap-1">
                    {/* Add to Custom recite book star button */}
                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isFav 
                          ? "bg-amber-50 text-amber-500 hover:bg-amber-100" 
                          : "bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                      }`}
                      title={isFav ? "移出重点词" : "标记为重点/难记词"}
                    >
                      <Star size={17} className={isFav ? "fill-amber-400" : ""} />
                    </button>

                    {/* Mastered button */}
                    <button
                      onClick={(e) => toggleMastered(item.id, e)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isMastered 
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                          : "bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                      }`}
                      title={isMastered ? "设为未掌握" : "记作已掌握单词"}
                    >
                      <CheckCircle size={17} className={isMastered ? "fill-emerald-600 text-emerald-50" : ""} />
                    </button>
                  </div>
                </div>

                {/* Definition view */}
                <div className="mt-3">
                  <p className="text-sm font-bold text-slate-700">
                    {item.definition}
                  </p>
                </div>

                {/* Interactive expandable example section */}
                {isOpen ? (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-dashed border-slate-100 space-y-3 text-sm overflow-hidden"
                  >
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-xs text-indigo-500 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                          <CircleDot className="w-3 h-3 fill-indigo-100" />
                          情境高频同步例句
                        </p>
                        <button
                          onClick={() => {
                            playTone("click");
                            speakWord(item.example);
                          }}
                          className="p-1 px-1.5 rounded-md bg-white text-indigo-600 hover:text-indigo-800 border border-slate-200 shadow-sm shrink-0 flex items-center gap-0.5 text-[9px] font-black cursor-pointer transition-all"
                          title="点击点读完整英文例句 🔊"
                        >
                          <Volume2 size={9} />
                          <span>朗读例句</span>
                        </button>
                      </div>
                      <p className="font-semibold text-slate-800 font-sans leading-relaxed text-xs">
                        {item.example}
                      </p>
                      <p className="text-slate-500 text-xs text-left">
                        {item.exampleCn}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>单词出自: 英语教材 (PEP版) 七下 Unit {item.unit}</span>
                      <span className="font-semibold text-indigo-500">
                        {isMastered ? "🎉 熟词（已掌握）" : "⏳ 基础复习中"}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <HelpCircle size={11} />
                      点击展开学例句
                    </span>
                    <span>Unit {item.unit} / {item.page}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredWords.length === 0 && (
          <div className="col-span-full py-12 px-4 text-center space-y-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <p className="text-4xl">🔍</p>
            <p className="text-slate-700 font-bold text-sm">未查找到匹配的同步单词</p>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              建议您更换搜索词，或者点击上方 Unit1-8 选择不同的课文单元进行单词查阅！
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
