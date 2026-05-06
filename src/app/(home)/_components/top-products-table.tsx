"use client";
import { useState } from "react";
import type { ProductData } from "@/services/adventureworks.service";
import { Modal } from "@/components/ui/modal";

function Badge({ value }: { value: number }) {
  const color =
    value >= 50
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : value >= 30
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {value.toFixed(1)}%
    </span>
  );
}

export function AWTopProducts({ products }: { products: ProductData[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayProducts = products.slice(0, 5);
  return (
    <div className="card-futuristic p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-content">أفضل المنتجات مبيعاً</h3>
          <p className="text-xs font-medium text-neon-pink">أعلى المنتجات من حيث الإيرادات</p>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="text-sm font-medium text-neon-pink hover:text-neon-pink/80 transition-colors"
        >
          عرض الكل
        </button>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-surface-300">
              <th className="pb-3 pl-4 font-semibold text-content-tertiary">المنتج</th>
              <th className="pb-3 px-4 font-semibold text-content-tertiary">السعر</th>
              <th className="pb-3 pr-4 font-semibold text-content-tertiary">المبيعات</th>
            </tr>
          </thead>
          <tbody>
            {displayProducts.map((p, i) => {
              let rankStyle = "bg-surface-300 text-content-secondary";
              let rankGlow = "";
              if (i === 0) {
                rankStyle = "bg-neon-pink text-white";
                rankGlow = "shadow-glow-pink";
              } else if (i === 1) {
                rankStyle = "bg-neon-blue text-white";
                rankGlow = "shadow-glow-blue";
              } else if (i === 2) {
                rankStyle = "bg-neon-amber text-white";
                rankGlow = "shadow-glow-amber";
              }

              return (
                <tr
                  key={p.name}
                  className="group border-b border-surface-300/50 hover:bg-surface-300/20 transition-colors duration-200 last:border-0"
                >
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankStyle} ${rankGlow}`}
                      >
                        {i + 1}
                      </div>
                      <span className="font-medium text-content group-hover:text-neon-pink transition-colors">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-content">
                    ${p.listPrice.toFixed(2)}
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-neon-pink">
                        ${(p.sales / 1000).toFixed(1)}K
                      </span>
                      <span className="text-xs text-content-tertiary">
                        {p.qty.toLocaleString()} وحدة
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="جميع المنتجات الأكثر مبيعاً"
      >
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-surface-300">
                <th className="pb-3 pl-4 font-semibold text-content-tertiary">المنتج</th>
                <th className="pb-3 px-4 font-semibold text-content-tertiary">السعر</th>
                <th className="pb-3 pr-4 font-semibold text-content-tertiary">المبيعات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr
                  key={p.name}
                  className="group border-b border-surface-300/50 hover:bg-surface-300/20 transition-colors duration-200 last:border-0"
                >
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-surface-300 text-content-secondary">
                        {i + 1}
                      </div>
                      <span className="font-medium text-content">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-content">
                    ${p.listPrice.toFixed(2)}
                  </td>
                  <td className="py-4 pr-4 font-bold text-neon-pink">
                    ${(p.sales / 1000).toFixed(1)}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
