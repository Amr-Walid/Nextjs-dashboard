"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type FilterState = {
  region: string;
  year: string;
  category: string;
};

type FilterContextType = {
  filters: FilterState;
  setFilters: (newFilters: React.SetStateAction<FilterState>) => void;
  isPending: boolean;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    region: "All",
    year: "All",
    category: "All",
  });
  const [isPending, setIsPending] = useState(false);

  // Sync global pending state for performance
  const updateFilters = (newFilters: React.SetStateAction<FilterState>) => {
    setIsPending(true);
    setFilters(newFilters);
    setTimeout(() => setIsPending(false), 300);
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters: updateFilters, isPending }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
