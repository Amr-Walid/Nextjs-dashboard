"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, Sparkles, User, Trash2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AIChatSidebarBox() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const val = inputValue.trim();
    if (!val || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: val,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const contentType = res.headers.get("Content-Type") || "";
      if (contentType.includes("text/plain")) {
        // This is a direct message (usually a fallback or error from our server)
        const text = await res.text();
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: text || "عذراً، الخدمة مشغولة.",
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setCooldown(3);
        setIsLoading(false);
        return;
      }

      // Otherwise it's an SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (reader) {
        let fullText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const json = JSON.parse(line.substring(6));
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                fullText += text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id ? { ...m, content: fullText } : m
                  )
                );
              } catch (e) { /* partial chunk */ }
            }
          }
        }
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "⚠️ خطأ في الاتصال.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-[9999] pointer-events-auto flex flex-col h-[400px] mx-3 mb-6 overflow-hidden rounded-2xl border border-surface-300 bg-surface-200/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md">
      <header className="flex items-center justify-between border-b border-surface-300 px-4 py-3 bg-surface-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
            <Sparkles size={14} />
          </div>
          <span className="text-[13px] font-bold text-content">مساعد ذكي</span>
        </div>
        <button onClick={() => setMessages([])} className="p-1.5 text-content-tertiary hover:bg-surface-300 rounded-md">
          <Trash2 size={14} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-4 bg-gradient-to-b from-transparent to-surface-100/30">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
            <Bot size={24} className="mb-2 text-blue-600" />
            <p className="text-[11px] font-medium px-4">أهلاً بك! اسألني عن البيانات.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn("flex w-full gap-2", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white", m.role === "user" ? "bg-blue-600" : "bg-teal-500")}>
                {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div className={cn("max-w-[85%] rounded-xl px-3 py-1.5 text-[12px] leading-relaxed shadow-xs", m.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-surface-300 text-content rounded-tl-none text-right")} dir="rtl">
                {m.content}
              </div>
            </div>
          ))
        )}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white"><Bot size={12} /></div>
            <div className="bg-surface-300 rounded-xl rounded-tl-none px-3 py-1.5"><div className="flex gap-1"><div className="h-1 w-1 animate-bounce rounded-full bg-content-tertiary"></div><div className="h-1 w-1 animate-bounce rounded-full bg-content-tertiary" style={{ animationDelay: "0.1s" }}></div><div className="h-1 w-1 animate-bounce rounded-full bg-content-tertiary" style={{ animationDelay: "0.2s" }}></div></div></div>
          </div>
        )}
      </div>

      <div className="p-3 bg-surface-100 border-t border-surface-300">
        <div className="flex items-center gap-2">
          <button onClick={handleSend} disabled={!inputValue.trim() || isLoading} className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all">
            <Send size={16} />
          </button>
          <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()} placeholder="اسألني عن البيانات..." className="flex-1 min-w-0 rounded-xl border border-surface-300 bg-surface-base py-2 px-3 text-[13px] outline-none focus:ring-1 focus:ring-blue-500 text-right" dir="rtl" />
        </div>
      </div>
    </div>
  );
}
