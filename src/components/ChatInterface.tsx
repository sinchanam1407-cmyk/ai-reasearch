"use client";

import React, { useState, useEffect, useRef } from "react";
import { Paper } from "../lib/mockData";
import { getChats, saveChats } from "../lib/db";
import { chatWithPaper } from "../lib/gemini";
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Highlighter, 
  CornerDownRight, 
  RotateCcw,
  Zap
} from "lucide-react";

interface ChatInterfaceProps {
  paper: Paper;
  selectedText: string;
  clearSelection: () => void;
}

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export default function ChatInterface({ paper, selectedText, clearSelection }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachHighlight, setAttachHighlight] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history when paper changes
  useEffect(() => {
    const history = getChats(paper.id);
    if (history.length === 0) {
      // Add a welcoming system message from the assistant
      const welcomeMsg: Message = {
        role: "model",
        text: `Hello! I am your AI Research Assistant. I have indexed **"${paper.title}"**.\n\nYou can ask me questions about its objectives, methodology, limitations, datasets, or explain complex equations. Highlight text on the left to include it as context.`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMsg]);
      saveChats(paper.id, [welcomeMsg]);
    } else {
      setMessages(history);
    }
  }, [paper]);

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Set attach highlight automatically if text is selected
  useEffect(() => {
    if (selectedText) {
      setAttachHighlight(true);
    } else {
      setAttachHighlight(false);
    }
  }, [selectedText]);

  // Handle send message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() && !attachHighlight) return;
    
    let finalMessageText = textToSend;
    if (attachHighlight && selectedText) {
      finalMessageText = `Regarding the selected passage: "${selectedText}"\n\n${textToSend}`;
    }

    const newUserMessage: Message = {
      role: "user",
      text: finalMessageText,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    saveChats(paper.id, updatedMessages);
    
    setInput("");
    setAttachHighlight(false);
    clearSelection();
    setIsLoading(true);

    // Call Gemini
    const responseText = await chatWithPaper(
      paper.title,
      paper.abstract,
      paper.content.map(c => `${c.sectionTitle}\n${c.text}`).join("\n\n"),
      updatedMessages.map(m => ({ role: m.role, text: m.text })),
      finalMessageText
    );

    const newAiMessage: Message = {
      role: "model",
      text: responseText,
      timestamp: new Date().toISOString()
    };

    const finalMessages = [...updatedMessages, newAiMessage];
    setMessages(finalMessages);
    saveChats(paper.id, finalMessages);
    setIsLoading(false);
  };

  // Clear Chat History
  const handleResetChat = () => {
    const welcomeMsg: Message = {
      role: "model",
      text: `Chat reset. Ready to analyze **"${paper.title}"** anew. Ask me anything!`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMsg]);
    saveChats(paper.id, [welcomeMsg]);
  };

  const suggestions = [
    "What is the core objective?",
    "Explain the methodology used here.",
    "Explain equations like I'm five (ELI5).",
    "Identify 3 limitations of this paper."
  ];

  return (
    <div className="h-full flex flex-col min-h-0 bg-[#09090b]/20">
      {/* Panel sub-header */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 shrink-0">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-indigo-400" />
          Interactive Chat Assistant
        </h3>
        <button
          onClick={handleResetChat}
          className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition cursor-pointer"
          title="Reset conversation"
        >
          <RotateCcw className="w-3 h-3" />
          Clear Chat
        </button>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 select-text">
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            {/* Avatar */}
            <div className={`p-2 rounded-xl border shrink-0 h-9 w-9 flex items-center justify-center ${
              msg.role === "user" 
                ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-400" 
                : "bg-white/5 border-white/5 text-slate-300"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
              msg.role === "user" 
                ? "bg-indigo-600 text-white rounded-tr-none shadow-md" 
                : "glass border border-white/5 text-slate-200 rounded-tl-none whitespace-pre-line"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-indigo-400 h-9 w-9 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="glass border border-white/5 rounded-2xl rounded-tl-none px-4 py-3.5 text-xs text-indigo-300 flex items-center gap-2">
              <span className="typing-cursor">Analyzing context</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      {messages.length <= 1 && !isLoading && (
        <div className="mb-4 shrink-0">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
            Suggested Prompts
          </div>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="text-left px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] text-slate-400 hover:text-slate-200 font-medium transition cursor-pointer flex items-start gap-1.5"
              >
                <Zap className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Form */}
      <div className="shrink-0 space-y-2 border-t border-white/5 pt-3">
        {/* Highlight selection notification */}
        {selectedText && (
          <div className="flex items-center justify-between bg-indigo-950/20 border border-indigo-500/20 rounded-xl px-3 py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 max-w-[70%]">
              <Highlighter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[9px] text-indigo-300 italic truncate">
                "{selectedText}"
              </span>
            </div>
            <label className="flex items-center gap-1.5 text-[9px] text-indigo-300 cursor-pointer font-bold select-none">
              <input
                type="checkbox"
                checked={attachHighlight}
                onChange={(e) => setAttachHighlight(e.target.checked)}
                className="rounded border-indigo-500/30 text-indigo-600 focus:ring-indigo-500"
              />
              Attach context
            </label>
          </div>
        )}

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} 
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder={
              attachHighlight 
                ? "Ask AI about this highlight..." 
                : "Type message or ask about methodology..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !attachHighlight)}
            className="px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/30 disabled:text-slate-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shadow-md shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
