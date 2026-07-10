"use client";

import React, { useState, useEffect } from "react";
import { Paper } from "../lib/mockData";
import { generateLiteratureReview } from "../lib/gemini";
import { saveReview, Review } from "../lib/db";
import { 
  FileEdit, 
  Sparkles, 
  Download, 
  Eye, 
  Edit, 
  Save, 
  FileText, 
  CheckCircle,
  Copy,
  Printer
} from "lucide-react";

interface ReviewGeneratorProps {
  paper: Paper;
}

export default function ReviewGenerator({ paper }: ReviewGeneratorProps) {
  const [reviewTitle, setReviewTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setReviewTitle(`Literature Review on ${paper.category || "Advanced Architectures"}`);
    setMarkdown("");
  }, [paper]);

  // Generate Review
  const handleGenerateReview = async () => {
    setIsLoading(true);
    setMarkdown("");
    try {
      const text = await generateLiteratureReview([
        { title: paper.title, abstract: paper.abstract }
      ]);
      setMarkdown(text);
    } catch (e) {
      console.error(e);
      setMarkdown("Error generating literature review outline.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save to DB (Dashboard logs)
  const handleSaveReview = () => {
    if (!markdown) return;
    
    const newReview: Review = {
      id: `review-${Date.now()}`,
      title: reviewTitle,
      papersUsed: [paper.id],
      markdown,
      createdAt: new Date().toISOString()
    };

    saveReview(newReview);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Download Markdown file (.md)
  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reviewTitle.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print review (Print to PDF via browser)
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${reviewTitle}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            h2 { color: #2563eb; margin-top: 30px; }
            h3 { color: #475569; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background-color: #f8fafc; }
            pre { background-color: #f1f5f9; padding: 15px; border-radius: 5px; overflow-x: auto; }
            code { font-family: monospace; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>${reviewTitle}</h1>
          <div style="white-space: pre-line;">
            ${markdown}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-[#09090b]/10 select-none">
      {/* Sub Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 shrink-0">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FileEdit className="w-4 h-4 text-indigo-400" />
          Literature Review Workspace
        </h3>
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          Markdown drafting room
        </span>
      </div>

      {markdown === "" ? (
        // Initial review screen
        <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-2xl text-center">
          {isLoading ? (
            <div className="space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 mx-auto" />
              <p className="text-xs text-indigo-300 font-bold animate-pulse">
                Synthesizing literature overview, gaps, and tables...
              </p>
            </div>
          ) : (
            <>
              <FileEdit className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
              <h3 className="text-xs font-bold text-white mb-1">Generate Literature Review Outline</h3>
              <p className="text-[10px] text-slate-400 max-w-xs mb-4">
                Compile introduction, related work table, research gaps, and formatted references automatically.
              </p>
              <button
                onClick={handleGenerateReview}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Synthesize Review Outline
              </button>
            </>
          )}
        </div>
      ) : (
        // Writing Suite editor
        <div className="flex-1 flex flex-col justify-between gap-4 min-h-0 select-text">
          {/* Editor Header Bar controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl shrink-0">
            {/* View selectors */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Workspace:</span>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 gap-1">
                {(["edit", "preview", "split"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition cursor-pointer ${
                      viewMode === mode
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    {mode === "edit" ? "Raw Editor" : mode === "preview" ? "Live Preview" : "Split View"}
                  </button>
                ))}
              </div>
            </div>

            {/* Document exporters buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveReview}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-300 hover:text-white text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaved ? "Saved!" : "Save Review"}
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition border border-white/5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownloadMd}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition border border-white/5 cursor-pointer"
                title="Download MD"
              >
                <Download className="w-3.5 h-3.5" />
                MD
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition border border-white/5 cursor-pointer"
                title="Print / Save PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                PDF
              </button>
            </div>
          </div>

          {/* Title Editor */}
          <div className="shrink-0 space-y-1.5">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Review Document Title</label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Editor/Viewer Workspace panels */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            {/* Raw Markdown Editor Textarea */}
            {(viewMode === "edit" || viewMode === "split") && (
              <div className="flex flex-col border border-white/5 bg-zinc-950/30 rounded-2xl overflow-hidden min-h-[220px]">
                <div className="bg-white/2 border-b border-white/5 px-4 py-2 flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  <Edit className="w-3.5 h-3.5 text-indigo-400" />
                  Text Editor
                </div>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="flex-1 w-full p-4 bg-transparent text-slate-300 font-mono text-[10px] leading-relaxed resize-none focus:outline-none focus:ring-0 overflow-y-auto"
                />
              </div>
            )}

            {/* Live Markdown Preview Render */}
            {(viewMode === "preview" || viewMode === "split") && (
              <div className="flex flex-col border border-white/5 bg-zinc-950/20 rounded-2xl overflow-hidden min-h-[220px]">
                <div className="bg-white/2 border-b border-white/5 px-4 py-2 flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  Live Document Render
                </div>
                <div className="flex-1 p-5 overflow-y-auto text-xs leading-relaxed text-slate-300 font-sans whitespace-pre-line prose prose-invert max-w-none">
                  {markdown}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
