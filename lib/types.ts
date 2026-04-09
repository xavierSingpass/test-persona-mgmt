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
  partner_integration: "bg-blue-100 text-blue-800",
  synthetic_reliability: "bg-purple-100 text-purple-800",
  synthetic_monitoring: "bg-indigo-100 text-indigo-800",
  security_testing: "bg-red-100 text-red-800",
  partner_configured: "bg-orange-100 text-orange-800",
  business_entity: "bg-teal-100 text-teal-800",
};

export const STATUS_COLORS: Record<PersonaStatus, string> = {
  active: "bg-green-100 text-green-800",
  expiring: "bg-yellow-100 text-yellow-800",
  expired: "bg-gray-100 text-gray-600",
  decommissioned: "bg-red-100 text-red-700",
  provisioning: "bg-blue-100 text-blue-700",
};
