"use client";

import React, { useState } from "react";
import { Paper } from "../lib/mockData";
import { chatWithPaper } from "../lib/gemini";
import { saveNote } from "../lib/db";
import { 
  Sparkles, 
  BookOpen, 
  Terminal, 
  HelpCircle, 
  Wrench,
  Copy,
  Bookmark,
  RotateCcw,
  Bot
} from "lucide-react";

interface ResearchAssistantProps {
  paper: Paper;
}

interface ActionOption {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<any>;
  prompt: string;
}

export default function ResearchAssistant({ paper }: ResearchAssistantProps) {
  const [activeResult, setActiveResult] = useState("");
  const [activeTitle, setActiveTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const assistantActions: ActionOption[] = [
    {
      id: "eli5",
      name: "Explain Like I'm Five (ELI5)",
      desc: "Simplify the paper using basic analogies and no jargon.",
      icon: BookOpen,
      prompt: "Explain the main idea, target problems, and proposed solution of this paper like I'm five years old. Use simple analogies and zero mathematical jargon."
    },
    {
      id: "impl_plan",
      name: "Generate Implementation Plan",
      desc: "Create a step-by-step roadmap to reproduce or build this.",
      icon: Wrench,
      prompt: "Generate a detailed, step-by-step software implementation plan to reproduce the findings or deploy the architecture of this paper. List tech stack suggestions, data structures, and pipeline outlines."
    },
    {
      id: "project",
      name: "Convert Paper into Project Idea",
      desc: "Create a novel project proposal building on this work.",
      icon: Terminal,
      prompt: "Convert this research paper into a unique coding project idea. Give it a creative project name, write a target scope summary, list core modules to implement, and suggest how it extends this paper."
    },
    {
      id: "viva",
      name: "Generate Viva / Exam Q&A",
      desc: "Mock quiz questions and defense answers for reviews.",
      icon: HelpCircle,
      prompt: "Analyze the gaps and details of this paper to generate 5 typical viva-voce or thesis defense exam questions, along with bullet-pointed defense answers that a researcher should prepare."
    }
  ];

  const handleTriggerAction = async (action: ActionOption) => {
    setIsLoading(true);
    setActiveResult("");
    setActiveTitle(action.name);

    try {
      const response = await chatWithPaper(
        paper.title,
        paper.abstract,
        paper.content.map(c => `${c.sectionTitle}\n${c.text}`).join("\n\n"),
        [], // empty history
        action.prompt
      );
      setActiveResult(response);
    } catch (e) {
      console.error(e);
      setActiveResult("Error calling the AI Assistant. Verify your network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(activeResult);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    if (!activeResult) return;
    
    const newNote = {
      id: `note-assistant-${Date.now()}`,
      paperId: paper.id,
      text: `[AI Assistant - ${activeTitle}]: ${activeResult.slice(0, 500)}${activeResult.length > 500 ? "..." : ""}`,
      createdAt: new Date().toISOString()
    };

    saveNote(paper.id, newNote);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-[#09090b]/10 select-none">
      {/* Sub Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 shrink-0">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-indigo-400" />
          AI Research Assistant Workspace
        </h3>
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          Quick study actions
        </span>
      </div>

      {activeResult === "" ? (
        // Grid Options
        <div className="flex-1 flex flex-col justify-center min-h-0">
          {isLoading ? (
            <div className="space-y-3 text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 mx-auto" />
              <p className="text-xs text-indigo-300 font-bold animate-pulse">
                Running analysis for "{activeTitle}"...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center max-w-sm mx-auto mb-2">
                <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-2 animate-bounce" />
                <h3 className="text-xs font-bold text-white">AI Assistant Quick Actions</h3>
                <p className="text-[10px] text-slate-400">
                  Select a workflow to quickly transform or simplify scientific concepts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assistantActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleTriggerAction(action)}
                      className="text-left p-3.5 bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 rounded-2xl transition duration-150 cursor-pointer flex gap-3.5 items-start"
                    >
                      <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/15 text-indigo-400 shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-200">{action.name}</h4>
                        <p className="text-[9px] text-slate-400 leading-normal">{action.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Output result panel
        <div className="flex-1 flex flex-col justify-between gap-4 min-h-0 select-text">
          {/* Controls bar */}
          <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-2xl shrink-0">
            <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Assistant: {activeTitle}
            </span>
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveToNotes}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-300 hover:text-white text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                {isSaved ? "Saved!" : "Save to Notes"}
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition border border-white/5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => setActiveResult("")}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 text-[9px] font-bold rounded-xl flex items-center gap-1.5 transition border border-white/5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Result Text */}
          <div className="flex-1 border border-white/5 bg-zinc-950/20 rounded-2xl p-4 overflow-y-auto text-xs leading-relaxed text-slate-300 whitespace-pre-line prose prose-invert">
            {activeResult}
          </div>
        </div>
      )}
    </div>
  );
}
