"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { ThemeToggleSwitch } from "./theme-toggle";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-surface-300 bg-surface-100/80 px-4 py-3.5 backdrop-blur-md shadow-xs md:px-6 2xl:px-10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-300 bg-surface-200 text-content-muted hover:text-neon-crimson hover:border-neon-crimson/50 transition-all duration-300 lg:hidden"
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

        <div className="max-xl:hidden">
          <h1 className="mb-0 text-lg font-bold text-content tracking-wide">
            لوحة التحكم
          </h1>
          <p className="text-xs font-medium text-neon-crimson">AdventureWorks Analytics</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-3">
        {/* Header right actions could go here */}
      </div>
    </header>
  );
}
