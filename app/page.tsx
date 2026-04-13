"use client";

import { useState } from "react";
import MetricCard from "@/components/MetricCard";
import { StatusBadge, TypeBadge, SystemBadge } from "@/components/StatusBadge";
import { mockMetrics, mockPersonas, mockAuditLogs } from "@/lib/mock-data";
import Link from "next/link";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "product-metrics">("overview");

  const recentPersonas = mockPersonas.slice(0, 5);
  const recentLogs = mockAuditLogs.slice(0, 5);

  const typeDistribution = mockPersonas.reduce(
    (acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

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
              <div className="space-y-2">
                {Object.entries(typeDistribution).map(([type, count]) => {
                  const pct = Math.round((count / mockPersonas.length) * 100);
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
            </div>

            {/* Lifecycle Stage Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Lifecycle Stages</h2>
              <div className="grid grid-cols-2 gap-3">
                {(["creation", "modification", "usage", "decommission"] as const).map((stage) => {
                  const count = mockPersonas.filter((p) => p.lifecycleStage === stage).length;
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
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <span className="text-yellow-500 mt-0.5">⚠️</span>
                  <div>
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300">4 personas expiring within 7 days</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">Renewal approval required</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <span className="text-blue-500 mt-0.5">ℹ️</span>
                  <div>
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300">1 persona awaiting Myinfo injection</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">T9345678G — MOE provisioning</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <span className="text-green-500 mt-0.5">✅</span>
                  <div>
                    <p className="text-xs font-medium text-green-800 dark:text-green-300">Support tickets: 2 open</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Target: &lt;3/month — on track</p>
                  </div>
                </div>
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
                {recentPersonas.map((persona) => (
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
                {recentLogs.map((log) => {
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

          {/* Lifecycle Flow */}
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
        </>
      )}

      {/* Product Metrics Tab */}
      {activeTab === "product-metrics" && (
        <section>
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Programme Success Metrics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Key performance indicators tracking the health and efficiency of the test persona programme.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <MetricCard label="Total Personas" value={mockMetrics.totalPersonas} color="blue" icon="👤" />
            <MetricCard label="Active" value={mockMetrics.activePersonas} color="green" icon="✅" />
            <MetricCard label="Expiring Soon" value={mockMetrics.expiringPersonas} color="yellow" icon="⏳" />
            <MetricCard label="Provisioned Today" value={mockMetrics.provisioningToday} color="blue" icon="🔄" />
            <MetricCard label="Avg Provision Time" value={mockMetrics.avgProvisionTime} baseline="5–7 days" color="green" icon="⚡" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Teams Involved" value={mockMetrics.teamsInvolved} baseline="3–4 teams" target="1–2 teams" color="green" icon="🤝" />
            <MetricCard label="Manual Steps" value={mockMetrics.manualSteps} baseline="~15 steps" target="<5 steps" color="green" icon="🔧" />
            <MetricCard label="Error Rate" value={mockMetrics.errorRate} baseline="10–15%" target="<2%" color="green" icon="🛡️" />
            <MetricCard label="Self-Service Rate" value={mockMetrics.selfServiceRate} target="80–90%" color="purple" icon="🚀" />
          </div>
        </section>
      )}
    </div>
  );
}
