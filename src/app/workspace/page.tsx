"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  getLibrary, 
  Paper, 
  updatePaper 
} from "../../lib/db";
import DocumentViewer from "../../components/DocumentViewer";
import ChatInterface from "../../components/ChatInterface";
import EquationExplainer from "../../components/EquationExplainer";
import QuizGenerator from "../../components/QuizGenerator";
import SlideGenerator from "../../components/SlideGenerator";
import ReviewGenerator from "../../components/ReviewGenerator";
import CitationGraph from "../../components/CitationGraph";
import { 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  MessageSquare, 
  Brain, 
  HelpCircle, 
  Sliders, 
  GitFork, 
  FileEdit,
  Binary
} from "lucide-react";

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paperId = searchParams.get("id");
  
  const [library, setLibrary] = useState<Paper[]>([]);
  const [activePaper, setActivePaper] = useState<Paper | null>(null);
  const [leftWidth, setLeftWidth] = useState(45); // percentage for left panel
  const [activeTab, setActiveTab] = useState<"chat" | "equations" | "quiz" | "slides" | "review" | "network">("chat");
  const [selectedText, setSelectedText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  // Load library and select active paper
  useEffect(() => {
    const lib = getLibrary();
    setLibrary(lib);
    
    if (lib.length > 0) {
      const selected = lib.find(p => p.id === paperId) || lib[0];
      setActivePaper(selected);
      
      // Update reading progress of the paper slightly when opened
      if (selected.readingProgress < 15) {
        const updated = { ...selected, readingProgress: 15 };
        updatePaper(updated);
      }
    }
  }, [paperId]);

  // Handle active paper switch
  const handlePaperChange = (id: string) => {
    router.push(`/workspace?id=${id}`);
  };

  // Draggable Split Panel divider
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Bounds limit (30% to 70%)
    if (newWidth > 30 && newWidth < 70) {
      setLeftWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  if (!activePaper) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <BookOpen className="w-16 h-16 text-slate-500 mb-4 animate-bounce" />
        <h2 className="text-lg font-bold text-white">No Publications Found</h2>
        <p className="text-xs text-slate-400 mt-2">
          Upload your first research paper in the Dashboard.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: "chat", name: "AI Chat", icon: MessageSquare },
    { id: "equations", name: "Equation Explainer", icon: Binary },
    { id: "quiz", name: "Quiz Generator", icon: HelpCircle },
    { id: "slides", name: "Slide Builder", icon: Sliders },
    { id: "review", name: "Literature Review", icon: FileEdit },
    { id: "network", name: "Citation Graph", icon: GitFork }
  ] as const;

  return (
    <div className="h-[90vh] flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Workspace Header Subbar */}
      <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 glass">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 p-2 rounded-xl border border-indigo-500/10">
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
              Active Workspace
            </div>
            <select
              value={activePaper.id}
              onChange={(e) => handlePaperChange(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-white focus:outline-none pr-6 cursor-pointer max-w-sm text-ellipsis overflow-hidden"
            >
              {library.map(p => (
                <option key={p.id} value={p.id} className="bg-zinc-950 text-slate-200">
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <div>
            Progress: <span className="text-white font-bold">{activePaper.readingProgress}%</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="bg-indigo-600/20 text-indigo-300 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-500/10 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Workspace Copilot
          </div>
        </div>
      </div>

      {/* Split Panels Container */}
      <div 
        ref={containerRef}
        className="flex-1 flex gap-1 relative min-h-0 select-none"
      >
        {/* Left Panel: Document Viewer */}
        <div 
          style={{ width: `${leftWidth}%` }}
          className="h-full min-h-0"
        >
          <DocumentViewer 
            paper={activePaper} 
            onTextSelection={setSelectedText} 
          />
        </div>

        {/* Resizer Handle */}
        <div 
          onMouseDown={handleMouseDown}
          className="w-1.5 h-full hover:bg-indigo-500/50 cursor-col-resize transition-all duration-150 flex items-center justify-center shrink-0 z-10"
        >
          <div className="w-0.5 h-10 bg-white/10 rounded-full group-hover:bg-indigo-500" />
        </div>

        {/* Right Panel: AI Workspace Tabs */}
        <div 
          style={{ width: `${100 - leftWidth}%` }}
          className="h-full min-h-0 glass border border-white/5 rounded-2xl flex flex-col"
        >
          {/* Tab Selection Header */}
          <div className="flex border-b border-white/5 bg-white/2 p-2 overflow-x-auto gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition ${
                    isActive
                      ? "bg-white/10 text-white border border-white/5 shadow-sm"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4 text-indigo-400" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5">
            {activeTab === "chat" && (
              <ChatInterface 
                paper={activePaper} 
                selectedText={selectedText} 
                clearSelection={() => setSelectedText("")}
              />
            )}
            {activeTab === "equations" && (
              <EquationExplainer 
                paper={activePaper} 
                selectedText={selectedText} 
              />
            )}
            {activeTab === "quiz" && (
              <QuizGenerator 
                paper={activePaper} 
              />
            )}
            {activeTab === "slides" && (
              <SlideGenerator 
                paper={activePaper} 
              />
            )}
            {activeTab === "review" && (
              <ReviewGenerator 
                paper={activePaper} 
              />
            )}
            {activeTab === "network" && (
              <CitationGraph 
                paper={activePaper} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Workspace() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
  );
}
