export type PersonaType =
  | "partner_integration"
  | "synthetic_reliability"
  | "synthetic_monitoring"
  | "security_testing"
  | "partner_configured"
  | "business_entity";

export type PersonaStatus = "active" | "expiring" | "expired" | "decommissioned" | "provisioning";

export type LifecycleStage = "creation" | "modification" | "usage" | "decommission";

export type SystemComponent = "singpass" | "myinfo" | "corppass" | "mib";

export interface PersonaSystemStatus {
  singpass: boolean;
  myinfo: boolean;
  corppass: boolean;
  mib: boolean;
}

export interface Persona {
  id: string;
  nric: string;
  name: string;
  type: PersonaType;
  status: PersonaStatus;
  owner: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  lastModified: string;
  lifecycleStage: LifecycleStage;
  systems: PersonaSystemStatus;
  environment: "staging" | "production-like";
  entityUen?: string;
  entityName?: string;
  tags: string[];
  attributes: Record<string, string | number | boolean>;
  modificationRights: "full" | "limited" | "none" | "automated";
}

export interface AuditLog {
  id: string;
  personaId: string;
  personaNric: string;
  action: "create" | "modify" | "access" | "decommission" | "approve" | "reject";
  actor: string;
  actorRole: string;
  timestamp: string;
  details: string;
  systems: SystemComponent[];
  ipAddress: string;
}

export interface DashboardMetrics {
  totalPersonas: number;
  activePersonas: number;
  expiringPersonas: number;
  provisioningToday: number;
  avgProvisionTime: string;
  teamsInvolved: number;
  manualSteps: number;
  errorRate: string;
  selfServiceRate: string;
  supportTickets: number;
}

export const PERSONA_TYPE_LABELS: Record<PersonaType, string> = {
  partner_integration: "Partner Integration",
  synthetic_reliability: "Synthetic – Reliability",
  synthetic_monitoring: "Synthetic – Monitoring",
  security_testing: "Security Testing",
  partner_configured: "Partner-Configured",
  business_entity: "Business / Entity",
};

export const PERSONA_TYPE_COLORS: Record<PersonaType, string> = {
  partner_integration: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  synthetic_reliability: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  synthetic_monitoring: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  security_testing: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  partner_configured: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  business_entity: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
};

export const STATUS_COLORS: Record<PersonaStatus, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  expiring: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  expired: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  decommissioned: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  provisioning: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};
