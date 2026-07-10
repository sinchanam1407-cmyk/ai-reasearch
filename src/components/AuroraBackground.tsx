import React from "react";

export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#09090b]">
      {/* Aurora Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-blob-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[140px] animate-blob-delay-1" />
      <div className="absolute top-[30%] left-[60%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] animate-blob-delay-2" />
      
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
    </div>
  );
}
