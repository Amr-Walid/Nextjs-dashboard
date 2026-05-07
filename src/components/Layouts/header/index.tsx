"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { ThemeToggleSwitch } from "./theme-toggle";
import { HeaderFilters } from "./header-filters";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-surface-200 bg-white px-4 py-3 md:px-6 2xl:px-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 bg-surface-50 text-content-muted hover:text-neon-blue hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 lg:hidden"
            aria-label="Toggle Sidebar"
          >
            <MenuIcon />
          </button>

          {isMobile && (
            <Link href={"/"} className="max-[430px]:hidden">
              <Image
                src={"/images/logo/logo-icon.svg"}
                width={28}
                height={28}
                alt=""
                role="presentation"
                className="brightness-200"
              />
            </Link>
          )}

          <div className="max-sm:hidden">
            <h1 className="mb-0 text-base font-black text-content tracking-tight">
              لوحة التحكم
            </h1>
            <p className="text-[9px] font-bold text-content-tertiary uppercase tracking-widest leading-none mt-1">AdventureWorks</p>
          </div>
        </div>

        {/* Global Filters in Header */}
        <div className="hidden md:block">
          <HeaderFilters />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-3">
        <div className="md:hidden">
          <HeaderFilters />
        </div>
        {/* Header right actions could go here */}
      </div>
    </header>
  );
}
