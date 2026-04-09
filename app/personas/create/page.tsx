"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PersonaType, PERSONA_TYPE_LABELS } from "@/lib/types";

const steps = ["Persona Type", "Identity Details", "System Configuration", "Review & Submit"];

interface FormData {
  type: PersonaType | "";
  name: string;
  nric: string;
  sex: string;
  race: string;
  nationality: string;
  dob: string;
  email: string;
  mobile: string;
  owner: string;
  environment: string;
  tags: string;
  withSingpass: boolean;
  withMyinfo: boolean;
  withCorppass: boolean;
  withMib: boolean;
  entityUen: string;
  entityName: string;
  notes: string;
}

const initialForm: FormData = {
  type: "",
  name: "",
  nric: "",
  sex: "",
  race: "",
  nationality: "Singapore Citizen",
  dob: "",
  email: "",
  mobile: "",
  owner: "",
  environment: "staging",
  tags: "",
  withSingpass: true,
  withMyinfo: false,
  withCorppass: false,
  withMib: false,
  entityUen: "",
  entityName: "",
  notes: "",
};

const typeDescriptions: Record<PersonaType, { desc: string; note: string }> = {
  partner_integration: {
    desc: "For RPs to validate end-to-end integration flows with Singpass, Myinfo, and Corppass.",
    note: "RPs can modify whitelisted attributes. Audit logged.",
  },
  synthetic_reliability: {
    desc: "Maintained for automated or large-scale testing — performance, resilience, regression.",
    note: "Automated pipeline updates only. No RP involvement.",
  },
  synthetic_monitoring: {
    desc: "Used by agencies to monitor and validate citizen-facing service availability.",
    note: "Agency can run tests. No direct modification.",
  },
  security_testing: {
    desc: "Provisioned for VDP, GBBP, and controlled security scenario testing.",
    note: "Access strictly controlled. Singpass / CSG only.",
  },
  partner_configured: {
    desc: "Self-service personas for RPs to configure custom test cases and edge-case attributes.",
    note: "Guardrails enforce allowed changes. Audit logged.",
  },
  business_entity: {
    desc: "Mimic corporate/entity data from ACRA for Corppass and Myinfo business flow testing.",
    note: "Internal teams only. Synthetic entity data. Audit logged.",
  },
};

