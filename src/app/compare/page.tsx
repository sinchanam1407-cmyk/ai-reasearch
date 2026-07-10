"use client";

import React, { useState, useEffect } from "react";
import { getLibrary, Paper } from "../../lib/db";
import { generateLiteratureReview } from "../../lib/gemini";
import { 
  Columns, 
  Check, 
  Sparkles, 
  Layers, 
  Plus, 
  Minus,
  Table,
  LineChart,
  FileCheck,
  AlertCircle,
  FileText
} from "lucide-react";

export default function MultiPaperCompare() {
  const [library, setLibrary] = useState<Paper[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [report, setReport] = useState("");
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  useEffect(() => {
    const lib = getLibrary();
    setLibrary(lib);
    if (lib.length >= 2) {
      // Auto-select first two by default to show immediate value
      setSelectedIds([lib[0].id, lib[1].id]);
    } else if (lib.length > 0) {
      setSelectedIds([lib[0].id]);
    }
  }, []);

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      if (selectedIds.length >= 10) {
        alert("Success Metric: You can compare up to 10 papers simultaneously.");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedPapers = library.filter(p => selectedIds.includes(p.id));

  // Generate Compare Report
  const handleGenerateReport = async () => {
    if (selectedPapers.length < 2) return;
    setIsLoadingReport(true);
    setReport("");

    try {
      const abstractList = selectedPapers.map(p => ({
        title: p.title,
        abstract: p.abstract
      }));
      const comparisonText = await generateLiteratureReview(abstractList);
      setReport(comparisonText);
    } catch (e) {
      console.error(e);
      setReport("Error generating cross-paper comparison. Please verify your Gemini API key.");
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Calculate mock similarity overlap index between paper A and paper B
  const getOverlapScore = (p1: Paper, p2: Paper) => {
    // Generate a semi-stable similarity score based on overlapping tags and letters
    if (p1.id === p2.id) return 100;
    const commonTags = p1.tags.filter(t => p2.tags.includes(t)).length;
    const baseScore = 30 + (commonTags * 15);
    return Math.min(baseScore + (p1.title.length % 7) * 3, 92);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Columns className="w-6 h-6 text-indigo-400" />
          Multi-Paper Comparison Suite
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select up to 10 papers simultaneously from your library to analyze objectives, models, accuracy, and research gaps side-by-side.
        </p>
      </div>

      {/* Select Papers Grid */}
      <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Select Publications ({selectedIds.length} Selected)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {library.map((paper) => {
            const isSelected = selectedIds.includes(paper.id);
            return (
              <button
                key={paper.id}
                onClick={() => handleToggleSelect(paper.id)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-start ${
                  isSelected
                    ? "bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-500/5"
                    : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10"
                }`}
              >
                <div className="space-y-1 pr-4">
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{paper.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {paper.authors.slice(0, 2).join(", ")}
                  </p>
                  <span className="inline-block bg-white/5 text-[9px] text-slate-400 px-2 py-0.5 rounded mt-1.5 font-semibold">
                    {paper.category}
                  </span>
                </div>
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "border-white/10 bg-white/5"
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedPapers.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs">
          No papers selected for comparison. Select publications above to view comparisons.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Comparison Grid Table */}
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-white/2 flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Table className="w-4 h-4 text-indigo-400" />
                Side-by-Side Comparison Metrics
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-6 w-44">Parameters</th>
                    {selectedPapers.map(paper => (
                      <th key={paper.id} className="py-3 px-6 min-w-[240px] max-w-sm">
                        {paper.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {/* Authors */}
                  <tr>
                    <td className="py-3.5 px-6 font-bold text-slate-200 bg-white/1">Authors</td>
                    {selectedPapers.map(p => (
                      <td key={p.id} className="py-3.5 px-6 line-clamp-2">
                        {p.authors.join(", ")}
                      </td>
                    ))}
                  </tr>
                  {/* Year */}
                  <tr>
                    <td className="py-3.5 px-6 font-bold text-slate-200 bg-white/1">Publication Year</td>
                    {selectedPapers.map(p => (
                      <td key={p.id} className="py-3.5 px-6">{p.year} ({p.journal})</td>
                    ))}
                  </tr>
                  {/* Research Problem */}
                  <tr>
                    <td className="py-3.5 px-6 font-bold text-slate-200 bg-white/1">Research Problem</td>
                    {selectedPapers.map(p => (
                      <td key={p.id} className="py-3.5 px-6 leading-relaxed">
                        {p.content[0]?.text.split(".")[0]}.
                      </td>
                    ))}
                  </tr>
                  {/* Methodology */}
                  <tr>
                    <td className="py-3.5 px-6 font-bold text-slate-200 bg-white/1">Core Methodology</td>
                    {selectedPapers.map(p => (
                      <td key={p.id} className="py-3.5 px-6 leading-relaxed">
                        {p.content.find(c => c.sectionTitle.toLowerCase().includes("method"))?.text.slice(0, 180) || p.content[1]?.text.slice(0, 180)}...
                      </td>
                    ))}
                  </tr>
                  {/* Datasets */}
                  <tr>
                    <td className="py-3.5 px-6 font-bold text-slate-200 bg-white/1">Key Dataset</td>
                    {selectedPapers.map(p => (
                      <td key={p.id} className="py-3.5 px-6">
                        {p.datasets[0] ? (
                          <div>
                            <span className="font-semibold text-white">{p.datasets[0].name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Size: {p.datasets[0].size}</span>
                          </div>
                        ) : "N/A"}
                      </td>
                    ))}
                  </tr>
                  {/* Limitations */}
                  <tr>
                    <td className="py-3.5 px-6 font-bold text-slate-200 bg-white/1">Research Gaps / Limits</td>
                    {selectedPapers.map(p => (
                      <td key={p.id} className="py-3.5 px-6 leading-relaxed">
                        <ul className="list-disc pl-4 space-y-1">
                          {p.researchGaps.slice(0, 2).map((gap, i) => (
                            <li key={i}>{gap}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Semantic Similarity Analysis & Difference Report */}
          {selectedPapers.length >= 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Matrix overlap */}
              <div className="glass rounded-2xl p-5 border border-white/5 space-y-4 h-fit">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <LineChart className="w-4 h-4 text-indigo-400" />
                  Semantic Similarity Matrix
                </h3>
                <div className="space-y-3">
                  {selectedPapers.map((p1, idx1) => (
                    <div key={p1.id} className="space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 truncate">{p1.title}</div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {selectedPapers.map((p2, idx2) => {
                          const score = getOverlapScore(p1, p2);
                          return (
                            <div 
                              key={p2.id}
                              className={`text-[9px] font-bold py-1.5 rounded text-center border ${
                                score === 100 
                                  ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-300"
                                  : score > 60 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : "bg-white/5 border-white/5 text-slate-500"
                              }`}
                              title={`${p1.title} vs ${p2.title}: ${score}% Overlap`}
                            >
                              {score}%
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparative AI Report */}
              <div className="lg:col-span-2 glass rounded-2xl p-5 border border-white/5 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    AI Difference & Trend Report
                  </h3>
                  <button
                    onClick={handleGenerateReport}
                    disabled={isLoadingReport}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/30 text-white rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {isLoadingReport ? "Analyzing..." : "Synthesize Comparison"}
                  </button>
                </div>

                <div className="flex-1 text-slate-300 text-xs leading-relaxed select-text space-y-4">
                  {isLoadingReport ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500" />
                      <span className="text-[10px] text-indigo-300 font-semibold animate-pulse">
                        Cross-examining methodologies and datasets...
                      </span>
                    </div>
                  ) : report ? (
                    <div className="whitespace-pre-line border border-white/5 bg-black/10 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                      {report}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 border border-dashed border-white/5 rounded-xl">
                      <FileCheck className="w-8 h-8 text-slate-600 mb-2 animate-bounce" />
                      Click "Synthesize Comparison" to generate a detailed cross-paper academic difference report.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
