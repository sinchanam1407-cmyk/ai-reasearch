"use client";

import React, { useState, useEffect } from "react";
import { Paper } from "../lib/mockData";
import { getNotes, saveNote, deleteNote, Note, updatePaper } from "../lib/db";
import { 
  BookOpen, 
  Bookmark, 
  FileText, 
  Trash2, 
  Plus, 
  BookmarkCheck, 
  CornerDownRight, 
  Sparkles,
  FileQuestion,
  Highlighter
} from "lucide-react";

interface DocumentViewerProps {
  paper: Paper;
  onTextSelection: (text: string) => void;
}

export default function DocumentViewer({ paper, onTextSelection }: DocumentViewerProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [selectedSnippet, setSelectedSnippet] = useState("");

  // Load notes for the paper
  useEffect(() => {
    setNotes(getNotes(paper.id));
    setActiveSection(0); // Reset to first section when paper changes
  }, [paper]);

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";
    if (text) {
      setSelectedSnippet(text);
      onTextSelection(text);
    }
  };

  const clearSelection = () => {
    setSelectedSnippet("");
    onTextSelection("");
    window.getSelection()?.removeAllRanges();
  };

  // Add Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      paperId: paper.id,
      text: newNoteText.trim(),
      highlightedText: selectedSnippet || undefined,
      createdAt: new Date().toISOString()
    };

    saveNote(paper.id, newNote);
    setNotes(getNotes(paper.id));
    setNewNoteText("");
    clearSelection();

    // Increment progress slightly as they annotate
    if (paper.readingProgress < 95) {
      const updated = { ...paper, readingProgress: Math.min(paper.readingProgress + 5, 100) };
      updatePaper(updated);
    }
  };

  // Delete Note
  const handleDeleteNote = (noteId: string) => {
    deleteNote(paper.id, noteId);
    setNotes(getNotes(paper.id));
  };

  return (
    <div className="h-full flex flex-col glass border border-white/5 rounded-2xl overflow-hidden">
      {/* Paper Information Header */}
      <div className="p-5 border-b border-white/5 bg-white/2">
        <h2 className="text-sm font-bold text-white line-clamp-2 leading-relaxed">
          {paper.title}
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-400">
          <span className="font-semibold text-slate-300">
            {paper.authors.slice(0, 2).join(", ")}{paper.authors.length > 2 ? " et al." : ""}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{paper.journal}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{paper.year}</span>
        </div>
      </div>

      {/* Reader Layout Split */}
      <div className="flex-1 flex min-h-0">
        {/* Section Navigation Column */}
        <div className="w-44 border-r border-white/5 bg-white/1 flex flex-col justify-between shrink-0">
          <div className="p-3 space-y-1 overflow-y-auto max-h-[50vh]">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2.5 mb-2">
              Outline
            </div>
            {paper.content.map((sec, idx) => (
              <button
                key={sec.sectionTitle}
                onClick={() => setActiveSection(idx)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-1.5 line-clamp-1 ${
                  activeSection === idx
                    ? "bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                <span className="truncate">{sec.sectionTitle}</span>
              </button>
            ))}
          </div>

          {/* Quick instructions */}
          <div className="p-3.5 border-t border-white/5 text-[9px] text-slate-500 bg-black/10">
            <span className="font-bold text-slate-400 block mb-1">Highlight Mode:</span>
            Select text in the reader to chat, explain or attach as an AI annotated note.
          </div>
        </div>

        {/* Reader Paragraph Content */}
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-950/10">
          {/* Main Reading Screen */}
          <div 
            className="flex-1 overflow-y-auto p-6 text-slate-300 text-xs leading-relaxed space-y-4 select-text"
            onMouseUp={handleTextSelection}
          >
            <h3 className="font-bold text-white text-sm border-b border-white/5 pb-2 mb-4">
              {paper.content[activeSection]?.sectionTitle}
            </h3>
            
            {paper.content[activeSection]?.text.split("\n\n").map((para, i) => (
              <p key={i} className="text-justify font-sans text-slate-300 antialiased">
                {para}
              </p>
            ))}
          </div>

          {/* Selection Actions Banner */}
          {selectedSnippet && (
            <div className="bg-indigo-600/10 border-t border-indigo-500/20 px-4 py-2.5 flex items-center justify-between shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2 max-w-[65%]">
                <Highlighter className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-[10px] text-indigo-300 truncate italic">
                  "{selectedSnippet}"
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearSelection}
                  className="px-2.5 py-1 text-[9px] font-semibold text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition cursor-pointer"
                >
                  Clear
                </button>
                <a
                  href="#new-note-input"
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-bold shadow-md transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Attach Note
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes & Annotations Footbar */}
      <div className="border-t border-white/5 bg-white/1 p-4 shrink-0 max-h-56 flex flex-col">
        <h3 className="text-[10px] font-bold text-white flex items-center gap-1.5 uppercase tracking-wider mb-2">
          <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
          Workspace Annotations ({notes.length})
        </h3>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3">
          {notes.length === 0 ? (
            <div className="text-[10px] text-slate-500 py-2 italic">
              No notes added yet. Annotate definitions, equations or findings here.
            </div>
          ) : (
            notes.map((note) => (
              <div 
                key={note.id}
                className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex justify-between items-start gap-3"
              >
                <div className="space-y-1">
                  {note.highlightedText && (
                    <div className="text-[9px] text-indigo-300 font-semibold border-l-2 border-indigo-500 pl-2 italic line-clamp-1">
                      "{note.highlightedText}"
                    </div>
                  )}
                  <p className="text-[10px] text-slate-200 leading-normal">{note.text}</p>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-slate-500 hover:text-rose-400 p-0.5 rounded cursor-pointer transition shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="flex gap-2">
          <input
            id="new-note-input"
            type="text"
            placeholder={
              selectedSnippet 
                ? "Annotate your highlight..." 
                : "Type a study note or bookmark..."
            }
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-[10px] text-white focus:outline-none focus:border-indigo-500/50"
          />
          <button
            type="submit"
            className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold transition flex items-center justify-center cursor-pointer shrink-0"
          >
            Add Note
          </button>
        </form>
      </div>
    </div>
  );
}
