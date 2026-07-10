"use client";

import React, { useState } from "react";
import { Paper } from "../lib/mockData";
import { 
  FileText, 
  Copy, 
  CheckCircle,
  Bookmark,
  Share2,
  BookmarkCheck
} from "lucide-react";

interface CitationGeneratorProps {
  paper: Paper;
}

type CitationStyle = "ieee" | "apa" | "mla" | "harvard" | "chicago" | "bibtex";

export default function CitationGenerator({ paper }: CitationGeneratorProps) {
  const [style, setStyle] = useState<CitationStyle>("ieee");
  const [isCopied, setIsCopied] = useState(false);

  // Format Authors helper
  const getFormattedAuthors = (format: "initials" | "full" | "bibtex") => {
    if (format === "initials") {
      // e.g. A. Vaswani, N. Shazeer
      return paper.authors.map(a => {
        const parts = a.split(" ");
        const lastName = parts[parts.length - 1];
        const initial = parts[0] ? `${parts[0].charAt(0)}.` : "";
        return `${initial} ${lastName}`;
      }).join(", ");
    }
    if (format === "full") {
      // e.g. Vaswani, A., & Shazeer, N.
      return paper.authors.map(a => {
        const parts = a.split(" ");
        const lastName = parts[parts.length - 1];
        const initial = parts[0] ? `${parts[0].charAt(0)}.` : "";
        return `${lastName}, ${initial}`;
      }).join(" & ");
    }
    // bibtex: Author1 and Author2
    return paper.authors.join(" and ");
  };

  const getCitationText = () => {
    const year = paper.year;
    const title = paper.title;
    const journal = paper.journal;
    
    switch (style) {
      case "apa":
        return `${getFormattedAuthors("full")} (${year}). ${title}. ${journal}.`;
      case "mla":
        return `${paper.authors.join(", ")}. "${title}." ${journal}, vol. 1, no. 1, ${year}.`;
      case "harvard":
        return `${getFormattedAuthors("full")}, ${year}. '${title}', ${journal}.`;
      case "chicago":
        return `${paper.authors.join(", ")}. "${title}." ${journal} 1, no. 1 (${year}).`;
      case "bibtex":
        const authorPart = paper.authors[0]?.split(" ").pop()?.toLowerCase() || "ref";
        const citeKey = authorPart + year;
        return `@article{${citeKey},\n  author = {${getFormattedAuthors("bibtex")}},\n  title = {${title}},\n  journal = {${journal}},\n  year = {${year}},\n  publisher = {Scientific Library}\n}`;
      case "ieee":
      default:
        return `[1] ${getFormattedAuthors("initials")}, "${title}," ${journal}, ${year}.`;
    }
  };

  const getInTextCitation = () => {
    const authorLastName = paper.authors[0]?.split(" ").pop() || "Author";
    const year = paper.year;
    switch (style) {
      case "apa":
      case "harvard":
        return `(${authorLastName}, ${year})`;
      case "mla":
        return `(${authorLastName})`;
      case "chicago":
        return `(${authorLastName} ${year})`;
      case "bibtex":
        const citeKey = authorLastName.toLowerCase() + year;
        return `\\cite{${citeKey}}`;
      case "ieee":
      default:
        return `[1]`;
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const styleOptions = [
    { id: "ieee", name: "IEEE Style" },
    { id: "apa", name: "APA 7th Edition" },
    { id: "mla", name: "MLA 9th Edition" },
    { id: "harvard", name: "Harvard Style" },
    { id: "chicago", name: "Chicago Style" },
    { id: "bibtex", name: "BibTeX Format" }
  ] as const;

  return (
    <div className="h-full flex flex-col min-h-0 bg-[#09090b]/10 select-none">
      {/* Sub Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 shrink-0">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <BookmarkCheck className="w-4 h-4 text-indigo-400" />
          AI Citation Generator
        </h3>
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Share2 className="w-3.5 h-3.5" />
          Export bibliography
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between gap-5 min-h-0">
        {/* Style Selection header */}
        <div className="flex flex-wrap gap-1.5 bg-white/5 border border-white/5 p-2 rounded-2xl shrink-0 justify-between items-center">
          <div className="flex flex-wrap gap-1">
            {styleOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setStyle(opt.id)}
                className={`px-3 py-1.5 text-[9px] font-bold rounded-lg transition border cursor-pointer ${
                  style === opt.id
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>

        {/* Output blocks */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1 select-text">
          {/* Output 1: Full Reference Bibliography */}
          <div className="space-y-1.5">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Bibliography Reference</span>
            <div className="border border-white/5 bg-zinc-950/20 rounded-2xl p-4 flex justify-between items-start gap-4">
              <p className={`text-xs leading-relaxed text-slate-300 ${style === "bibtex" ? "font-mono text-[10px] whitespace-pre" : ""}`}>
                {getCitationText()}
              </p>
              <button
                onClick={() => handleCopyToClipboard(getCitationText())}
                className="bg-white/5 hover:bg-white/10 p-2 rounded-xl text-slate-400 hover:text-slate-200 transition shrink-0 cursor-pointer border border-white/5"
                title="Copy reference"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Output 2: In-Text format */}
          <div className="space-y-1.5">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">In-Text Citation</span>
            <div className="border border-white/5 bg-zinc-950/20 rounded-2xl p-4 flex justify-between items-start gap-4">
              <p className="text-xs font-mono text-indigo-400 font-bold">
                {getInTextCitation()}
              </p>
              <button
                onClick={() => handleCopyToClipboard(getInTextCitation())}
                className="bg-white/5 hover:bg-white/10 p-2 rounded-xl text-slate-400 hover:text-slate-200 transition shrink-0 cursor-pointer border border-white/5"
                title="Copy in-text marker"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Copy Indicator Status */}
        {isCopied && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-emerald-400 text-[10px] font-bold flex items-center justify-center gap-1.5 shrink-0 animate-in fade-in zoom-in-95 duration-150">
            <CheckCircle className="w-4 h-4" />
            Citation copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
}
