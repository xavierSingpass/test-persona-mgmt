"use client";

import { useState } from "react";
import Link from "next/link";
import { mockAuditLogs } from "@/lib/mock-data";

const ACTION_COLORS: Record<string, string> = {
  create: "bg-blue-100 text-blue-700 border-blue-200",
  modify: "bg-orange-100 text-orange-700 border-orange-200",
  access: "bg-gray-100 text-gray-600 border-gray-200",
  decommission: "bg-red-100 text-red-700 border-red-200",
  approve: "bg-green-100 text-green-700 border-green-200",
  reject: "bg-red-100 text-red-700 border-red-200",
};

const SYSTEM_COLORS: Record<string, string> = {
  singpass: "bg-blue-50 text-blue-700",
  myinfo: "bg-teal-50 text-teal-700",
  corppass: "bg-purple-50 text-purple-700",
  mib: "bg-indigo-50 text-indigo-700",
};

export default function AuditPage() {
  const [filterAction, setFilterAction] = useState("all");
  const [filterSystem, setFilterSystem] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockAuditLogs.filter((log) => {
    const matchAction = filterAction === "all" || log.action === filterAction;
    const matchSystem = filterSystem === "all" || log.systems.includes(filterSystem as never);
    const matchSearch =
      !search ||
      log.personaNric.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSystem && matchSearch;
  });

  const actionCounts = mockAuditLogs.reduce(
    (acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Full audit trail of all persona lifecycle actions — immutable, tamper-evident records.
        </p>
      </div>

      {/* Action summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {["create", "modify", "access", "approve", "decommission", "reject"].map((action) => (
          <button
            key={action}
            onClick={() => setFilterAction(filterAction === action ? "all" : action)}
            className={`rounded-lg border p-3 text-center transition-colors ${
              filterAction === action
                ? ACTION_COLORS[action] + " ring-2 ring-offset-1 ring-current"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-lg font-bold">{actionCounts[action] || 0}</div>
            <div className="text-xs capitalize mt-0.5 text-gray-600">{action}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search NRIC, actor, or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="modify">Modify</option>
          <option value="access">Access</option>
          <option value="approve">Approve</option>
          <option value="decommission">Decommission</option>
          <option value="reject">Reject</option>
        </select>
        <select
          value={filterSystem}
          onChange={(e) => setFilterSystem(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Systems</option>
          <option value="singpass">Singpass</option>
          <option value="myinfo">Myinfo</option>
          <option value="corppass">Corppass</option>
          <option value="mib">MIB</option>
        </select>
        <span className="self-center text-xs text-gray-400">{filtered.length} results</span>
      </div>

      {/* Audit log timeline */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Activity Timeline</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            All actions logged with full provenance
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filtered.map((log) => (
              <div key={log.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5">
                      <span className={`inline-flex text-xs px-2 py-1 rounded-md font-semibold border ${ACTION_COLORS[log.action]}`}>
                        {log.action.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/personas/${log.personaId}`}
                          className="font-mono text-sm font-semibold text-blue-600 hover:underline"
                        >
                          {log.personaNric}
                        </Link>
                        <span className="text-xs text-gray-400">by</span>
                        <span className="text-xs font-medium text-gray-700">{log.actor}</span>
                        <span className="text-xs text-gray-400">({log.actorRole})</span>
                      </div>
                      <p className="text-sm text-gray-700">{log.details}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {log.systems.length > 0 && (
                          <div className="flex gap-1">
                            {log.systems.map((s) => (
                              <span
                                key={s}
                                className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${SYSTEM_COLORS[s] || "bg-gray-100 text-gray-600"}`}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-gray-400 font-mono">IP: {log.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-medium text-gray-700">
                      {new Date(log.timestamp).toLocaleDateString("en-SG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString("en-SG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">
            No audit records match your filters.
          </div>
        )}
      </div>

      {/* Compliance Notice */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-500 text-lg">🔒</span>
          <div>
            <p className="text-sm font-semibold text-blue-800">Compliance & Retention Policy</p>
            <p className="text-xs text-blue-700 mt-1">
              All audit records are immutable and retained for compliance. Records capture actor identity,
              timestamp, IP address, affected systems, and full action details. Quarterly audit reviews
              are conducted in line with programme governance. Export available upon authorised request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
