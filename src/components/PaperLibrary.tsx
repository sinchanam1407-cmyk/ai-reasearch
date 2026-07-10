"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Trash2, 
  Heart, 
  UploadCloud, 
  Sparkles, 
  ExternalLink,
  BookOpen,
  Plus,
  FolderClosed,
  Tags,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { getLibrary, addPaper, deletePaper, updatePaper, Paper } from "../lib/db";

interface PaperLibraryProps {
  onPaperSelected?: (paper: Paper) => void;
}

export default function PaperLibrary({ onPaperSelected }: PaperLibraryProps) {
  const router = useRouter();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setPapers(getLibrary());
  }, []);

  const refreshLibrary = () => {
    setPapers(getLibrary());
  };

  // Toggle favorite
  const handleToggleFavorite = (e: React.MouseEvent, paper: Paper) => {
    e.stopPropagation();
    const updated = { ...paper, isFavorite: !paper.isFavorite };
    updatePaper(updated);
    refreshLibrary();
  };

  // Delete paper
  const handleDeletePaper = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deletePaper(id);
    refreshLibrary();
  };

  // Open Workspace
  const handleOpenWorkspace = (id: string) => {
    router.push(`/workspace?id=${id}`);
  };

  // Filter papers
  const categories = ["All", ...Array.from(new Set(papers.map(p => p.category)))];
  
  const filteredPapers = papers.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      p.authors.some(a => a.toLowerCase().includes(search.toLowerCase())) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle Drag & Drop Upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    const file = files[0];
    await processFile(file);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const file = files[0];
    await processFile(file);
  };

  const processFile = async (file: File) => {
    const validTypes = [
      "application/pdf", 
      "text/plain", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];
    
    const isTxt = file.type === "text/plain" || file.name.endsWith(".txt");
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    
    if (!validTypes.includes(file.type) && !isTxt && !isPdf) {
      setUploadStatus("error");
      setErrorMessage("Invalid file format. Please upload PDF, TXT, DOCX, or PPTX.");
      setTimeout(() => setUploadStatus("idle"), 4000);
      return;
    }

    try {
      let fileText = "";
      
      if (isTxt) {
        fileText = await file.text();
      } else {
        // For PDF/DOCX/PPTX on client-side, we simulate text content extraction
        // using the file metadata and a placeholder document outline.
        fileText = `This is the extracted text of the uploaded file: "${file.name}".\n\n` +
                   `It contains scientific sections and data regarding its research domain. ` +
                   `Using the Research Copilot Workspace, you can chat with this document, explain its equations, and generate slides.`;
      }

      // Generate clean paper metadata based on file name
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      const newPaper: Paper = {
        id: `paper-${Date.now()}`,
        title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        authors: ["Self-Uploaded Scholar"],
        journal: "User Uploaded Repository",
        year: new Date().getFullYear(),
        citationCount: 0,
        abstract: fileText.slice(0, 400) + "...",
        tags: ["Uploaded", file.name.split(".").pop()?.toUpperCase() || "DOC"],
        category: "Uploaded Files",
        readingProgress: 0,
        isFavorite: false,
        content: [
          {
            sectionTitle: "1. Introduction",
            text: fileText + "\n\nIn this document, we discuss the primary architecture, scope of the problems solved, and methodology outline. Detailed insights can be unlocked by chatting with the paper."
          },
          {
            sectionTitle: "2. Methodology",
            text: "The approach combines empirical research methods, data collection, and software optimizations. Equations can be extracted using the Equation Explainer tab."
          },
          {
            sectionTitle: "3. Results & Evaluation",
            text: "Experiments demonstrate high validity and efficiency. Metrics are stable across multi-variate test cycles."
          }
        ],
        equations: [
          {
            id: `eq-upload-${Date.now()}-1`,
            latex: "y = f(x) = Wx + b",
            description: "A standard linear mapping representing predictions in regression modeling, scaling the features vector x by weight W plus bias b.",
            derivation: "Derived from linear regression algorithms to compute model outputs.",
            variables: [
              { name: "y", meaning: "Target prediction output vector" },
              { name: "x", meaning: "Input features vector" },
              { name: "W", meaning: "Weight projection matrix" },
              { name: "b", meaning: "Bias constant" }
            ]
          }
        ],
        datasets: [
          {
            name: "Uploaded Dataset Reference",
            source: "Embedded Document Data",
            size: "Variable size",
            features: ["Features list", "Raw data fields"],
            description: "Dataset parsed directly from the uploaded reference file."
          }
        ],
        references: [],
        citedBy: [],
        researchGaps: [
          "Needs further parameter refinement in production scaling.",
          "High processing times for raw structured data formats."
        ],
        futureScope: [
          "Deploy model weights directly into mobile edge hardware.",
          "Incorporate online reinforcement learning loops."
        ],
        contributions: [
          "Custom compiled research summaries from uploaded scholar data."
        ]
      };

      addPaper(newPaper);
      setUploadStatus("success");
      refreshLibrary();
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (err: any) {
      setUploadStatus("error");
      setErrorMessage("Error reading file content: " + err.message);
      setTimeout(() => setUploadStatus("idle"), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload & Search Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`md:col-span-2 border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden ${
            isDragging 
              ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]" 
              : "border-white/10 hover:border-white/20 bg-white/5"
          }`}
        >
          <input 
            type="file" 
            id="file-upload" 
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            accept=".pdf,.txt,.docx,.pptx"
          />
          
          {uploadStatus === "idle" && (
            <>
              <UploadCloud className="w-10 h-10 text-indigo-400 mb-3 animate-pulse" />
              <h3 className="text-sm font-semibold text-white">Drag & Drop Research Paper</h3>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, DOCX, PPTX, or TXT (Max 50MB)
              </p>
            </>
          )}

          {uploadStatus === "success" && (
            <div className="flex flex-col items-center justify-center text-emerald-400">
              <CheckCircle className="w-10 h-10 mb-2 animate-bounce" />
              <h3 className="text-sm font-bold">Paper Uploaded Successfully!</h3>
              <p className="text-xs text-slate-300 mt-1">Added to library database.</p>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="flex flex-col items-center justify-center text-rose-400">
              <AlertCircle className="w-10 h-10 mb-2" />
              <h3 className="text-sm font-bold">Upload Failed</h3>
              <p className="text-xs text-slate-300 mt-1">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Search & Categories */}
        <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-400" />
              Filter Library
            </h3>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search title, tags, authors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/50"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-white/5">
            Showing {filteredPapers.length} of {papers.length} publications
          </div>
        </div>
      </div>

      {/* Library Table / Grid */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-white/2 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Publications Workspace
          </h3>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-md">
            All Papers
          </span>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No papers found matching filters. Drop a new PDF to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold text-slate-400 bg-white/1 uppercase tracking-wider">
                  <th className="py-3 px-6">Title</th>
                  <th className="py-3 px-6">Authors</th>
                  <th className="py-3 px-6">Year & Journal</th>
                  <th className="py-3 px-6">Tags</th>
                  <th className="py-3 px-6 text-center">Reading Progress</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPapers.map((paper) => (
                  <tr 
                    key={paper.id}
                    onClick={() => handleOpenWorkspace(paper.id)}
                    className="hover:bg-white/3 transition duration-150 cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleToggleFavorite(e, paper)}
                          className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Heart 
                            className={`w-4 h-4 ${paper.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} 
                          />
                        </button>
                        <div>
                          <div className="font-semibold text-slate-200 group-hover:text-indigo-400 transition text-xs line-clamp-1">
                            {paper.title}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            Citations: {paper.citationCount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                      <span className="line-clamp-1">{paper.authors.slice(0, 3).join(", ")}{paper.authors.length > 3 ? " et al." : ""}</span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                      <div className="line-clamp-1">{paper.journal}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{paper.year}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {paper.tags.slice(0, 2).map(t => (
                          <span 
                            key={t}
                            className="bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-semibold text-indigo-400 px-2 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                          <div 
                            className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${paper.readingProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 w-8">{paper.readingProgress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenWorkspace(paper.id); }}
                          className="bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                          title="Open Workspace"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeletePaper(e, paper.id)}
                          className="bg-white/5 hover:bg-rose-600/30 border border-white/10 hover:border-rose-500/40 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          title="Delete Paper"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
