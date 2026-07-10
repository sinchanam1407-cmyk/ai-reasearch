"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Columns, 
  Settings, 
  Sparkles, 
  Check, 
  KeyRound, 
  HelpCircle
} from "lucide-react";
import { getApiKey, saveApiKey } from "../lib/db";

export default function Sidebar() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setApiKey(getApiKey());
  }, []);

  const handleSaveKey = () => {
    saveApiKey(apiKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsSettingsOpen(false);
    }, 1000);
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      name: "Research Workspace",
      icon: BookOpen,
      path: "/workspace",
    },
    {
      name: "Multi-Paper Compare",
      icon: Columns,
      path: "/compare",
    },
  ];

  return (
    <>
      {/* Floating Sidebar Container */}
      <aside className="fixed top-4 left-4 bottom-4 w-64 glass rounded-2xl flex flex-col justify-between p-4 z-40 shadow-xl border border-white/5">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-4 border-b border-white/5 mb-6">
            <div className="bg-indigo-600/20 p-2 rounded-xl border border-indigo-500/20">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                Research Copilot
              </h1>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
                AI Workspace v1.0
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white shadow-md border border-white/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Panel */}
        <div className="space-y-2">
          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-200 text-left cursor-pointer"
          >
            <Settings className="w-5 h-5 text-slate-400" />
            Gemini Settings
          </button>

          {/* Quick Help */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
            <HelpCircle className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
            <h4 className="text-xs font-semibold text-slate-200">How to use?</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Upload a paper in the Dashboard, open the workspace to read, chat, and generate slides.
            </p>
          </div>
        </div>
      </aside>

      {/* Settings Modal Dialog */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-indigo-400" />
              Configure Gemini API
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your Gemini API key to enable live AI analysis. Key is stored locally in your browser.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-200 border border-white/10 focus:border-indigo-500/50"
                />
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 text-xs text-indigo-300/90 leading-relaxed flex gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Don't have a key? Get one free from the Google AI Studio console to unlock full capabilities. Without a key, the app runs in fallback simulation mode.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveKey}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg cursor-pointer"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      Saved!
                    </>
                  ) : (
                    "Save Configurations"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
