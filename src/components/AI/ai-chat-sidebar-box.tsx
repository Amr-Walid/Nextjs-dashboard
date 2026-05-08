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

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("aw_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
  }, []);

  // Save messages to localStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("aw_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

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

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMsg];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${res.status}`);
      }

      // Read the streaming text response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantMsg.content += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: assistantMsg.content }
                : m
            )
          );
        }
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "⚠️ حدث خطأ: " + (err?.message || "مشكلة في الاتصال"),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-[9999] pointer-events-auto flex flex-col h-[400px] mx-3 mb-6 overflow-hidden rounded-2xl border border-surface-300 bg-surface-200/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-surface-300 px-4 py-3 bg-surface-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
            <Sparkles size={14} />
          </div>
          <span className="text-[13px] font-bold text-content">مساعد ذكي</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              localStorage.removeItem("aw_chat_history");
            }}
            className="rounded-md p-1.5 text-content-tertiary hover:bg-surface-300 transition-colors"
            title="مسح المحادثة"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-4 bg-gradient-to-b from-transparent to-surface-100/30"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
            <Bot size={24} className="mb-2 text-blue-600" />
            <p className="text-[11px] font-medium leading-relaxed px-4">
              أهلاً بك! اسألني أي شيء عن بيانات المبيعات والمنتجات.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex w-full gap-2",
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white",
                  m.role === "user" ? "bg-blue-600" : "bg-teal-500"
                )}
              >
                {m.role === "user" ? (
                  <User size={12} />
                ) : (
                  <Bot size={12} />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-1.5 text-[12px] leading-relaxed shadow-xs",
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-surface-300 text-content rounded-tl-none text-right"
                )}
                dir="rtl"
              >
                {m.content.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={i} className="font-extrabold text-blue-900 dark:text-blue-200">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </div>
            </div>
          ))
        )}
        {isLoading &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
                <Bot size={12} />
              </div>
              <div className="bg-surface-300 rounded-xl rounded-tl-none px-3 py-1.5">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-content-tertiary"></div>
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-content-tertiary"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-content-tertiary"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-surface-100 border-t border-surface-300">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-50 shadow-sm"
          >
            <Send size={16} />
          </button>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="اسألني عن البيانات..."
            className="flex-1 min-w-0 rounded-xl border border-surface-300 bg-surface-base py-2 px-3 text-[13px] outline-none focus:ring-1 focus:ring-blue-500 text-right"
            dir="rtl"
          />
        </div>
      </div>
    </div>
  );
}
