"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge, TypeBadge, SystemBadge } from "@/components/StatusBadge";
import { mockPersonas } from "@/lib/mock-data";
import { PersonaType, PersonaStatus, PERSONA_TYPE_LABELS } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";

export default function PersonasPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<PersonaType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<PersonaStatus | "all">("all");
  const { config } = useProfile();

  // First apply profile filter, then user-selected filters
  const profilePersonas = config.ownerFilter
    ? mockPersonas.filter((p) => p.owner === config.ownerFilter)
    : mockPersonas;

  const filtered = profilePersonas.filter((p) => {
    const matchSearch =
      !search ||
      p.nric.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || p.type === filterType;
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Test Personas</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} of {profilePersonas.length} persona{profilePersonas.length !== 1 ? "s" : ""}
            {config.ownerFilter && (
              <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                {config.agencyName}
              </span>
            )}
          </p>
        </div>
        <Link
          href="/personas/create"
          className="px-4 py-2 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
        >
          + New Persona
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search NRIC, name, or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as PersonaType | "all")}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Types</option>
          {Object.entries(PERSONA_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PersonaStatus | "all")}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring</option>
          <option value="provisioning">Provisioning</option>
          <option value="expired">Expired</option>
          <option value="decommissioned">Decommissioned</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Persona</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Systems</th>
                {!config.ownerFilter && (
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Owner</th>
                )}
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Expires</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Environment</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((persona) => (
                <tr key={persona.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-gray-500 dark:text-gray-400">{persona.nric}</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{persona.name}</div>
                    {persona.entityName && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{persona.entityName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3"><TypeBadge type={persona.type} /></td>
                  <td className="px-4 py-3"><StatusBadge status={persona.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <SystemBadge name="SP" active={persona.systems.singpass} />
                      <SystemBadge name="MI" active={persona.systems.myinfo} />
                      <SystemBadge name="CP" active={persona.systems.corppass} />
                      <SystemBadge name="MIB" active={persona.systems.mib} />
                    </div>
                  </td>
                  {!config.ownerFilter && (
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{persona.owner}</td>
                  )}
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                    {new Date(persona.expiresAt).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      persona.environment === "staging"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                    }`}>
                      {persona.environment}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/personas/${persona.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={config.ownerFilter ? 7 : 8} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                    No personas match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Persona Type Legend — only for Singpass view since it covers all types */}
      {!config.ownerFilter && (
        <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Persona Type Reference
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { type: "partner_integration", ownership: "Partner / PX", modification: "RP limited fields", involvement: "High" },
              { type: "synthetic_reliability", ownership: "Singpass / Automation", modification: "Automated only", involvement: "None" },
              { type: "synthetic_monitoring", ownership: "Agencies / Singpass", modification: "No direct modification", involvement: "Minimal" },
              { type: "security_testing", ownership: "Singpass / CSG", modification: "Internal only", involvement: "None" },
              { type: "partner_configured", ownership: "Partner / Orchestration", modification: "RP controlled (guardrailed)", involvement: "High" },
              { type: "business_entity", ownership: "Singpass / Corppass / PX", modification: "Internal teams only", involvement: "Minimal" },
            ].map(({ type, ownership, modification, involvement }) => (
              <div key={type} className="flex flex-col gap-1.5 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <TypeBadge type={type as PersonaType} />
                <div className="text-xs text-gray-500 dark:text-gray-400"><span className="font-medium">Owner:</span> {ownership}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400"><span className="font-medium">Modification:</span> {modification}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400"><span className="font-medium">RP Involvement:</span> {involvement}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
