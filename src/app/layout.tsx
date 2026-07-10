import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import AuroraBackground from "../components/AuroraBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Research Paper Copilot - Intelligence Platform",
  description: "Accelerate your scientific reading, summarizing, comparing, and writing literature reviews with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#09090b] text-[#fafafa] flex">
        <AuroraBackground />
        
        {/* Floating Sidebar Navigation */}
        <Sidebar />

        {/* Core Main Area */}
        <main className="flex-1 min-h-screen pl-[18.5rem] pr-6 py-6 transition-all duration-300">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
