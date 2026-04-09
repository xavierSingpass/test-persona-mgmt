import MetricCard from "@/components/MetricCard";
import { StatusBadge, TypeBadge, SystemBadge } from "@/components/StatusBadge";
import { mockMetrics, mockPersonas, mockAuditLogs } from "@/lib/mock-data";
import Link from "next/link";

export default function DashboardPage() {
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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orchestration Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Centralised test persona lifecycle management — Singpass · Myinfo · Corppass
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
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

      {/* Metrics Grid */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Programme Success Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard label="Total Personas" value={mockMetrics.totalPersonas} color="blue" icon="👤" />
          <MetricCard label="Active" value={mockMetrics.activePersonas} color="green" icon="✅" />
          <MetricCard label="Expiring Soon" value={mockMetrics.expiringPersonas} color="yellow" icon="⏳" />
          <MetricCard label="Provisioned Today" value={mockMetrics.provisioningToday} color="blue" icon="🔄" />
          <MetricCard label="Avg Provision Time" value={mockMetrics.avgProvisionTime} baseline="5–7 days" color="green" icon="⚡" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <MetricCard label="Teams Involved" value={mockMetrics.teamsInvolved} baseline="3–4 teams" target="1–2 teams" color="green" icon="🤝" />
          <MetricCard label="Manual Steps" value={mockMetrics.manualSteps} baseline="~15 steps" target="<5 steps" color="green" icon="🔧" />
          <MetricCard label="Error Rate" value={mockMetrics.errorRate} baseline="10–15%" target="<2%" color="green" icon="🛡️" />
          <MetricCard label="Self-Service Rate" value={mockMetrics.selfServiceRate} target="80–90%" color="purple" icon="🚀" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Persona Type Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Persona Types</h2>
          <div className="space-y-2">
            {Object.entries(typeDistribution).map(([type, count]) => {
              const pct = Math.round((count / mockPersonas.length) * 100);
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="capitalize">{type.replace(/_/g, " ")}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-[#1a3a6b] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lifecycle Stage Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Lifecycle Stages</h2>
          <div className="grid grid-cols-2 gap-3">
            {(["creation", "modification", "usage", "decommission"] as const).map((stage) => {
              const count = mockPersonas.filter((p) => p.lifecycleStage === stage).length;
              const stageColors: Record<string, string> = {
                creation: "bg-blue-50 text-blue-700 border-blue-200",
                modification: "bg-orange-50 text-orange-700 border-orange-200",
                usage: "bg-green-50 text-green-700 border-green-200",
                decommission: "bg-gray-50 text-gray-600 border-gray-200",
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
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Guardrails & Alerts</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-yellow-50 border border-yellow-200">
              <span className="text-yellow-500 mt-0.5">⚠️</span>
              <div>
                <p className="text-xs font-medium text-yellow-800">4 personas expiring within 7 days</p>
                <p className="text-xs text-yellow-600 mt-0.5">Renewal approval required</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-blue-500 mt-0.5">ℹ️</span>
              <div>
                <p className="text-xs font-medium text-blue-800">1 persona awaiting Myinfo injection</p>
                <p className="text-xs text-blue-600 mt-0.5">T9345678G — MOE provisioning</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-green-50 border border-green-200">
              <span className="text-green-500 mt-0.5">✅</span>
              <div>
                <p className="text-xs font-medium text-green-800">Support tickets: 2 open</p>
                <p className="text-xs text-green-600 mt-0.5">Target: &lt;3/month — on track</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Personas */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-700">Recent Personas</h2>
            <Link href="/personas" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPersonas.map((persona) => (
              <Link key={persona.id} href={`/personas/${persona.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">{persona.nric}</span>
                    <StatusBadge status={persona.status} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{persona.name}</p>
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-700">Recent Audit Activity</h2>
            <Link href="/audit" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentLogs.map((log) => {
              const actionColors: Record<string, string> = {
                create: "bg-blue-100 text-blue-700",
                modify: "bg-orange-100 text-orange-700",
                access: "bg-gray-100 text-gray-600",
                decommission: "bg-red-100 text-red-700",
                approve: "bg-green-100 text-green-700",
                reject: "bg-red-100 text-red-700",
              };
              return (
                <div key={log.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${actionColors[log.action]}`}>
                        {log.action.toUpperCase()}
                      </span>
                      <span className="font-mono text-xs text-gray-500">{log.personaNric}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleDateString("en-SG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{log.details}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{log.actor} · {log.actorRole}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lifecycle Flow */}
      <section className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-5">Unified Persona Lifecycle</h2>
        <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
          {[
            { stage: "Creation", desc: "RP request → Validation → Singpass account → Myinfo injection → Corppass role", color: "bg-blue-50 border-blue-300 text-blue-800" },
            { stage: "Modification", desc: "Update request → Permission check → System sync → Audit log", color: "bg-orange-50 border-orange-300 text-orange-800" },
            { stage: "Usage", desc: "Integration testing · Monitoring · Security testing · Corppass flows", color: "bg-green-50 border-green-300 text-green-800" },
            { stage: "Decommission", desc: "Expiry trigger → Account deactivation → Data archive → Audit retained", color: "bg-gray-50 border-gray-300 text-gray-700" },
          ].map((item, i, arr) => (
            <div key={i} className="flex items-center gap-2 flex-1 min-w-[150px]">
              <div className={`flex-1 rounded-lg border p-3 h-full ${item.color}`}>
                <div className="font-semibold text-sm">{item.stage}</div>
                <div className="text-xs mt-1 opacity-80">{item.desc}</div>
              </div>
              {i < arr.length - 1 && <span className="text-gray-300 text-xl flex-shrink-0">→</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
