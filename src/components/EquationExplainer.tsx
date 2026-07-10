"use client";

import React, { useState, useEffect } from "react";
import { Paper } from "../lib/mockData";
import { explainEquation } from "../lib/gemini";
import { 
  Binary, 
  Sparkles, 
  HelpCircle, 
  Info, 
  ArrowRight,
  ListCollapse,
  Sigma,
  Highlighter
} from "lucide-react";

interface EquationExplainerProps {
  paper: Paper;
  selectedText: string;
}

interface Variable {
  name: string;
  meaning: string;
}

export default function EquationExplainer({ paper, selectedText }: EquationExplainerProps) {
  const [activeEqIdx, setActiveEqIdx] = useState<number | null>(0);
  const [customLatex, setCustomLatex] = useState("");
  const [explanation, setExplanation] = useState("");
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load paper default equation
  useEffect(() => {
    if (paper.equations.length > 0) {
      setActiveEqIdx(0);
      setExplanation(paper.equations[0].description + "\n\n**Derivation Details:**\n" + paper.equations[0].derivation);
      setVariables(paper.equations[0].variables);
    } else {
      setActiveEqIdx(null);
      setExplanation("");
      setVariables([]);
    }
    setCustomLatex("");
  }, [paper]);

  // Load selected equation
  const handleSelectEquation = (idx: number) => {
    setActiveEqIdx(idx);
    setCustomLatex("");
    const eq = paper.equations[idx];
    setExplanation(eq.description + "\n\n**Derivation Details:**\n" + eq.derivation);
    setVariables(eq.variables);
  };

  // Analyze custom highlighted latex
  const handleAnalyzeCustom = async () => {
    if (!selectedText.trim()) return;
    setIsLoading(true);
    setActiveEqIdx(null);
    setCustomLatex(selectedText);
    setExplanation("");
    setVariables([]);

    try {
      const res = await explainEquation(
        selectedText,
        `Analyzing custom formula highlighted from the paper "${paper.title}".`
      );
      setExplanation(res.explanation);
      setVariables(res.variables);
    } catch (e) {
      console.error(e);
      setExplanation("Could not parse equation variables. Ensure it matches a valid LaTeX or mathematical syntax.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-[#09090b]/10 select-none">
      {/* Sub Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 shrink-0">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Binary className="w-4 h-4 text-indigo-400" />
          Mathematical Equation Explainer
        </h3>
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Sigma className="w-3.5 h-3.5" />
          TeX OCR & Math intuition
        </span>
      </div>

      {/* Grid Layout: Equations list on Left, Explanations on Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-0">
        {/* Equations Outline List */}
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-1">
          {/* Custom Highlight action */}
          {selectedText && (
            <button
              onClick={handleAnalyzeCustom}
              disabled={isLoading}
              className="w-full text-left p-3 bg-indigo-650/10 hover:bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl transition cursor-pointer flex justify-between items-start"
            >
              <div className="space-y-1.5 pr-2 w-[85%]">
                <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Highlighter className="w-3 h-3" />
                  Analyze Highlighted Formula
                </span>
                <div className="text-[10px] font-mono text-indigo-300 italic truncate block">
                  {selectedText}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0 self-center" />
            </button>
          )}

          {/* Paper detected equations list */}
          <div className="space-y-2">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Detected Equations ({paper.equations.length})
            </div>
            
            {paper.equations.length === 0 ? (
              <div className="text-[10px] text-slate-500 italic p-2.5">
                No pre-detected equations in this paper outline. Highlight any equation on the left to analyze it.
              </div>
            ) : (
              paper.equations.map((eq, idx) => {
                const isActive = activeEqIdx === idx && !customLatex;
                return (
                  <button
                    key={eq.id}
                    onClick={() => handleSelectEquation(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-indigo-600/10 border-indigo-500/50 shadow-md"
                        : "bg-white/5 border-white/5 hover:bg-white/8"
                    }`}
                  >
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Formula {idx + 1}
                    </span>
                    <div className="text-xs font-mono text-white overflow-x-auto whitespace-nowrap scrollbar-none py-1 border-l-2 border-indigo-500/30 pl-2.5">
                      $${eq.latex}$$
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Math Intuition and variable breakdown panel */}
        <div className="lg:col-span-3 glass border border-white/5 rounded-2xl p-4 flex flex-col justify-between overflow-y-auto select-text">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500" />
              <span className="text-[10px] text-indigo-300 font-bold animate-pulse">
                Parsing mathematical components and variables...
              </span>
            </div>
          ) : explanation ? (
            <div className="space-y-4">
              {/* Formula Block Header display */}
              <div className="bg-zinc-950/60 border border-white/5 rounded-xl p-4 text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-1 left-2 text-[7px] font-bold text-slate-600 tracking-widest uppercase">
                  LaTeX Math Render
                </div>
                <div className="text-sm font-mono text-indigo-300 font-bold overflow-x-auto py-2 scrollbar-none">
                  {customLatex ? `$${customLatex}$` : `$$${paper.equations[activeEqIdx || 0].latex}$$`}
                </div>
              </div>

              {/* Explanations paragraphs */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <h4 className="text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  Mathematical Intuition
                </h4>
                <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                  {explanation}
                </p>
              </div>

              {/* Variables breakdown Table */}
              {variables.length > 0 && (
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <h4 className="text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider">
                    <ListCollapse className="w-3.5 h-3.5 text-indigo-400" />
                    Variables Key mapping
                  </h4>
                  <div className="border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[9px] border-collapse">
                      <thead>
                        <tr className="bg-white/2 border-b border-white/5 font-bold text-slate-400">
                          <th className="py-2 px-3.5 w-16">Variable</th>
                          <th className="py-2 px-3.5">Meaning & Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {variables.map((v, i) => (
                          <tr key={i} className="hover:bg-white/1">
                            <td className="py-2 px-3.5 font-mono text-indigo-300 font-bold">{v.name}</td>
                            <td className="py-2 px-3.5 leading-relaxed">{v.meaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-[10px] py-12">
              <HelpCircle className="w-8 h-8 text-slate-600 mb-2" />
              Select an equation outline or drag-select code on the reader to extract derivations.
            </div>
          )}

          {/* Quick Notice */}
          <p className="text-[8px] text-slate-500 mt-4 leading-normal bg-black/10 p-2.5 rounded-xl border border-white/5 shrink-0">
            Equations explanations are cross-matched with Gemini semantic understanding of the paper context paragraphs.
          </p>
        </div>
      </div>
    </div>
  );
}
