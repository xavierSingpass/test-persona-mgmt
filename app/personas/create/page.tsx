"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PersonaType, PERSONA_TYPE_LABELS } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type CreationMode = "single" | "csv" | "ai" | null;

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
  // Extended attributes for AI-generated personas
  attributes?: Record<string, string | number>;
}

interface CsvRow {
  rowNum: number;
  name: string;
  nric: string;
  sex: string;
  race: string;
  dob: string;
  email: string;
  mobile: string;
  type: string;
  owner: string;
  environment: string;
  withMyinfo: string;
  withCorppass: string;
  entityUen: string;
  entityName: string;
  errors: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const steps = ["Persona Type", "Identity Details", "System Configuration", "Review & Submit"];

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

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
const selectClass =
  "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";
const labelClass = "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1";

const CSV_HEADERS = "name,nric,sex,race,dob,email,mobile,type,owner,environment,withMyinfo,withCorppass,entityUen,entityName";
const SAMPLE_CSV = `${CSV_HEADERS}
Tan Wei Ming,S8012345A,M,Chinese,1980-06-15,tw.ming@test.gov.sg,+6591234567,partner_integration,GovTech RP Team,staging,true,false,,
Siti Binte Rahmat,S9234567B,F,Malay,1992-03-22,siti.test@test.gov.sg,+6598765432,synthetic_monitoring,MOM RP Team,staging,true,false,,
Ravi Kumar,S7556789C,M,Indian,1975-11-08,ravi.k@test.gov.sg,+6593456789,business_entity,CPF Board,staging,true,true,202312345A,Kumar Holdings Pte Ltd
`;

// ─── AI Prompt Parser ─────────────────────────────────────────────────────────

const MALE_NAMES: Record<string, string[]> = {
  Chinese: ["Tan Wei Ming", "Lim Jun Wei", "Chen Zhi Hao", "Wong Kai Xuan", "Lee Ying Jie"],
  Malay: ["Ahmad Bin Yusof", "Muhammad Hafiz", "Iskandar Bin Rahmat", "Faizal Bin Hassan"],
  Indian: ["Ravi Kumar", "Suresh Pillai", "Arjun Nair", "Deepak Krishnan"],
  Eurasian: ["Ethan De Souza", "Marcus Fernandez", "Dylan Pereira"],
  Others: ["Alex Tan", "Jordan Lim", "Riley Wong"],
};
const FEMALE_NAMES: Record<string, string[]> = {
  Chinese: ["Tan Mei Ling", "Lim Shu Fen", "Chen Xin Yi", "Wong Li Xuan", "Lee Hui Min"],
  Malay: ["Siti Binte Rahmat", "Nur Aisha", "Farah Binte Ismail", "Zainab Binte Yusof"],
  Indian: ["Priya Devi", "Meena Krishnan", "Anita Pillai", "Kavitha Nair"],
  Eurasian: ["Emma De Souza", "Natasha Fernandez", "Chloe Pereira"],
  Others: ["Alex Lee", "Jordan Chan", "Riley Tan"],
};

function nricChecksum(digits: string): string {
  const weights = [2, 7, 6, 5, 4, 3, 2];
  const sum = digits.split("").reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
  const remainder = sum % 11;
  const letters = "JZIHGFEDCBA";
  return letters[remainder];
}

function generateNric(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const digits = String(hash % 10000000).padStart(7, "0");
  return "S" + digits + nricChecksum(digits);
}

function parseAiPrompt(text: string, defaultOwner: string): FormData & { attributes: Record<string, string | number> } {
  const lower = text.toLowerCase();

  // Sex
  const sex = /\bfemale\b|\bwoman\b|\blady\b/.test(lower) ? "F" : "M";

  // Race
  let race = "Chinese";
  if (/\bmalay\b/.test(lower)) race = "Malay";
  else if (/\bindian\b|\btamil\b/.test(lower)) race = "Indian";
  else if (/\beurasian\b/.test(lower)) race = "Eurasian";

  // Nationality
  let nationality = "Singapore Citizen";
  if (/\bpr\b|\bpermanent resident\b/.test(lower)) nationality = "Singapore PR";
  else if (/\bforeign\b|\bexpat\b/.test(lower)) nationality = "Foreign National";

  // Age → DOB
  let dobYear = 1980;
  if (/\byoung\b|\bjunior\b|\b2[0-9]\b/.test(lower)) dobYear = new Date().getFullYear() - 28;
  else if (/\bmiddle.?age\b|\bmid.?30\b|\bmid.?40\b|\b4[0-5]\b/.test(lower)) dobYear = new Date().getFullYear() - 45;
  else if (/\belderly\b|\bsenior\b|\bold\b|\b6[0-9]\b/.test(lower)) dobYear = new Date().getFullYear() - 68;
  const dob = `${dobYear}-06-15`;

  // CPF balance
  let cpfTotal = 0;
  const cpfMatch = text.match(/(\d+(?:\.\d+)?)\s*k?\s*(?:cpf|sgd|dollars?)/i);
  if (cpfMatch) {
    cpfTotal = parseFloat(cpfMatch[1]) * (cpfMatch[0].toLowerCase().includes("k") ? 1000 : 1);
  }
  // Also handle "200k" standalone near "cpf"
  const kMatch = text.match(/(\d+)k/i);
  if (kMatch && cpfTotal === 0 && /cpf/.test(lower)) {
    cpfTotal = parseInt(kMatch[1]) * 1000;
  }

  // Entity / director
  const entityMatch = text.match(/director\s+of\s+(?:entity\s+)?([A-Za-z0-9\s]+?)(?:\s*[,.]|$)/i);
  const isDirector = /\bdirector\b/.test(lower) || entityMatch !== null;
  const entityName = entityMatch ? entityMatch[1].trim() + " Pte Ltd" : "";
  const entityUen = entityName ? "20" + Math.abs(entityName.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 0) % 100000).toString().padStart(5, "0") + "A" : "";

