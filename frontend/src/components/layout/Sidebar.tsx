"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Meetings", href: "/meetings", icon: LayoutGrid },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="w-60 bg-[#1a1a2e] text-slate-300 flex flex-col h-full shrink-0">
      <div className="p-4 flex items-center gap-2 text-white font-bold text-xl mb-4">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        Fireflies Clone
      </div>

      <nav className="flex-1 px-3 space-y-1">
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
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white">
            TU
          </div>
          <div className="text-sm font-medium text-slate-200">Test User</div>
        </div>
      </div>
    </div>
  );
}
