"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PersonaType, PERSONA_TYPE_LABELS } from "@/lib/types";
import Image from "next/image";

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

const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
const selectClass = "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";
const labelClass = "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function CreatePersonaPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [bioPhotoPreview, setBioPhotoPreview] = useState<string>("");
  const [bioPhotoName, setBioPhotoName] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof FormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setBioPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setBioPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

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
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ✅
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Persona Provisioning Initiated</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          Your request has been submitted to the orchestration engine. Singpass account creation,
          Myinfo injection, and Corppass assignment (if applicable) are being processed.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Redirecting to persona list...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Test Persona</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs mt-1 font-medium whitespace-nowrap ${
                  i === step ? "text-[#1a3a6b] dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Step 0: Persona Type */}
        {step === 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Select Persona Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(PERSONA_TYPE_LABELS) as PersonaType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => update("type", type)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    form.type === type
                      ? "border-[#1a3a6b] bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{PERSONA_TYPE_LABELS[type]}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{typeDescriptions[type].desc}</div>
                  <div className={`text-xs mt-2 italic ${form.type === type ? "text-blue-700 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
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
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Identity Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Tan Wei Ming"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>NRIC / FIN *</label>
                <input
                  type="text"
                  value={form.nric}
                  onChange={(e) => update("nric", e.target.value.toUpperCase())}
                  placeholder="e.g. S9812345A"
                  className={inputClass + " font-mono"}
                />
              </div>
              <div>
                <label className={labelClass}>Sex</label>
                <select value={form.sex} onChange={(e) => update("sex", e.target.value)} className={selectClass}>
                  <option value="">Select</option>
                  <option>M</option>
                  <option>F</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Race</label>
                <select value={form.race} onChange={(e) => update("race", e.target.value)} className={selectClass}>
                  <option value="">Select</option>
                  <option>Chinese</option>
                  <option>Malay</option>
                  <option>Indian</option>
                  <option>Eurasian</option>
                  <option>Others</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Nationality</label>
                <select value={form.nationality} onChange={(e) => update("nationality", e.target.value)} className={selectClass}>
                  <option>Singapore Citizen</option>
                  <option>Singapore PR</option>
                  <option>Foreign National</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => update("dob", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Test Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="persona.test@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Mobile (test)</label>
                <input
                  type="text"
                  value={form.mobile}
                  onChange={(e) => update("mobile", e.target.value)}
                  placeholder="+6591234567"
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Owning Team / RP *</label>
                <input
                  type="text"
                  value={form.owner}
                  onChange={(e) => update("owner", e.target.value)}
                  placeholder="e.g. GovTech RP Team, CPF Board"
                  className={inputClass}
                />
              </div>

              {/* Bio Photo Upload */}
              <div className="md:col-span-2">
                <label className={labelClass}>Bio Photo (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoFile(file);
                  }}
                />
                {bioPhotoPreview ? (
                  <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                      <Image src={bioPhotoPreview} alt="Bio photo preview" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{bioPhotoName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Photo uploaded successfully</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBioPhotoPreview("");
                        setBioPhotoName("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handlePhotoFile(file);
                    }}
                    className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                      dragOver
                        ? "border-[#1a3a6b] bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xl">
                      📷
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: System Configuration */}
        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">System Configuration</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
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
                      ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
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
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {label}
                      {required && <span className="ml-1.5 text-xs text-blue-600 dark:text-blue-400">(Required)</span>}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {(form.withCorppass || form.withMib) && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Entity UEN</label>
                  <input
                    type="text"
                    value={form.entityUen}
                    onChange={(e) => update("entityUen", e.target.value)}
                    placeholder="202312345A"
                    className={inputClass + " font-mono"}
                  />
                </div>
                <div>
                  <label className={labelClass}>Entity Name</label>
                  <input
                    type="text"
                    value={form.entityName}
                    onChange={(e) => update("entityName", e.target.value)}
                    placeholder="Tech Solutions Pte Ltd"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
              <label className={labelClass}>Environment</label>
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
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{env}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Review & Submit</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Persona</div>
                <div className="flex items-start gap-4">
                  {bioPhotoPreview && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                      <Image src={bioPhotoPreview} alt="Bio photo" fill className="object-cover" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-y-2 text-sm flex-1">
                    <span className="text-gray-500 dark:text-gray-400">Type</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{form.type ? PERSONA_TYPE_LABELS[form.type] : "—"}</span>
                    <span className="text-gray-500 dark:text-gray-400">Name</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{form.name || "—"}</span>
                    <span className="text-gray-500 dark:text-gray-400">NRIC</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{form.nric || "—"}</span>
                    <span className="text-gray-500 dark:text-gray-400">Owner</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{form.owner || "—"}</span>
                    <span className="text-gray-500 dark:text-gray-400">Environment</span>
                    <span className="font-medium capitalize text-gray-900 dark:text-gray-100">{form.environment}</span>
                    {bioPhotoPreview && (
                      <>
                        <span className="text-gray-500 dark:text-gray-400">Bio Photo</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{bioPhotoName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Systems to Provision</div>
                <div className="flex gap-2 flex-wrap">
                  {form.withSingpass && <span className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">✓ Singpass</span>}
                  {form.withMyinfo && <span className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">✓ Myinfo</span>}
                  {form.withCorppass && <span className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">✓ Corppass</span>}
                  {form.withMib && <span className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">✓ MIB</span>}
                </div>
                {form.entityName && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Entity: {form.entityName} ({form.entityUen})
                  </div>
                )}
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Guardrail Confirmation</div>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• This persona will be created in a controlled sandbox/staging environment</li>
                  <li>• No real citizen data will be used — all attributes are synthetic</li>
                  <li>• Default expiry: 90 days from creation (renewal requires approval)</li>
                  <li>• All actions are audit logged with timestamp and actor</li>
                </ul>
              </div>
              <div>
                <label className={labelClass}>Additional Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={2}
                  placeholder="Testing context, special requirements..."
                  className={inputClass}
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
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
