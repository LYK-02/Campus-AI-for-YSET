import React, { useState } from "react";
import { Sparkles, Send, Paperclip, BookOpen, FileText, GraduationCap, Copy, Check } from "lucide-react";
import type { ChatMode } from "../../types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    title: string;
    page?: number;
    materialId: string;
  }>;
}

export const AIChatPage: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>("GENERAL");
  const [prompt, setPrompt] = useState("");
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Hello! I am your **YSET Assistant** at Yenepoya School of Technology, powered by NVIDIA NIM Nemotron.\n\nI can explain engineering concepts, answer questions about your assigned course materials, summarize uploaded notes, or retrieve official YSET institutional knowledge.",
      sources: [
        {
          title: "YSET Academic Guide 2026",
          page: 1,
          materialId: "sys-doc-01",
        },
      ],
    },
  ]);

  const modes: Array<{ id: ChatMode; label: string; desc: string; icon: React.ElementType }> = [
    { id: "GENERAL", label: "General", desc: "Study & concepts", icon: Sparkles },
    { id: "MY_COURSES", label: "My Courses", desc: "Syllabus & notes", icon: BookOpen },
    { id: "MY_DOCUMENTS", label: "My Documents", desc: "Private uploads", icon: FileText },
    { id: "UNIVERSITY_KNOWLEDGE", label: "YSET Knowledge", desc: "Official handbook", icon: GraduationCap },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentPrompt = prompt;
    setPrompt("");

    // Temporary simulated assistant reply for foundation phase
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: `I received your question in **${mode.replace("_", " ")}** mode:\n\n> "${currentPrompt}"\n\nDuring Phase 5/6, this interface connects directly to your NVIDIA NIM Nemotron model backend with permission-scoped vector retrieval.`,
        sources:
          mode === "MY_COURSES"
            ? [{ title: "CS-304 Operating Systems Lecture 4", page: 12, materialId: "mat-os-04" }]
            : mode === "UNIVERSITY_KNOWLEDGE"
            ? [{ title: "YSET Examination Regulations 2026", page: 4, materialId: "yset-reg-01" }]
            : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 600);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col bg-white rounded-2xl border border-[#E3E8F0] overflow-hidden shadow-xs">
      {/* Top Bar: Mode Selector */}
      <div className="p-3.5 border-b border-[#E3E8F0] bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#17A89B] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#172033] leading-none">YSET Assistant</h2>
            <p className="text-[10px] text-[#68758A] mt-0.5">NVIDIA NIM Nemotron · Scoped Retrieval</p>
          </div>
        </div>

        {/* Mode Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white border border-[#E3E8F0] rounded-xl shadow-2xs">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#142B4A] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#17A89B]" : "text-slate-500"}`} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-xs ${
                msg.role === "user"
                  ? "bg-[#142B4A] text-white rounded-tr-xs"
                  : "bg-slate-50 text-[#172033] border border-[#E3E8F0] rounded-tl-xs"
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Source citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-[#68758A] uppercase tracking-wider block mb-1.5">
                    Verified Sources:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((src, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-medium text-[#315EAA]"
                      >
                        <FileText className="w-3 h-3 text-[#17A89B]" />
                        <span>{src.title}</span>
                        {src.page && <span className="text-slate-400">· p. {src.page}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Footer Controls */}
              {msg.role === "assistant" && (
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span className="text-[10px]">NVIDIA NIM Nemotron</span>
                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="p-1 hover:text-slate-700 flex items-center gap-1"
                    title="Copy response"
                  >
                    {isCopied === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Safety Disclaimer Notice */}
      <div className="px-4 py-1.5 bg-slate-50/80 border-t border-[#E3E8F0] text-center text-[11px] text-[#68758A]">
        AI responses may contain mistakes. Verify important university policies and grades using cited sources.
      </div>

      {/* Composer */}
      <div className="p-3.5 border-t border-[#E3E8F0] bg-white">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button
            type="button"
            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Attach document (PDF/Notes)"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask YSET in ${mode.replace("_", " ").toLowerCase()} mode...`}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-[#E3E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17A89B]/30 focus:border-[#17A89B] transition-all"
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="bg-[#17A89B] hover:bg-[#13897E] disabled:bg-slate-300 text-white p-2.5 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
