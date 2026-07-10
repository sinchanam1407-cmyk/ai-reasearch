"use client";

import React, { useState, useEffect } from "react";
import PaperLibrary from "../components/PaperLibrary";
import { 
  Library, 
  Heart, 
  Hourglass, 
  TrendingUp, 
  Sparkles,
  BookMarked,
  Layers,
  History
} from "lucide-react";
import { getLibrary, Paper, getReviews, Review } from "../lib/db";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    favorites: 0,
    avgProgress: 0,
    hoursSaved: 0
  });
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const library = getLibrary();
    const reviewsList = getReviews();
    setReviews(reviewsList.slice(0, 3)); // show top 3 reviews

    if (library.length > 0) {
      const total = library.length;
      const favorites = library.filter(p => p.isFavorite).length;
      const progressSum = library.reduce((acc, p) => acc + p.readingProgress, 0);
      const avgProgress = Math.round(progressSum / total);
      
      // Assume 1% reading progress with copilot saves 0.15 hours compared to standard reading
      const hoursSaved = Math.round(library.reduce((acc, p) => acc + (p.readingProgress * 0.15), 0) * 10) / 10;

      setStats({ total, favorites, avgProgress, hoursSaved });
    } else {
      setStats({ total: 0, favorites: 0, avgProgress: 0, hoursSaved: 0 });
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Research Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyse research papers, compare methodologies, explain equations, and generate presentations instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-[10px] font-bold text-indigo-300">Gemini-1.5-Flash Active</span>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Publications */}
        <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-white/5 shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Publications</span>
            <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/10">
              <Library className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{stats.total}</h2>
            <p className="text-[10px] text-slate-500 mt-1">Uploaded to local database</p>
          </div>
        </div>

        {/* Stat 2: Favorites */}
        <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-white/5 shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Favorites</span>
            <div className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/10">
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{stats.favorites}</h2>
            <p className="text-[10px] text-slate-500 mt-1">Starred publications</p>
          </div>
        </div>

        {/* Stat 3: Avg Reading Progress */}
        <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-white/5 shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reading Progress</span>
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/10">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{stats.avgProgress}%</h2>
            <p className="text-[10px] text-slate-500 mt-1">Average reading completion</p>
          </div>
        </div>

        {/* Stat 4: Hours Saved */}
        <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-white/5 shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reading Hours Saved</span>
            <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/10">
              <Hourglass className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{stats.hoursSaved}h</h2>
            <p className="text-[10px] text-slate-500 mt-1">Estimated time saved by AI</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <PaperLibrary />

      {/* Literature Reviews & Recent Activity Section */}
      {reviews.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <BookMarked className="w-4 h-4 text-indigo-400" />
            Recent Literature Reviews
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((rev) => (
              <div 
                key={rev.id}
                className="bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-200"
              >
                <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{rev.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] text-slate-400">
                    {rev.papersUsed.length} Publications Analyzed
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-slate-500 text-[10px]">
                  <History className="w-3 h-3" />
                  <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
