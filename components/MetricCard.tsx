interface MetricCardProps {
  label: string;
  value: string | number;
  baseline?: string;
  target?: string;
  unit?: string;
  color?: "green" | "blue" | "yellow" | "red" | "purple";
  icon?: string;
}

const colorMap = {
  green: "bg-green-50 border-green-200 text-green-800",
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
  red: "bg-red-50 border-red-200 text-red-800",
  purple: "bg-purple-50 border-purple-200 text-purple-800",
};

const valueColorMap = {
  green: "text-green-700",
  blue: "text-blue-700",
  yellow: "text-yellow-700",
  red: "text-red-700",
  purple: "text-purple-700",
};

export default function MetricCard({
  label,
  value,
  baseline,
  target,
  unit,
  color = "blue",
  icon,
}: MetricCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${valueColorMap[color]}`}>
            {value}
            {unit && <span className="text-base font-medium ml-1">{unit}</span>}
          </p>
          {(baseline || target) && (
            <div className="mt-1.5 flex gap-2 text-xs opacity-60">
              {baseline && <span>Baseline: {baseline}</span>}
              {target && <span>Target: {target}</span>}
            </div>
          )}
        </div>
        {icon && <span className="text-2xl opacity-40">{icon}</span>}
      </div>
    </div>
  );
}
