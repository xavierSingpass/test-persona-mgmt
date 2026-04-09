"use client";

import { useState, use } from "react";
import Link from "next/link";
import { StatusBadge, TypeBadge, SystemBadge } from "@/components/StatusBadge";
import { mockPersonas, mockAuditLogs } from "@/lib/mock-data";
import { PERSONA_TYPE_LABELS } from "@/lib/types";

export default function PersonaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const persona = mockPersonas.find((p) => p.id === id);
  const logs = mockAuditLogs.filter((l) => l.personaId === id);
  const [activeTab, setActiveTab] = useState<"overview" | "attributes" | "audit">("overview");
  const [showDecommission, setShowDecommission] = useState(false);

  if (!persona) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Persona not found</h2>
        <Link href="/personas" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
          ← Back to personas
        </Link>
      </div>
    );
  }

  const daysUntilExpiry = Math.ceil(
    (new Date(persona.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/personas" className="hover:text-blue-600 dark:hover:text-blue-400">Personas</Link>
        <span>›</span>
        <span className="font-mono">{persona.nric}</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#1a3a6b] rounded-full flex items-center justify-center text-white text-lg font-bold">
              {persona.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{persona.name}</h1>
              <p className="font-mono text-sm text-gray-500 dark:text-gray-400">{persona.nric}</p>
              <div className="flex items-center flex-wrap gap-2 mt-2">
                <TypeBadge type={persona.type} />
                <StatusBadge status={persona.status} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  persona.environment === "staging"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                }`}>
                  {persona.environment}
                </span>
                {persona.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Renew
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Edit
            </button>
            <button
              onClick={() => setShowDecommission(true)}
              className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Decommission
            </button>
          </div>
        </div>

        {/* Quick Info Row */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Owner</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{persona.owner}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Created</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
              {new Date(persona.createdAt).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Expires</div>
            <div className={`text-sm font-medium mt-0.5 ${daysUntilExpiry <= 14 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}>
              {new Date(persona.expiresAt).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}
              {daysUntilExpiry > 0 && (
                <span className={`ml-1 text-xs ${daysUntilExpiry <= 14 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"}`}>
                  ({daysUntilExpiry}d)
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Modification Rights</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 capitalize">{persona.modificationRights}</div>
          </div>
        </div>

        {/* Systems */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mr-1">Systems:</span>
          <SystemBadge name="Singpass" active={persona.systems.singpass} />
          <SystemBadge name="Myinfo" active={persona.systems.myinfo} />
          <SystemBadge name="Corppass" active={persona.systems.corppass} />
          <SystemBadge name="MIB" active={persona.systems.mib} />
        </div>

        {persona.entityName && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-teal-50 dark:bg-teal-900/20 rounded-lg px-3 py-2">
            <span>🏢</span>
            <span className="font-medium">{persona.entityName}</span>
            <span className="text-gray-400 dark:text-gray-500">UEN: {persona.entityUen}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(["overview", "attributes", "audit"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
              activeTab === tab
                ? "bg-[#1a3a6b] text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab}
            {tab === "audit" && logs.length > 0 && (
              <span className="ml-1.5 text-xs bg-white/20 px-1.5 rounded-full">{logs.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Lifecycle Status</h3>
            <div className="flex items-center gap-3">
              {(["creation", "modification", "usage", "decommission"] as const).map((stage, i, arr) => {
                const current = persona.lifecycleStage === stage;
                const past = arr.indexOf(persona.lifecycleStage) > i;
                return (
                  <div key={stage} className="flex items-center gap-2">
                    <div className={`flex flex-col items-center`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        current ? "bg-[#1a3a6b] text-white" : past ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                      }`}>
                        {past ? "✓" : i + 1}
                      </div>
                      <span className={`text-xs mt-1 capitalize ${current ? "text-[#1a3a6b] dark:text-blue-400 font-semibold" : "text-gray-400 dark:text-gray-500"}`}>
                        {stage}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`w-8 h-0.5 mb-4 ${past || current ? "bg-[#1a3a6b]" : "bg-gray-200 dark:bg-gray-700"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Persona Type Details</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Type: </span>
                  {PERSONA_TYPE_LABELS[persona.type]}
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Modification Rights: </span>
                  <span className="capitalize">{persona.modificationRights}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Created By: </span>
                  {persona.createdBy}
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Last Modified: </span>
                  {new Date(persona.lastModified).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Guardrail Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-600 dark:text-gray-400">Synthetic PII — no real citizen data</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-600 dark:text-gray-400">Isolated staging environment</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-600 dark:text-gray-400">Audit logging active</span>
                </div>
                <div className={`flex items-center gap-2 text-xs`}>
                  <span className={daysUntilExpiry <= 14 ? "text-yellow-500" : "text-green-500"}>
                    {daysUntilExpiry <= 14 ? "⚠️" : "✅"}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Expiry: {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : "Expired"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-600 dark:text-gray-400">Rate limiting enforced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attributes Tab */}
      {activeTab === "attributes" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Myinfo Attributes</h3>
            {persona.modificationRights !== "none" && persona.modificationRights !== "automated" && (
              <button className="text-xs text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                Edit Attributes
              </button>
            )}
            {persona.modificationRights === "none" && (
              <span className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-lg">
                Read-only — internal teams only
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(persona.attributes).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{String(value)}</span>
              </div>
            ))}
          </div>
          {Object.keys(persona.attributes).length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              No Myinfo attributes configured. Enable Myinfo to inject data.
            </p>
          )}
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Audit Trail</h3>
          </div>
          {logs.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {logs.map((log) => {
                const actionColors: Record<string, string> = {
                  create: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
                  modify: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
                  access: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
                  decommission: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
                  approve: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
                  reject: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
                };
                return (
                  <div key={log.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${actionColors[log.action]}`}>
                          {log.action.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{log.actor}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">({log.actorRole})</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(log.timestamp).toLocaleString("en-SG")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{log.details}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {log.systems.length > 0 && (
                        <div className="flex gap-1">
                          {log.systems.map((s) => (
                            <span key={s} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">IP: {log.ipAddress}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-12">No audit records for this persona.</p>
          )}
        </div>
      )}

      {/* Decommission Modal */}
      {showDecommission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">Decommission Persona</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This will deactivate the Singpass account, archive Myinfo data, remove Corppass roles, and
              retain audit logs for compliance. This action cannot be undone.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                Persona: {persona.name} ({persona.nric})
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDecommission(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDecommission(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Confirm Decommission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