  // Type
  const type: PersonaType = isDirector ? "business_entity" : "partner_integration";

  // Name
  const namePool = sex === "F" ? FEMALE_NAMES[race] || FEMALE_NAMES["Others"] : MALE_NAMES[race] || MALE_NAMES["Others"];
  const nameSeed = race + sex + dob;
  const nameIndex = Math.abs(nameSeed.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 0)) % namePool.length;
  const name = namePool[nameIndex];

  const nric = generateNric(name + dob);

  const attributes: Record<string, string | number> = {};
  if (cpfTotal > 0) {
    attributes.cpfOrdinaryAccount = Math.round(cpfTotal * 0.6);
    attributes.cpfSpecialAccount = Math.round(cpfTotal * 0.2);
    attributes.cpfMedisaveAccount = Math.round(cpfTotal * 0.2);
  }
  if (isDirector) {
    attributes.employmentTitle = "Director";
    attributes.corppassRole = "Director";
    if (entityName) attributes.entityNameAttr = entityName;
  }

  return {
    ...initialForm,
    type,
    name,
    nric,
    sex,
    race,
    nationality,
    dob,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@test.gov.sg`,
    mobile: "+6591230000",
    owner: defaultOwner,
    withSingpass: true,
    withMyinfo: cpfTotal > 0 || isDirector,
    withCorppass: isDirector,
    withMib: isDirector,
    entityUen,
    entityName,
    attributes,
  };
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCsvFile(content: string): CsvRow[] {
  const lines = content.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const dataLines = lines[0].trim().startsWith("name") ? lines.slice(1) : lines;

  return dataLines.map((line, idx) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const [name = "", nric = "", sex = "", race = "", dob = "", email = "", mobile = "", type = "", owner = "", environment = "staging", withMyinfo = "", withCorppass = "", entityUen = "", entityName = ""] = cols;
    const errors: string[] = [];
    if (!name) errors.push("Missing name");
    if (!nric) errors.push("Missing NRIC");
    else if (!/^[STFG]\d{7}[A-Z]$/.test(nric)) errors.push("Invalid NRIC format");
    if (!owner) errors.push("Missing owner");
    if (type && !Object.keys(PERSONA_TYPE_LABELS).includes(type)) errors.push(`Unknown type: ${type}`);
    return { rowNum: idx + 1, name, nric, sex, race, dob, email, mobile, type, owner, environment, withMyinfo, withCorppass, entityUen, entityName, errors };
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreatePersonaPage() {
  const router = useRouter();
  const { config } = useProfile();
  const defaultOwner = config.ownerFilter ?? "GovTech RP Team";

  // Mode state
  const [mode, setMode] = useState<CreationMode>(null);

  // Single form state
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({ ...initialForm, owner: defaultOwner });
  const [submitted, setSubmitted] = useState(false);
  const [bioPhotoPreview, setBioPhotoPreview] = useState<string>("");
  const [bioPhotoName, setBioPhotoName] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI state
  const [aiPrompt, setAiPrompt] = useState("a singaporean middle age male with 200k CPF balances that is a director of entity ABC");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<Record<string, string | number> | null>(null);

  // CSV state
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvDragOver, setCsvDragOver] = useState(false);
  const [csvSubmitted, setCsvSubmitted] = useState(false);
  const csvFileRef = useRef<HTMLInputElement>(null);

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

  const resetToMode = (m: CreationMode) => {
    setMode(m);
    setStep(0);
    setSubmitted(false);
    setBioPhotoPreview("");
    setBioPhotoName("");
    if (m !== "single") setForm({ ...initialForm, owner: defaultOwner });
  };

  const handleCsvFile = (file: File) => {
    if (!file.name.endsWith(".csv")) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvRows(parseCsvFile(content));
    };
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_personas.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateAi = () => {
    setAiLoading(true);
    setTimeout(() => {
      const result = parseAiPrompt(aiPrompt, defaultOwner);
      setAiGenerated(result.attributes ?? null);
      setForm(result);
      setStep(1);
      setAiLoading(false);
      setMode("single");
    }, 1200);
  };

  const validCsvRows = csvRows.filter((r) => r.errors.length === 0);

  // ── Submitted ──────────────────────────────────────────────────────────────

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

  if (csvSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          📋
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Bulk Import Queued</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          <strong>{validCsvRows.length} persona{validCsvRows.length !== 1 ? "s" : ""}</strong> have been queued for provisioning. Each will be processed sequentially across Singpass, Myinfo, and Corppass.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Redirecting to persona list...
        </div>
      </div>
    );
  }

  // ── Mode Picker ────────────────────────────────────────────────────────────

  if (mode === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Test Persona</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Choose how you want to create your test persona.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: "single" as const,
              icon: "👤",
              title: "Single Creation",
              desc: "Fill a step-by-step guided form to provision one persona across Singpass, Myinfo, and Corppass.",
              badge: null,
            },
            {
              id: "csv" as const,
              icon: "📋",
              title: "Bulk CSV Upload",
              desc: "Upload a CSV file to create multiple personas at once. Validate, preview, and submit in batch.",
              badge: "Batch",
            },
            {
              id: "ai" as const,
              icon: "✨",
              title: "AI Prompt",
              desc: 'Describe your persona in plain English — "a singaporean male director with CPF balances" — and we\'ll pre-fill the form.',
              badge: "New",
            },
          ].map(({ id, icon, title, desc, badge }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className="text-left p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#1a3a6b] dark:hover:border-blue-500 hover:shadow-md transition-all bg-white dark:bg-gray-900 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                  {icon}
                </div>
                {badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${id === "ai" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"}`}>
                    {badge}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-[#1a3a6b] dark:group-hover:text-blue-400 transition-colors">
                {title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              <div className="mt-4 text-xs font-medium text-[#1a3a6b] dark:text-blue-400 group-hover:underline">
                Select →
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── AI Prompt Mode ─────────────────────────────────────────────────────────

  if (mode === "ai") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setMode(null)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Prompt</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Describe your persona in plain English.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">✨</span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Describe Your Persona</h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Include details like age, sex, race, nationality, CPF balances, employment role, or entity name. The form will be pre-filled and fully editable before submission.
          </p>

          <div className="mb-4">
            <label className={labelClass}>Persona Description</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. a singaporean middle age male with 200k CPF balances that is a director of entity ABC"
              className={inputClass + " resize-none"}
            />
          </div>

          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Supported keywords</div>
            <div className="flex flex-wrap gap-2">
              {[
                "male / female",
                "chinese / malay / indian / eurasian",
                "singaporean / PR / foreign",
                "young / middle age / elderly",
                "200k CPF",
                "director of entity [NAME]",
              ].map((kw) => (
                <span key={kw} className="text-xs px-2 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateAi}
            disabled={!aiPrompt.trim() || aiLoading}
            className="w-full py-3 text-sm font-semibold text-white bg-[#1a3a6b] rounded-lg hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating persona...
              </>
            ) : (
              <>✨ Generate &amp; Pre-fill Form</>
            )}
          </button>
        </div>

        {/* Example cards */}
        <div className="mt-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "a singaporean elderly chinese female with 50k CPF",
              "an indian PR male in his 30s",
              "a malay singaporean female who is a director of entity XYZ Holdings",
            ].map((ex) => (
              <button
                key={ex}
                onClick={() => setAiPrompt(ex)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-900 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── CSV Mode ───────────────────────────────────────────────────────────────

  if (mode === "csv") {
    const hasRows = csvRows.length > 0;
    const errorRows = csvRows.filter((r) => r.errors.length > 0);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => { setMode(null); setCsvRows([]); setCsvFileName(""); }}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bulk CSV Upload</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Import multiple personas from a CSV file.</p>
          </div>
        </div>

        {!hasRows ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            {/* Uploader */}
            <input
              ref={csvFileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvFile(f); }}
            />
            <div
              onClick={() => csvFileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setCsvDragOver(true); }}
              onDragLeave={() => setCsvDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setCsvDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleCsvFile(f);
              }}
              className={`flex flex-col items-center justify-center gap-3 p-10 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                csvDragOver
                  ? "border-[#1a3a6b] bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl">
                📋
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">CSV files only</p>
              </div>
            </div>

            {/* Format spec */}
            <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Expected CSV format:</p>
                <button
                  onClick={downloadSampleCsv}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Download sample CSV →
                </button>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                {CSV_HEADERS}
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                {[
                  { field: "name", req: true },
                  { field: "nric", req: true },
                  { field: "owner", req: true },
                  { field: "type", req: false },
                  { field: "environment", req: false },
                  { field: "withMyinfo / withCorppass", req: false },
                ].map(({ field, req }) => (
                  <div key={field} className="flex items-center gap-1">
                    <span className={req ? "text-red-500" : "text-gray-400"}>{req ? "*" : "○"}</span>
                    <span>{field}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">* Required fields</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{csvFileName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {csvRows.length} rows
                </span>
                {validCsvRows.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                    {validCsvRows.length} valid
                  </span>
                )}
                {errorRows.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                    {errorRows.length} errors
                  </span>
                )}
              </div>
              <button
                onClick={() => { setCsvRows([]); setCsvFileName(""); }}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Upload different file
              </button>
            </div>

            {/* Preview table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">#</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">NRIC</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Owner</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Systems</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {csvRows.map((row) => (
                      <tr key={row.rowNum} className={row.errors.length > 0 ? "bg-red-50 dark:bg-red-900/10" : ""}>
                        <td className="px-3 py-2 text-gray-400 dark:text-gray-500">{row.rowNum}</td>
                        <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{row.name || "—"}</td>
                        <td className="px-3 py-2 font-mono text-gray-700 dark:text-gray-300">{row.nric || "—"}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                          {row.type ? (PERSONA_TYPE_LABELS[row.type as PersonaType] ?? row.type) : "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.owner || "—"}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-xs">SP</span>
                            {row.withMyinfo === "true" && <span className="px-1 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded text-xs">MI</span>}
                            {row.withCorppass === "true" && <span className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-xs">CP</span>}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {row.errors.length === 0 ? (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full font-medium">Valid</span>
                          ) : (
                            <div className="space-y-0.5">
                              {row.errors.map((e, i) => (
                                <span key={i} className="block px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full font-medium">
                                  {e}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {errorRows.length > 0 ? `${errorRows.length} row(s) will be skipped due to errors.` : "All rows are valid and ready to import."}
              </p>
              <button
                onClick={() => { setCsvSubmitted(true); setTimeout(() => router.push("/personas"), 2500); }}
                disabled={validCsvRows.length === 0}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Submit {validCsvRows.length} Valid Persona{validCsvRows.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Single Form (mode === "single") ────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => resetToMode(null)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ← Change mode
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Test Persona</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {aiGenerated
            ? "Review and edit the AI-generated persona before submitting."
            : "Provision a new persona across Singpass, Myinfo, and Corppass from a single form."}
        </p>
        {aiGenerated && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg text-xs text-purple-700 dark:text-purple-300">
            ✨ Pre-filled by AI prompt — all fields are editable
          </div>
        )}
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
                <input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} className={inputClass} />
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

              {/* AI-generated attributes preview */}
              {aiGenerated && Object.keys(aiGenerated).length > 0 && (
                <div className="md:col-span-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                  <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">✨ AI-inferred Myinfo Attributes</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(aiGenerated).map(([k, v]) => (
                      <div key={k} className="flex flex-col">
                        <span className="text-purple-500 dark:text-purple-400 font-medium">{k}</span>
                        <span className="text-purple-800 dark:text-purple-200 font-semibold">
                          {typeof v === "number" && k.toLowerCase().includes("cpf")
                            ? `$${v.toLocaleString()}`
                            : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio Photo Upload */}
              <div className="md:col-span-2">
                <label className={labelClass}>Bio Photo (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handlePhotoFile(file); }}
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
                      onClick={() => { setBioPhotoPreview(""); setBioPhotoName(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
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
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload or drag and drop</p>
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
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Review &amp; Submit</h2>
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

              {/* AI attributes in review */}
              {aiGenerated && Object.keys(aiGenerated).length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                  <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-2">Myinfo Attributes</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 text-sm">
                    {Object.entries(aiGenerated).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-purple-500 dark:text-purple-400 text-xs">{k}</span>
                        <div className="font-medium text-purple-900 dark:text-purple-100">
                          {typeof v === "number" && k.toLowerCase().includes("cpf")
                            ? `$${v.toLocaleString()}`
                            : String(v)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
          onClick={() => step === 0 ? resetToMode(null) : setStep((s) => s - 1)}
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          ← {step === 0 ? "Change mode" : "Back"}
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
