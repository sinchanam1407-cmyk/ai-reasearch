"use client";

import React, { useState } from "react";
import { Paper } from "../lib/mockData";
import { generateSummary } from "../lib/gemini";
import { saveNote } from "../lib/db";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Plus, 
  Bookmark, 
  FileCheck,
  RotateCcw,
  BookOpen
} from "lucide-react";

interface SummaryGeneratorProps {
  paper: Paper;
}

type SummaryType = "short" | "detailed" | "abstract" | "contributions" | "methodology" | "results" | "conclusion";

export default function SummaryGenerator({ paper }: SummaryGeneratorProps) {
  const [summaryType, setSummaryType] = useState<SummaryType>("short");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSavedAsNote, setIsSavedAsNote] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary("");
    try {
      const res = await generateSummary(
        paper.title,
        paper.content.map(c => `${c.sectionTitle}\n${c.text}`).join("\n\n"),
        summaryType
      );
      setSummary(res);
    } catch (e) {
      console.error(e);
      setSummary("Error generating summary. Please check your Gemini API configurations.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    if (!summary) return;
    
    const newNote = {
      id: `note-summary-${Date.now()}`,
      paperId: paper.id,
      text: `[AI Summary - ${summaryType.toUpperCase()}]: ${summary.slice(0, 500)}${summary.length > 500 ? "..." : ""}`,
      createdAt: new Date().toISOString()
    };

    saveNote(paper.id, newNote);
    setIsSavedAsNote(true);
    setTimeout(() => setIsSavedAsNote(false), 2000);
  };

  const summaryOptions = [
    { id: "short", name: "100-word Short Summary", desc: "Key objectives & results in 100 words" },
    { id: "detailed", name: "300-word Detailed Summary", desc: "In-depth review with structure" },
    { id: "abstract", name: "Abstract Overview", desc: "High-level paradigm highlights" },
    { id: "contributions", name: "Key Contributions", desc: "Core contributions outline" },
    { id: "methodology", name: "Methodology Focus", desc: "Techniques and architectures" },
    { id: "results", name: "Results & Outputs", desc: "Validation metrics and scores" },
    { id: "conclusion", name: "Conclusion & Future", desc: "Takeaways and future directions" }
  ] as const;

  return (
    <div className="h-full flex flex-col min-h-0 bg-[#09090b]/10 select-none">
      {/* Sub Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 shrink-0">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-indigo-400" />
          AI Summary Suite
        </h3>
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          Choose summary depth
        </span>
      </div>

      {summary === "" ? (
        // Settings State
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-white/5 rounded-2xl">
          {isLoading ? (
            <div className="space-y-3 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 mx-auto" />
              <p className="text-xs text-indigo-300 font-bold animate-pulse">
                Summarizing research details...
              </p>
            </div>
          ) : (
            <div className="w-full max-w-sm space-y-4">
              <div className="text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2 animate-pulse" />
                <h3 className="text-xs font-bold text-white mb-1">Generate AI Summaries</h3>
                <p className="text-[10px] text-slate-400">
                  Select a template to condense the paper content.
                </p>
              </div>

              {/* Summary Format List */}
              <div className="space-y-1.5 bg-white/5 border border-white/5 p-3 rounded-xl max-h-48 overflow-y-auto pr-1">
                {summaryOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSummaryType(opt.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-semibold transition cursor-pointer flex justify-between items-center ${
                      summaryType === opt.id
                        ? "bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <span>{opt.name}</span>
                    <span className="text-[8px] text-slate-500 font-normal">{opt.desc}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateSummary}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Compile Summary
              </button>
            </div>
          )}
        </div>
      ) : (
        // Results State
        <div className="flex-1 flex flex-col justify-between gap-4 min-h-0 select-text">
          {/* Controls */}
          <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-2xl shrink-0">
            <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              Summary Format: {summaryType.toUpperCase()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSaveToNotes}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-300 hover:text-white text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                {isSavedAsNote ? "Saved!" : "Save to Notes"}
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition border border-white/5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => setSummary("")}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition border border-white/5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Text block */}
          <div className="flex-1 border border-white/5 bg-zinc-950/20 rounded-2xl p-4 overflow-y-auto text-xs leading-relaxed text-slate-300 whitespace-pre-line prose prose-invert">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}
