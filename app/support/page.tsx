"use client";

import { useState } from "react";
import { useProfile } from "@/lib/profile-context";

const FAQS = [
  {
    q: "What is a test persona and how is it different from a real user?",
    a: "A test persona is a synthetic identity created specifically for testing government digital services. Unlike real users, test personas are fully controlled, have predictable data, and do not affect production systems. They are provisioned with specific attributes to simulate different scenarios (e.g. CPF balances, employment records, business entities).",
  },
  {
    q: "How do I request a new test persona for my agency?",
    a: "Submit a request via the 'Create Persona' form, selecting the appropriate type and systems required. Partner Integration personas require approval from Singpass PX Ops before activation. Requests are typically reviewed within 2 business days. For urgent needs, escalate via the contact section below.",
  },
  {
    q: "What are the differences between Staging and UAT environments?",
    a: "Staging mirrors production infrastructure and is used for final pre-launch validation. UAT (User Acceptance Testing) is a more permissive environment used during feature development and integration testing. Personas are environment-specific — a Staging persona cannot be used in UAT and vice versa.",
  },
  {
    q: "Why is my persona showing 'Expiring' status?",
    a: "Personas expire after a fixed validity period (typically 6–12 months) as part of the governance lifecycle. An 'Expiring' status means the persona will expire within 30 days. Submit a renewal request by contacting the Singpass PX Ops team, who will extend the validity after verification.",
  },
  {
    q: "Can I modify the Myinfo attributes on a persona?",
    a: "Modification rights depend on persona type. Partner Integration personas allow RPs to modify a limited set of attributes. Synthetic and Security Testing personas can only be modified by internal Singpass teams. All modifications are logged in the Audit Trail with full provenance.",
  },
  {
    q: "What happens when a persona is decommissioned?",
    a: "Decommissioned personas are disabled across all provisioned systems (Singpass, Myinfo, Corppass, MIB) and cannot be used for authentication or API calls. The persona record is retained for audit and compliance purposes but cannot be reactivated. A decommission action is irreversible.",
  },
  {
    q: "How do I access the Corppass test environment for a business entity persona?",
    a: "Business Entity personas include a UEN and are provisioned with Corppass access when the 'CP' system is enabled. Ensure your integration is pointed at the Corppass staging endpoint. If you need additional roles or permissions configured on the entity, raise a request with the Corppass team via the escalation path.",
  },
  {
    q: "Where can I find the Myinfo attribute reference for building my integration?",
    a: "The full Myinfo attribute schema is documented in the 'Myinfo Attributes' documentation card below. It covers field names, data types, enumerations, and sample values for all supported scopes. For integration-specific questions, refer to the API Guide or raise a support ticket.",
  },
];

const DOCS = [
  {
    icon: "🚀",
    title: "Getting Started",
    description: "Onboarding guide for new agency teams — from access provisioning to your first test run.",
    tags: ["Onboarding", "Access"],
  },
  {
    icon: "🧩",
    title: "Persona Types",
    description: "Detailed breakdown of all 6 persona types, ownership model, modification rights, and use cases.",
    tags: ["Reference"],
  },
  {
    icon: "📋",
    title: "Myinfo Attributes",
    description: "Full attribute schema with data types, enumerations, sample values, and consent scopes.",
    tags: ["Myinfo", "API"],
  },
  {
    icon: "🏢",
    title: "Corppass Integration",
    description: "Step-by-step guide to testing Corppass login flows with business entity test personas.",
    tags: ["Corppass", "Integration"],
  },
  {
    icon: "⚙️",
    title: "API Guide",
    description: "REST API reference for programmatic persona management, including auth, rate limits, and examples.",
    tags: ["API", "Developer"],
  },
  {
    icon: "🔒",
    title: "Audit & Compliance",
    description: "Policy overview for audit log retention, compliance requirements, and authorised export procedures.",
    tags: ["Compliance", "Governance"],
  },
  {
    icon: "🌐",
    title: "Environment Guide",
    description: "Endpoint configurations, API base URLs, and certificates for Staging and UAT environments.",
    tags: ["Staging", "UAT"],
  },
  {
    icon: "📞",
    title: "Escalation Paths",
    description: "Who to contact for urgent issues, P1 incidents, and cross-agency coordination.",
    tags: ["Support", "Escalation"],
  },
];

const CONTACTS = [
  {
    team: "Singpass PX Ops",
    email: "px-ops@singpass.gov.sg",
    scope: "Persona provisioning, approvals, decommissioning",
    hours: "Mon–Fri, 9am–6pm",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    team: "Myinfo Integration",
    email: "myinfo-support@singpass.gov.sg",
    scope: "Attribute configuration, consent scopes, API issues",
    hours: "Mon–Fri, 9am–6pm",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  },
  {
    team: "Corppass Team",
    email: "corppass@gobusiness.gov.sg",
    scope: "Business entity personas, Corppass roles, UEN issues",
    hours: "Mon–Fri, 8:30am–5pm",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  {
    team: "P1 Incident Hotline",
    email: "+65 6335 3533",
    scope: "Production-blocking issues only",
    hours: "24/7",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { config } = useProfile();

  const filteredFaqs = FAQS.filter(
    (f) =>
      !search ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Support Centre</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {config.ownerFilter
            ? `Resources and help for ${config.agencyName} integration teams.`
            : "Resources, documentation, and contact information for Test Persona Management Portal."}
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search FAQs and documentation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <span className="text-lg">💬</span> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{faq.q}</span>
                  <span className={`text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 pt-0 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
              No FAQs match your search.
            </div>
          )}
        </div>
      </section>

      {/* Documentation */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <span className="text-lg">📚</span> Documentation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DOCS.filter(
            (d) =>
              !search ||
              d.title.toLowerCase().includes(search.toLowerCase()) ||
              d.description.toLowerCase().includes(search.toLowerCase()) ||
              d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
          ).map((doc) => (
            <div
              key={doc.title}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="text-2xl mb-2">{doc.icon}</div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {doc.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{doc.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          Documentation is available on the internal confluence. Request access via your agency lead if you cannot view linked articles.
        </p>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <span className="text-lg">📞</span> Contact &amp; Escalation
        </h2>
        {config.ownerFilter && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-xs text-orange-700 dark:text-orange-300">
            <span>🏢</span>
            <span>
              As <strong>{config.agencyName}</strong>, your primary point of contact is the Singpass PX Ops team for persona-related requests.
            </span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONTACTS.map((c) => (
            <div
              key={c.team}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{c.team}</span>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.email}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.scope}</p>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                <span>🕐</span> {c.hours}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-xs text-gray-500 dark:text-gray-400">
        <strong className="text-gray-700 dark:text-gray-300">Note:</strong> This portal is for authorised testing personnel only. Do not use test personas in production environments. All access and usage is subject to the Singpass Test Persona Programme governance policy.
      </div>
    </div>
  );
}
