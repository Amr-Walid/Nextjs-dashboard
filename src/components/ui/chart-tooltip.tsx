import React from "react";
import { TooltipProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

export function CustomTooltip({
  active,
  payload,
  label,
  formatter,
}: any) {
  if (active && payload && payload.length) {
    return (
      <div className="card-futuristic p-3 min-w-[120px] bg-surface-200/90 backdrop-blur-md border-surface-300">
        {label && <p className="text-content-secondary text-xs mb-2 font-medium">{label}</p>}
        <div className="flex flex-col gap-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shadow-glow-sm"
                style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}` }}
              />
              <span className="text-content-tertiary text-xs flex-1">{entry.name}:</span>
              <span className="text-content font-bold text-sm">
                {formatter ? formatter(Number(entry.value)) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
