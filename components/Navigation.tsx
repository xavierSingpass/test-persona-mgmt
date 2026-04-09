"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/personas", label: "Personas" },
  { href: "/personas/create", label: "Create Persona" },
  { href: "/audit", label: "Audit Log" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#1a3a6b] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                SP
              </div>
              <div>
                <div className="text-sm font-bold leading-tight">Test Persona</div>
                <div className="text-xs text-blue-200 leading-tight">Management Portal</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-700 text-white"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-200">PX Ops</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
              PX
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
