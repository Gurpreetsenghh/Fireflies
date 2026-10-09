"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Settings, FileText, BookOpen, Upload, Users, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const navItems = [
    { name: "Meetings", href: "/meetings", icon: LayoutGrid },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const comingSoonItems = [
    { name: "Notebook", icon: BookOpen },
    { name: "Uploads", icon: Upload },
    { name: "Team", icon: Users },
  ];

  return (
    <div 
      className={cn(
        "bg-[#1a1a2e] text-slate-300 flex flex-col h-full shrink-0 transition-all duration-300 relative",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-slate-800 text-white rounded-full p-1 border border-[#1a1a2e] hover:bg-slate-700 z-10 transition-transform"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={cn("p-4 flex items-center gap-2 text-white font-bold mb-4", isCollapsed ? "justify-center px-0" : "text-xl")}>
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-white" />
        </div>
        {!isCollapsed && <span className="truncate">Fireflies Clone</span>}
      </div>

      <nav className="px-3 space-y-1 mb-8">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/20 text-white"
                  : "hover:bg-slate-800 hover:text-white",
                isCollapsed ? "justify-center px-0" : ""
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="px-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-3">
          Workspace
        </div>
      )}
      
      <nav className="flex-1 px-3 space-y-1 overflow-hidden">
        {comingSoonItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-60",
                isCollapsed ? "justify-center px-0" : "justify-between"
              )}
              title={isCollapsed ? `${item.name} (Coming Soon)` : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </div>
              {!isCollapsed && <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-2 shrink-0">Soon</span>}
            </div>
          );
        })}
      </nav>

      <div className={cn("p-4 mt-auto border-t dark:border-slate-800 border-slate-800", isCollapsed ? "flex flex-col items-center gap-4 px-0" : "flex items-center justify-between")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white shrink-0">
            TU
          </div>
          {!isCollapsed && <div className="text-sm font-medium text-slate-200 truncate">Test User</div>}
        </div>
        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-slate-400 hover:text-white p-1 rounded-full transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