export default function CreatePersonaPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof FormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canProceed = () => {
    if (step === 0) return !!form.type;
    if (step === 1) return !!form.name && !!form.nric && !!form.owner;
    if (step === 2) return form.withSingpass;
    return true;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => router.push("/personas"), 2000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ✅
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Persona Provisioning Initiated</h2>
        <p className="text-gray-500 text-sm mb-4">
          Your request has been submitted to the orchestration engine. Singpass account creation,
          Myinfo injection, and Corppass assignment (if applicable) are being processed.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-blue-600">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Redirecting to persona list...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Test Persona</h1>
        <p className="mt-1 text-sm text-gray-500">
          Provision a new persona across Singpass, Myinfo, and Corppass from a single form.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  i < step
                    ? "bg-green-500 text-white"
                    : i === step
                    ? "bg-[#1a3a6b] text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs mt-1 font-medium whitespace-nowrap ${
                  i === step ? "text-[#1a3a6b]" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Step 0: Persona Type */}
        {step === 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Select Persona Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(PERSONA_TYPE_LABELS) as PersonaType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => update("type", type)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    form.type === type
                      ? "border-[#1a3a6b] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{PERSONA_TYPE_LABELS[type]}</div>
                  <div className="text-xs text-gray-500 mt-1">{typeDescriptions[type].desc}</div>
                  <div className={`text-xs mt-2 italic ${form.type === type ? "text-blue-700" : "text-gray-400"}`}>
                    {typeDescriptions[type].note}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Identity Details */}
        {step === 1 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Identity Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Tan Wei Ming"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">NRIC / FIN *</label>
                <input
                  type="text"
                  value={form.nric}
                  onChange={(e) => update("nric", e.target.value.toUpperCase())}
                  placeholder="e.g. S9812345A"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sex</label>
                <select
                  value={form.sex}
                  onChange={(e) => update("sex", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select</option>
                  <option>M</option>
                  <option>F</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Race</label>
                <select
                  value={form.race}
                  onChange={(e) => update("race", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select</option>
                  <option>Chinese</option>
                  <option>Malay</option>
                  <option>Indian</option>
                  <option>Eurasian</option>
                  <option>Others</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nationality</label>
                <select
                  value={form.nationality}
                  onChange={(e) => update("nationality", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option>Singapore Citizen</option>
                  <option>Singapore PR</option>
                  <option>Foreign National</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => update("dob", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Test Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="persona.test@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mobile (test)</label>
                <input
                  type="text"
                  value={form.mobile}
                  onChange={(e) => update("mobile", e.target.value)}
                  placeholder="+6591234567"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Owning Team / RP *</label>
                <input
                  type="text"
                  value={form.owner}
                  onChange={(e) => update("owner", e.target.value)}
                  placeholder="e.g. GovTech RP Team, CPF Board"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  placeholder="myinfo-v4, corppass-admin, gbbp"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: System Configuration */}
        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">System Configuration</h2>
            <p className="text-xs text-gray-500 mb-4">
              Select which systems this persona should be provisioned across. Singpass is always required.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { key: "withSingpass", label: "Singpass (Login)", desc: "Base account. Always required.", required: true },
                { key: "withMyinfo", label: "Myinfo", desc: "Inject persona attributes — v3/v4, userinfo, SPMV7, Verify." },
                { key: "withCorppass", label: "Corppass", desc: "Assign corporate entity role. Requires entity UEN." },
                { key: "withMib", label: "MIB (Myinfo Business)", desc: "Link business data profile for corporate flows." },
              ].map(({ key, label, desc, required }) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    form[key as keyof FormData]
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${required ? "opacity-100" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={!!form[key as keyof FormData]}
                    onChange={(e) => update(key as keyof FormData, e.target.checked)}
                    disabled={required}
                    className="w-4 h-4 accent-blue-700"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {label}
                      {required && <span className="ml-1.5 text-xs text-blue-600">(Required)</span>}
                    </div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {(form.withCorppass || form.withMib) && (
              <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Entity UEN</label>
                  <input
                    type="text"
                    value={form.entityUen}
                    onChange={(e) => update("entityUen", e.target.value)}
                    placeholder="202312345A"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Entity Name</label>
                  <input
                    type="text"
                    value={form.entityName}
                    onChange={(e) => update("entityName", e.target.value)}
                    placeholder="Tech Solutions Pte Ltd"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 mt-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Environment</label>
              <div className="flex gap-3">
                {["staging", "production-like"].map((env) => (
                  <label key={env} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="environment"
                      value={env}
                      checked={form.environment === env}
                      onChange={() => update("environment", env)}
                      className="accent-blue-700"
                    />
                    <span className="text-sm text-gray-700 capitalize">{env}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Review & Submit</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Persona</div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium">{form.type ? PERSONA_TYPE_LABELS[form.type] : "—"}</span>
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">{form.name || "—"}</span>
                  <span className="text-gray-500">NRIC</span>
                  <span className="font-mono font-medium">{form.nric || "—"}</span>
                  <span className="text-gray-500">Owner</span>
                  <span className="font-medium">{form.owner || "—"}</span>
                  <span className="text-gray-500">Environment</span>
                  <span className="font-medium capitalize">{form.environment}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Systems to Provision</div>
                <div className="flex gap-2 flex-wrap">
                  {form.withSingpass && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">✓ Singpass</span>}
                  {form.withMyinfo && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">✓ Myinfo</span>}
                  {form.withCorppass && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">✓ Corppass</span>}
                  {form.withMib && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">✓ MIB</span>}
                </div>
                {form.entityName && (
                  <div className="mt-2 text-xs text-gray-600">
                    Entity: {form.entityName} ({form.entityUen})
                  </div>
                )}
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-xs font-semibold text-blue-800 mb-1">Guardrail Confirmation</div>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• This persona will be created in a controlled sandbox/staging environment</li>
                  <li>• No real citizen data will be used — all attributes are synthetic</li>
                  <li>• Default expiry: 90 days from creation (renewal requires approval)</li>
                  <li>• All actions are audit logged with timestamp and actor</li>
                </ul>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Additional Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={2}
                  placeholder="Testing context, special requirements..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Back
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="px-6 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Submit for Provisioning
          </button>
        )}
      </div>
    </div>
  );
}
