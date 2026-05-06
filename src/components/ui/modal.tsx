"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Using Portal to render at the top level of the body
  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-10">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-5xl max-h-[85vh] flex flex-col rounded-[2rem] bg-surface-base border border-surface-300 shadow-2xl animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-300 px-8 py-6 bg-surface-100">
          <div>
            <h3 className="text-2xl font-bold text-content">{title}</h3>
            <p className="text-xs font-medium text-neon-pink">AdventureWorks Analytics</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-200 text-content-tertiary hover:bg-neon-pink hover:text-white transition-all duration-300"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-surface-base">
          {children}
        </div>
        
        {/* Footer */}
        <div className="border-t border-surface-300 p-5 bg-surface-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 rounded-xl bg-surface-300 text-content font-bold hover:bg-surface-400 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
