"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

import AIChatSidebarBox from "@/components/AI/ai-chat-sidebar-box";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));

    // Uncomment the following line to enable multiple expanded items
    // setExpandedItems((prev) =>
    //   prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    // );
  };

  useEffect(() => {
    // Keep collapsible open, when it's subpage is active
    NAV_DATA.some((section) => {
      return section.items.some((item) => {
        return item.items.some((subItem) => {
          if (subItem.url === pathname) {
            if (!expandedItems.includes(item.title)) {
              toggleExpanded(item.title);
            }

            // Break the loop
            return true;
          }
        });
      });
    });
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[270px] overflow-hidden border-r border-surface-300 bg-surface-100 transition-[width] duration-300 ease-in-out",
          isMobile ? "fixed bottom-0 top-0 z-50 shadow-xl" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0",
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Logo area */}
          <div className="flex items-center justify-between px-6 py-6">
            <Link
              href={"/"}
              onClick={() => isMobile && toggleSidebar()}
              className="flex items-center gap-2.5"
            >
              <Logo />
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-300 hover:text-white transition-colors"
              >
                <span className="sr-only">Close Menu</span>
                <ArrowLeftIcon className="size-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-5">
            {NAV_DATA.map((section) => (
              <div key={section.label} className="mb-6">
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-content-tertiary mb-3 px-3">
                  {section.label}
                </p>

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.title}>
                        {item.items.length ? (
                          <div>
                            <MenuItem
                              isActive={item.items.some(
                                ({ url }) => url === pathname,
                              )}
                              onClick={() => toggleExpanded(item.title)}
                            >
                              <item.icon
                                className="size-[18px] shrink-0"
                                aria-hidden="true"
                              />
                              <span>{item.title}</span>
                              <ChevronUp
                                className={cn(
                                  "mr-auto size-4 rotate-180 transition-transform duration-200",
                                  expandedItems.includes(item.title) && "rotate-0",
                                )}
                                aria-hidden="true"
                              />
                            </MenuItem>

                            {expandedItems.includes(item.title) && (
                              <ul
                                className="mr-7 mt-1 space-y-1 border-r border-surface-300 py-1 pl-0 pr-2"
                                role="menu"
                              >
                                {item.items.map((subItem) => (
                                  <li key={subItem.title} role="none">
                                    <MenuItem
                                      as="link"
                                      href={subItem.url}
                                      isActive={pathname === subItem.url}
                                    >
                                      <span className="text-[13px]">{subItem.title}</span>
                                    </MenuItem>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          (() => {
                            const href =
                              "url" in item
                                ? item.url + ""
                                : "/" + item.title.toLowerCase().split(" ").join("-");

                            return (
                              <MenuItem
                                className="flex items-center gap-3 py-2.5"
                                as="link"
                                href={href}
                                isActive={pathname === href}
                              >
                                <item.icon
                                  className="size-[18px] shrink-0"
                                  aria-hidden="true"
                                />
                                <span>{item.title}</span>
                              </MenuItem>
                            );
                          })()
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>

          {/* AI Chat Assistant Box */}
          <div className="mt-auto border-t border-surface-300 pt-4">
            <AIChatSidebarBox />
          </div>

          {/* Footer */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold text-content-tertiary text-center uppercase tracking-widest">
              AdventureWorks Analytics v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

