"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { 
  Bot, 
  X, 
  Send, 
  Settings, 
  Sparkles, 
  User, 
  MessageSquare,
  Trash2,
  ChevronLeft
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AIAssistantSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userApiKey, setUserApiKey] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("user-gemini-api-key");
    if (savedKey) setUserApiKey(savedKey);
  }, []);

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      apiKey: userApiKey,
    },
    onFinish: () => {
      scrollToBottom();
    }
  });

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveApiKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem("user-gemini-api-key", key);
    setShowSettings(false);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition-all hover:scale-110 hover:bg-blue-700 active:scale-95"
          aria-label="Open AI Assistant"
        >
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20"></div>
          <Bot size={28} />
        </button>
      )}

      {/* Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-full max-w-[400px] bg-white shadow-2xl transition-transform duration-500 ease-in-out dark:bg-gray-900 sm:w-[400px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="flex items-center justify-between border-b p-4 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-600/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 dark:text-white">AI Assistant</h2>
                <p className="text-xs text-gray-500">Data Analytics & Insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Settings"
              >
                <Settings size={20} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Settings View */}
          {showSettings && (
            <div className="border-b bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold">API Configuration</h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Done
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Google Gemini API Key
                  </label>
                  <input 
                    type="password"
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    placeholder="Enter your AIza... key"
                    className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">
                    Your key is stored locally in your browser.
                  </p>
                </div>
                <button 
                  onClick={() => saveApiKey(userApiKey)}
                  className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Save API Key
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
          >
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                  <MessageSquare size={32} />
                </div>
                <h3 className="mb-2 font-semibold text-gray-800 dark:text-white">Ask me about your data!</h3>
                <p className="max-w-[240px] text-sm text-gray-500">
                  Try asking: "What was the total profit last year?" or "Which products are top sellers?"
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div 
                  key={m.id} 
                  className={cn(
                    "flex w-full gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
                    m.role === "user" ? "bg-blue-600" : "bg-teal-500"
                  )}>
                    {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                    m.role === "user" 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-tl-none"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
                  <Bot size={16} />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-2 text-sm">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error.message || "An error occurred. Check your API key."}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4 dark:border-gray-800">
            <form 
              onSubmit={handleSubmit}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={clearChat}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Clear Chat"
              >
                <Trash2 size={18} />
              </button>
              <div className="relative flex-1">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask a question..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!input || isLoading}
                  className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
            <p className="mt-2 text-center text-[10px] text-gray-400">
              Powered by Gemini 1.5 Flash
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
