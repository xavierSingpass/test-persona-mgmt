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
  green: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
  blue: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
  red: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
  purple: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300",
};

const valueColorMap = {
  green: "text-green-700 dark:text-green-400",
  blue: "text-blue-700 dark:text-blue-400",
  yellow: "text-yellow-700 dark:text-yellow-400",
  red: "text-red-700 dark:text-red-400",
  purple: "text-purple-700 dark:text-purple-400",
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
