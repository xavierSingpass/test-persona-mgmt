"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useProfile, PROFILES } from "@/lib/profile-context";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/personas", label: "Personas" },
  { href: "/personas/create", label: "Create Persona" },
  { href: "/audit", label: "Audit Log" },
  { href: "/support", label: "Support" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { profile, config, setProfile } = useProfile();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  return (
    <nav className="bg-[#1a3a6b] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
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

          {/* Nav links */}
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

          {/* Profile switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <div className={`w-8 h-8 ${config.avatarColor} rounded-full flex items-center justify-center text-sm font-semibold text-white`}>
                {config.initials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-tight">{config.label}</div>
                <div className="text-xs text-blue-200 leading-tight">{config.role}</div>
              </div>
              <span className="text-blue-300 text-xs ml-0.5">▾</span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Switch Profile
                </div>
                {Object.values(PROFILES).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setProfile(p.id); setProfileOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      profile === p.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 ${p.avatarColor} rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0`}>
                      {p.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.agencyName}</div>
                    </div>
                    {profile === p.id && (
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
