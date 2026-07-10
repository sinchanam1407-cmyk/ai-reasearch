"use client";

import React, { useState, useEffect } from "react";
import { Paper } from "../lib/mockData";
import { addPaper, Paper as DbPaper } from "../lib/db";
import { 
  GitFork, 
  User, 
  Tag, 
  ExternalLink, 
  Plus, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Map
} from "lucide-react";

interface CitationGraphProps {
  paper: Paper;
}

interface GraphNode {
  id: string;
  label: string;
  type: "root" | "reference" | "citedBy" | "author" | "domain";
  x: number;
  y: number;
  details: {
    title?: string;
    authors?: string;
    year?: number;
    citations?: number;
    domain?: string;
  };
}

export default function CitationGraph({ paper }: CitationGraphProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<{ source: string; target: string }[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [addedNodeIds, setAddedNodeIds] = useState<string[]>([]);

  useEffect(() => {
    // Generate SVG coordinates dynamically centered at (200, 200)
    const rootX = 200;
    const rootY = 200;

    const tempNodes: GraphNode[] = [
      {
        id: "root-node",
        label: paper.title,
        type: "root",
        x: rootX,
        y: rootY,
        details: {
          title: paper.title,
          authors: paper.authors.join(", "),
          year: paper.year,
          citations: paper.citationCount
        }
      }
    ];

    const tempLinks: { source: string; target: string }[] = [];

    // 1. Add References (left arc)
    paper.references.forEach((ref, idx) => {
      const angle = (Math.PI / 4) * (idx - 1) + Math.PI; // Centered around 180 deg
      const radius = 110;
      const x = rootX + radius * Math.cos(angle);
      const y = rootY + radius * Math.sin(angle);
      const nodeId = `ref-${idx}`;
      
      tempNodes.push({
        id: nodeId,
        label: ref.title,
        type: "reference",
        x,
        y,
        details: {
          title: ref.title,
          authors: ref.authors,
          year: ref.year,
          citations: ref.citations,
          domain: ref.domain
        }
      });
      tempLinks.push({ source: "root-node", target: nodeId });
    });

    // 2. Add Cited By (right arc)
    paper.citedBy.forEach((cite, idx) => {
      const angle = (Math.PI / 4) * (idx - 1); // Centered around 0 deg
      const radius = 110;
      const x = rootX + radius * Math.cos(angle);
      const y = rootY + radius * Math.sin(angle);
      const nodeId = `cite-${idx}`;

      tempNodes.push({
        id: nodeId,
        label: cite.title,
        type: "citedBy",
        x,
        y,
        details: {
          title: cite.title,
          authors: cite.authors,
          year: cite.year,
          citations: cite.citations,
          domain: cite.domain
        }
      });
      tempLinks.push({ source: "root-node", target: nodeId });
    });

    // 3. Add Authors (top)
    paper.authors.slice(0, 2).forEach((auth, idx) => {
      const angle = (Math.PI / 3) * (idx + 1) + (4 * Math.PI / 3); // Centered around 270 deg (top)
      const radius = 100;
      const x = rootX + radius * Math.cos(angle);
      const y = rootY + radius * Math.sin(angle);
      const nodeId = `auth-${idx}`;

      tempNodes.push({
        id: nodeId,
        label: auth,
        type: "author",
        x,
        y,
        details: {
          authors: auth
        }
      });
      tempLinks.push({ source: "root-node", target: nodeId });
    });

    // 4. Add Domains (bottom)
    const domains = Array.from(new Set([paper.category, ...paper.tags.slice(0, 1)]));
    domains.forEach((dom, idx) => {
      const angle = (Math.PI / 3) * (idx + 1) + (Math.PI / 3); // Centered around 90 deg (bottom)
      const radius = 100;
      const x = rootX + radius * Math.cos(angle);
      const y = rootY + radius * Math.sin(angle);
      const nodeId = `dom-${idx}`;

      tempNodes.push({
        id: nodeId,
        label: dom,
        type: "domain",
        x,
        y,
        details: {
          domain: dom
        }
      });
      tempLinks.push({ source: "root-node", target: nodeId });
    });

    setNodes(tempNodes);
    setLinks(tempLinks);
    setSelectedNode(tempNodes[0]); // default select center root node
  }, [paper]);

  // Add recommend node to library
  const handleAddToLibrary = (node: GraphNode) => {
    if (!node.details.title) return;

    const newPaper: DbPaper = {
      id: `paper-recommend-${Date.now()}`,
      title: node.details.title,
      authors: node.details.authors ? [node.details.authors] : ["Unknown"],
      journal: "IEEE Semantic Search recommendation",
      year: node.details.year || new Date().getFullYear(),
      citationCount: node.details.citations || 0,
      abstract: `This paper is imported through citation networks recommendations. It is connected to "${paper.title}" through domain similarities in "${node.details.domain || "Deep Learning"}".`,
      tags: ["Imported", node.details.domain || "AI"],
      category: paper.category,
      readingProgress: 0,
      isFavorite: false,
      content: [
        {
          sectionTitle: "1. Abstract Overview",
          text: `Citation analysis notes that this paper details algorithms critical to ${node.details.domain || "Deep Learning"}. Expand your literature review by asking the chat assistant to cross-compare.`
        }
      ],
      equations: [],
      datasets: [],
      references: [],
      citedBy: [],
      researchGaps: ["Unchecked implementation scalability details."],
      futureScope: ["Cross validate on commercial benchmarks."],
      contributions: ["Extended evaluation of network parameters."]
    };

    addPaper(newPaper);
    setAddedNodeIds([...addedNodeIds, node.id]);
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-[#09090b]/10 select-none">
      {/* Description Header */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 shrink-0">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <GitFork className="w-4 h-4 text-indigo-400" />
          Citation Mapping Workspace
        </h3>
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Map className="w-3.5 h-3.5" />
          Click nodes to explore mapping
        </span>
      </div>

      {/* Grid Layout: Visual on Left, Details Card on Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-0">
        {/* SVG Network Visualizer */}
        <div className="lg:col-span-3 border border-white/5 bg-zinc-950/20 rounded-2xl flex items-center justify-center p-3 relative h-[360px] lg:h-auto overflow-hidden">
          <svg 
            viewBox="0 0 400 400" 
            className="w-full h-full max-w-[340px]"
          >
            {/* Draw Links/Lines */}
            {links.map((link, idx) => {
              const srcNode = nodes.find(n => n.id === link.source);
              const tgtNode = nodes.find(n => n.id === link.target);
              if (!srcNode || !tgtNode) return null;
              return (
                <line
                  key={idx}
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  className="stroke-indigo-500/20 stroke-[1.5]"
                  strokeDasharray="4 2"
                />
              );
            })}

            {/* Draw Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              
              // Node color styling based on type
              let nodeColor = "fill-slate-700 stroke-slate-500";
              let glowColor = "rgba(100, 116, 139, 0.4)";
              let nodeSize = 12;

              if (node.type === "root") {
                nodeColor = "fill-indigo-600 stroke-indigo-400";
                glowColor = "rgba(99, 102, 241, 0.6)";
                nodeSize = 18;
              } else if (node.type === "reference") {
                nodeColor = "fill-amber-600 stroke-amber-400";
                glowColor = "rgba(245, 158, 11, 0.4)";
              } else if (node.type === "citedBy") {
                nodeColor = "fill-emerald-600 stroke-emerald-400";
                glowColor = "rgba(16, 185, 129, 0.4)";
              } else if (node.type === "author") {
                nodeColor = "fill-pink-600 stroke-pink-400";
                glowColor = "rgba(236, 72, 153, 0.4)";
                nodeSize = 9;
              } else if (node.type === "domain") {
                nodeColor = "fill-sky-600 stroke-sky-400";
                glowColor = "rgba(14, 165, 233, 0.4)";
                nodeSize = 10;
              }

              return (
                <g 
                  key={node.id} 
                  className="cursor-pointer"
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Glowing Filter backdrop for active or selected */}
                  {(isSelected || node.type === "root") && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={nodeSize + 6}
                      fill="none"
                      stroke={node.type === "root" ? "#6366f1" : "#a855f7"}
                      strokeWidth="1"
                      className="opacity-30 animate-pulse"
                    />
                  )}
                  
                  {/* Base Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize}
                    className={`${nodeColor} stroke-2 transition duration-200 hover:scale-110`}
                  />

                  {/* Tiny text markers for root or author nodes */}
                  {(node.type === "root" || node.type === "domain" || isSelected) && (
                    <text
                      x={node.x}
                      y={node.y - nodeSize - 5}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="7"
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow"
                    >
                      {node.label.length > 15 ? `${node.label.slice(0, 12)}...` : node.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Color Indicators Drawer */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-wide bg-zinc-950/60 p-2 rounded-xl border border-white/5 backdrop-blur-md">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Active</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Reference</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Cited By</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Author</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Domain</span>
          </div>
        </div>

        {/* Node Details Card */}
        <div className="lg:col-span-2 glass border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-4">
              {/* Type Badge */}
              <div className="flex justify-between items-center">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  selectedNode.type === "root" ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20" :
                  selectedNode.type === "reference" ? "bg-amber-600/20 text-amber-300 border border-amber-500/20" :
                  selectedNode.type === "citedBy" ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/20" :
                  selectedNode.type === "author" ? "bg-pink-600/20 text-pink-300 border border-pink-500/20" :
                  "bg-sky-600/20 text-sky-300 border border-sky-500/20"
                }`}>
                  {selectedNode.type === "root" ? "Subject Publication" : selectedNode.type}
                </span>

                {selectedNode.type !== "root" && selectedNode.details.citations && (
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    Citations: {selectedNode.details.citations.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Title & Creators */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white leading-snug">
                  {selectedNode.details.title || selectedNode.label}
                </h4>
                {selectedNode.details.authors && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-indigo-400" />
                    <span>{selectedNode.details.authors}</span>
                  </div>
                )}
              </div>

              {/* Year & Domain details */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                {selectedNode.details.year && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Publication Year</span>
                    <span className="text-slate-300 font-bold">{selectedNode.details.year}</span>
                  </div>
                )}
                {selectedNode.details.domain && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Research Domain</span>
                    <span className="text-indigo-400 font-bold flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {selectedNode.details.domain}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {selectedNode.type !== "root" && selectedNode.details.title && (
                <div className="border-t border-white/5 pt-4">
                  {addedNodeIds.includes(selectedNode.id) ? (
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-xl">
                      <CheckCircle className="w-4 h-4" />
                      Added to Library
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToLibrary(selectedNode)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Recommended to Library
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-[10px] py-12">
              <HelpCircle className="w-8 h-8 text-slate-600 mb-2" />
              Select a node in the mapping to examine bibliographic metrics.
            </div>
          )}

          {/* Quick Note */}
          <p className="text-[9px] text-slate-500 mt-4 leading-normal bg-black/10 p-2.5 rounded-xl border border-white/5">
            AI recommends papers based on bibliographic coupling and author co-citation frequency matrices.
          </p>
        </div>
      </div>
    </div>
  );
}
