"use client";

import { useState } from "react";
import MetricCard from "@/components/MetricCard";
import { StatusBadge, TypeBadge, SystemBadge } from "@/components/StatusBadge";
import { mockMetrics, mockPersonas, mockAuditLogs } from "@/lib/mock-data";
import { useProfile } from "@/lib/profile-context";
import Link from "next/link";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "product-metrics">("overview");
  const { config } = useProfile();

  // Filter all data based on current profile
  const visiblePersonas = config.ownerFilter
    ? mockPersonas.filter((p) => p.owner === config.ownerFilter)
    : mockPersonas;
  const visiblePersonaIds = new Set(visiblePersonas.map((p) => p.id));
  const visibleLogs = config.ownerFilter
    ? mockAuditLogs.filter((log) => visiblePersonaIds.has(log.personaId))
    : mockAuditLogs;

  const recentPersonas = visiblePersonas.slice(0, 5);
  const recentLogs = visibleLogs.slice(0, 5);

  const typeDistribution = visiblePersonas.reduce(
    (acc, p) => { acc[p.type] = (acc[p.type] || 0) + 1; return acc; },
    {} as Record<string, number>
  );

  // Metrics: use mock global for Singpass, compute from filtered for agencies
  const metrics = config.ownerFilter
    ? {
        totalPersonas: visiblePersonas.length,
        activePersonas: visiblePersonas.filter((p) => p.status === "active").length,
        expiringPersonas: visiblePersonas.filter((p) => p.status === "expiring").length,
        provisioningToday: visiblePersonas.filter((p) => p.status === "provisioning").length,
        avgProvisionTime: "4.2 hrs",
        teamsInvolved: 1,
        manualSteps: 4,
        errorRate: "0%",
        selfServiceRate: "100%",
        supportTickets: 0,
      }
    : mockMetrics;

  const expiringCount = visiblePersonas.filter((p) => p.status === "expiring").length;
  const provisioningCount = visiblePersonas.filter((p) => p.status === "provisioning").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orchestration Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Centralised test persona lifecycle management — Singpass · Myinfo · Corppass
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              All Systems Operational
            </span>
            <Link
              href="/personas/create"
              className="px-4 py-2 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
            >
              + New Persona
            </Link>
          </div>
        </div>

        {/* Agency profile banner */}
        {config.ownerFilter && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-xs text-orange-700 dark:text-orange-300">
            <span>🏢</span>
            <span>
              Viewing as <strong>{config.label}</strong> — {config.agencyName}
            </span>
            <span className="text-orange-400 dark:text-orange-600">· Showing your team&apos;s personas only</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {(["overview", "product-metrics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px ${
              activeTab === tab
                ? "bg-white dark:bg-gray-900 border border-b-white dark:border-gray-700 dark:border-b-gray-900 text-[#1a3a6b] dark:text-blue-400 border-gray-200"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab === "overview" ? "Overview" : "Product Metrics"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Persona Type Distribution */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Persona Types</h2>
              {Object.keys(typeDistribution).length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No personas</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(typeDistribution).map(([type, count]) => {
                    const pct = Math.round((count / visiblePersonas.length) * 100);
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span className="capitalize">{type.replace(/_/g, " ")}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                          <div className="bg-[#1a3a6b] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lifecycle Stage Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Lifecycle Stages</h2>
              <div className="grid grid-cols-2 gap-3">
                {(["creation", "modification", "usage", "decommission"] as const).map((stage) => {
                  const count = visiblePersonas.filter((p) => p.lifecycleStage === stage).length;
                  const stageColors: Record<string, string> = {
                    creation: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
                    modification: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
                    usage: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
                    decommission: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
                  };
                  return (
                    <div key={stage} className={`rounded-lg border p-3 ${stageColors[stage]}`}>
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-xs capitalize">{stage}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guardrails & Alerts */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Guardrails & Alerts</h2>
              <div className="space-y-3">
                {expiringCount > 0 && (
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <span className="text-yellow-500 mt-0.5">⚠️</span>
                    <div>
                      <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300">
                        {expiringCount} persona{expiringCount > 1 ? "s" : ""} expiring within 7 days
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">Renewal approval required</p>
                    </div>
                  </div>
                )}
                {provisioningCount > 0 && (
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                    <span className="text-blue-500 mt-0.5">ℹ️</span>
                    <div>
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                        {provisioningCount} persona{provisioningCount > 1 ? "s" : ""} awaiting provisioning
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Injection in progress</p>
                    </div>
                  </div>
                )}
                {!config.ownerFilter && (
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <div>
                      <p className="text-xs font-medium text-green-800 dark:text-green-300">Support tickets: {mockMetrics.supportTickets} open</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Target: &lt;3/month — on track</p>
                    </div>
                  </div>
                )}
                {expiringCount === 0 && provisioningCount === 0 && config.ownerFilter && (
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <div>
                      <p className="text-xs font-medium text-green-800 dark:text-green-300">No active alerts</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">All your personas are healthy</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Personas */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Personas</h2>
                <Link href="/personas" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all →</Link>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentPersonas.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">No personas found.</p>
                ) : recentPersonas.map((persona) => (
                  <Link key={persona.id} href={`/personas/${persona.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{persona.nric}</span>
                        <StatusBadge status={persona.status} />
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{persona.name}</p>
                      <div className="flex gap-1 mt-1">
                        <SystemBadge name="SP" active={persona.systems.singpass} />
                        <SystemBadge name="MI" active={persona.systems.myinfo} />
                        <SystemBadge name="CP" active={persona.systems.corppass} />
                      </div>
                    </div>
                    <TypeBadge type={persona.type} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Audit Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Audit Activity</h2>
                <Link href="/audit" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all →</Link>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentLogs.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">No audit activity.</p>
                ) : recentLogs.map((log) => {
                  const actionColors: Record<string, string> = {
                    create: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
                    modify: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
                    access: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
                    decommission: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
                    approve: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
                    reject: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
                  };
                  return (
                    <div key={log.id} className="px-5 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${actionColors[log.action]}`}>
                            {log.action.toUpperCase()}
                          </span>
                          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{log.personaNric}</span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(log.timestamp).toLocaleDateString("en-SG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{log.details}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{log.actor} · {log.actorRole}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lifecycle Flow — only shown for full Singpass view */}
          {!config.ownerFilter && (
            <section className="mt-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Unified Persona Lifecycle</h2>
              <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
                {[
                  { stage: "Creation", desc: "RP request → Validation → Singpass account → Myinfo injection → Corppass role", color: "bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300" },
                  { stage: "Modification", desc: "Update request → Permission check → System sync → Audit log", color: "bg-orange-50 border-orange-300 text-orange-800 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300" },
                  { stage: "Usage", desc: "Integration testing · Monitoring · Security testing · Corppass flows", color: "bg-green-50 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300" },
                  { stage: "Decommission", desc: "Expiry trigger → Account deactivation → Data archive → Audit retained", color: "bg-gray-50 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300" },
                ].map((item, i, arr) => (
                  <div key={i} className="flex items-center gap-2 flex-1 min-w-[150px]">
                    <div className={`flex-1 rounded-lg border p-3 h-full ${item.color}`}>
                      <div className="font-semibold text-sm">{item.stage}</div>
                      <div className="text-xs mt-1 opacity-80">{item.desc}</div>
                    </div>
                    {i < arr.length - 1 && <span className="text-gray-300 dark:text-gray-600 text-xl flex-shrink-0">→</span>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Product Metrics Tab */}
      {activeTab === "product-metrics" && (
        <section>
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {config.ownerFilter ? `${config.agencyName} — Persona Metrics` : "Programme Success Metrics"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {config.ownerFilter
                ? `Key statistics for your team's test personas.`
                : "Key performance indicators tracking the health and efficiency of the test persona programme."}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <MetricCard label="Total Personas" value={metrics.totalPersonas} color="blue" icon="👤" />
            <MetricCard label="Active" value={metrics.activePersonas} color="green" icon="✅" />
            <MetricCard label="Expiring Soon" value={metrics.expiringPersonas} color="yellow" icon="⏳" />
            <MetricCard label="Provisioned Today" value={metrics.provisioningToday} color="blue" icon="🔄" />
            <MetricCard label="Avg Provision Time" value={metrics.avgProvisionTime} baseline="5–7 days" color="green" icon="⚡" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Teams Involved" value={metrics.teamsInvolved} baseline="3–4 teams" target="1–2 teams" color="green" icon="🤝" />
            <MetricCard label="Manual Steps" value={metrics.manualSteps} baseline="~15 steps" target="<5 steps" color="green" icon="🔧" />
            <MetricCard label="Error Rate" value={metrics.errorRate} baseline="10–15%" target="<2%" color="green" icon="🛡️" />
            <MetricCard label="Self-Service Rate" value={metrics.selfServiceRate} target="80–90%" color="purple" icon="🚀" />
          </div>
        </section>
      )}
    </div>
  );
}
