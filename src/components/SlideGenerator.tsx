"use client";

import React, { useState } from "react";
import pptxgen from "pptxgenjs";
import { Paper } from "../lib/mockData";
import { generateSlides, SlideContent } from "../lib/gemini";
import { 
  Sliders, 
  Sparkles, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  FileCheck,
  Palette
} from "lucide-react";

interface SlideGeneratorProps {
  paper: Paper;
}

type ThemeType = "academic" | "professional" | "modern" | "dark";

export default function SlideGenerator({ paper }: SlideGeneratorProps) {
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>("dark");
  const [isExporting, setIsExporting] = useState(false);

  // Generate Slides Outline
  const handleGenerateOutline = async () => {
    setIsLoading(true);
    setCurrentSlideIdx(0);
    try {
      const outline = await generateSlides(
        paper.title,
        paper.content.map(c => `${c.sectionTitle}\n${c.text}`).join("\n\n")
      );
      setSlides(outline);
    } catch (e) {
      console.error("Slide outline creation error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Export PPTX File using pptxgenjs client-side
  const handleExportPPTX = async () => {
    if (slides.length === 0) return;
    setIsExporting(true);

    try {
      const pres = new pptxgen();
      
      // Define colors based on selected theme
      let bgHex = "FFFFFF";
      let titleColorHex = "1E3A8A";
      let textColorHex = "334155";
      
      if (selectedTheme === "professional") {
        bgHex = "0F172A";
        titleColorHex = "F8FAFC";
        textColorHex = "CBD5E1";
      } else if (selectedTheme === "modern") {
        bgHex = "FAF5FF";
        titleColorHex = "6B21A8";
        textColorHex = "475569";
      } else if (selectedTheme === "dark") {
        bgHex = "09090B";
        titleColorHex = "FFFFFF";
        textColorHex = "A1A1AA";
      }

      // Slide layout config
      pres.layout = "LAYOUT_16x9";

      // Add slides
      slides.forEach((slideContent, index) => {
        const slide = pres.addSlide();
        
        // Background color
        slide.background = { fill: bgHex };

        // Slide title
        slide.addText(slideContent.title, {
          x: 0.8,
          y: 0.8,
          w: 8.5,
          h: 1.0,
          fontSize: 26,
          bold: true,
          color: titleColorHex,
          fontFace: "Arial"
        });

        // Slide Bullets list
        const bulletObjects = slideContent.bullets.map(bullet => ({
          text: bullet,
          options: {
            bullet: { type: "bullet" as const },
            fontSize: 14,
            color: textColorHex,
            fontFace: "Arial",
            lineSpacing: 22
          }
        }));

        slide.addText(bulletObjects, {
          x: 0.8,
          y: 2.2,
          w: 8.5,
          h: 4.0,
          valign: "top"
        });

        // Add a small slide number footer
        slide.addText(`${index + 1} / ${slides.length}`, {
          x: 8.8,
          y: 5.2,
          w: 1.0,
          h: 0.4,
          fontSize: 10,
          color: textColorHex
        });
      });

      const fileName = `${paper.title.replace(/[^a-zA-Z0-9]/g, "_")}_Presentation.pptx`;
      await pres.writeFile({ fileName });
    } catch (e) {
      console.error("PPTX write error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Move carousel
  const nextSlide = () => {
    if (currentSlideIdx < slides.length - 1) {
      setCurrentSlideIdx(currentSlideIdx + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx(currentSlideIdx - 1);
    }
  };

  const themeOptions = [
    { id: "academic", name: "Academic Light", colors: "bg-blue-900 border-blue-400" },
    { id: "professional", name: "Navy Prof", colors: "bg-slate-900 border-slate-400" },
    { id: "modern", name: "Modern Purple", colors: "bg-purple-900 border-purple-400" },
    { id: "dark", name: "Dark Carbon", colors: "bg-zinc-950 border-zinc-700" }
  ] as const;

  // Active theme classes for mock slide preview
  const getThemePreviewClasses = () => {
    switch (selectedTheme) {
      case "academic":
        return "bg-slate-50 border-indigo-200 text-slate-800";
      case "professional":
        return "bg-slate-900 border-slate-800 text-slate-100";
      case "modern":
        return "bg-purple-50/50 border-purple-200 text-slate-800";
      case "dark":
      default:
        return "bg-zinc-950 border-white/5 text-zinc-300";
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-[#09090b]/10 select-none">
      {/* Sub Header panel */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 shrink-0">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-indigo-400" />
          AI Presentation Generator
        </h3>
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Palette className="w-3.5 h-3.5" />
          Choose slide templates
        </span>
      </div>

      {slides.length === 0 ? (
        // Initial Action State
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-2xl">
          {isLoading ? (
            <div className="space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 mx-auto" />
              <p className="text-xs text-indigo-300 font-bold animate-pulse">
                Analyzing sections and compiling slide decks...
              </p>
            </div>
          ) : (
            <>
              <Sliders className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
              <h3 className="text-xs font-bold text-white mb-1">Create PowerPoint Deck</h3>
              <p className="text-[10px] text-slate-400 max-w-xs mb-4">
                Let AI read the objectives, methodologies, and findings of the paper and convert them into slides.
              </p>
              <button
                onClick={handleGenerateOutline}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Generate Presentation Outline
              </button>
            </>
          )}
        </div>
      ) : (
        // Slide Carousel Preview & Controls
        <div className="flex-1 flex flex-col justify-between gap-5 min-h-0">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl shrink-0">
            {/* Template selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Template:</span>
              <div className="flex gap-1.5">
                {themeOptions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id)}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border transition cursor-pointer ${
                      selectedTheme === t.id
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Export PPTX button */}
            <button
              onClick={handleExportPPTX}
              disabled={isExporting}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? "Exporting..." : "Download PowerPoint PPTX"}
            </button>
          </div>

          {/* Slide Visual Display (Preview) */}
          <div className={`flex-1 border rounded-2xl p-6 flex flex-col justify-between shadow-lg h-56 min-h-0 relative transition-colors duration-300 ${getThemePreviewClasses()}`}>
            <div>
              {/* Header Title */}
              <h4 className={`text-base font-extrabold tracking-tight ${
                selectedTheme === "academic" ? "text-blue-900" :
                selectedTheme === "professional" ? "text-slate-50" :
                selectedTheme === "modern" ? "text-purple-800" :
                "text-white"
              }`}>
                {slides[currentSlideIdx].title}
              </h4>
              
              {/* Bullets List */}
              <ul className="mt-4 space-y-2">
                {slides[currentSlideIdx].bullets.map((bullet, idx) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-2 text-[11px] leading-relaxed"
                  >
                    <span className={`text-[13px] leading-none select-none shrink-0 ${
                      selectedTheme === "academic" ? "text-indigo-500" :
                      selectedTheme === "modern" ? "text-purple-500" :
                      "text-indigo-400"
                    }`}>
                      •
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer markers */}
            <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase tracking-widest pt-2">
              <span>{paper.title.slice(0, 30)}...</span>
              <span>Slide {currentSlideIdx + 1} of {slides.length}</span>
            </div>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center justify-between shrink-0 px-2">
            <button
              onClick={prevSlide}
              disabled={currentSlideIdx === 0}
              className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl transition cursor-pointer text-slate-300 border border-white/5"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-[10px] text-slate-400 font-bold">
              Navigate slide Outline ({currentSlideIdx + 1}/{slides.length})
            </span>

            <button
              onClick={nextSlide}
              disabled={currentSlideIdx === slides.length - 1}
              className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl transition cursor-pointer text-slate-300 border border-white/5"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
