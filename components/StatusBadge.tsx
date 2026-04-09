import { PersonaStatus, PersonaType, STATUS_COLORS, PERSONA_TYPE_COLORS, PERSONA_TYPE_LABELS } from "@/lib/types";

export function StatusBadge({ status }: { status: PersonaStatus }) {
  const colors = STATUS_COLORS[status];
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />}
      {status === "expiring" && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5" />}
      {status === "provisioning" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />}
      {label}
    </span>
  );
}

export function TypeBadge({ type }: { type: PersonaType }) {
  const colors = PERSONA_TYPE_COLORS[type];
  const label = PERSONA_TYPE_LABELS[type];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {label}
    </span>
  );
}

export function SystemBadge({ name, active }: { name: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        active
          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
          : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
      {name}
    </span>
  );
}
