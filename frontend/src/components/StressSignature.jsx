import { AlertTriangle } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function heatColor(value, max) {
  if (!value) return "#e0f2fe";
  const intensity = Math.min(1, value / max);
  if (intensity < 0.25) return "#bae6fd";
  if (intensity < 0.5) return "#60a5fa";
  if (intensity < 0.75) return "#f97316";
  return "#ef4444";
}

export default function StressSignature({ analysis }) {
  const rows = analysis?.summary?.stress_matrix || [];
  const surge = analysis?.summary?.post_salary_surge || 0;
  const max = Math.max(1, ...rows.flatMap((row) => row.days));
  const monthEndSpike = rows.some((row) => row.days.slice(24).some((value) => value > max * 0.55));

  return (
    <div className="medical-card p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pulse-accent">Stress signature</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Spending by day of month</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-pulse-muted">This view ignores weekdays and focuses on salary-cycle behavior: day 1 to day 31 across the last three months.</p>
      </div>

      <div className="mt-7 overflow-x-auto">
        <div className="min-w-[960px]">
          <div className="ml-24 grid grid-cols-31 gap-1">
            {Array.from({ length: 31 }, (_, index) => (
              <div key={index} className="text-center text-xs font-medium text-slate-500">{index + 1}</div>
            ))}
          </div>
          <div className="mt-2 space-y-2">
            {rows.map((row) => (
              <div key={row.month} className="grid grid-cols-[88px_1fr] items-center gap-3">
                <div className="text-right text-sm font-semibold text-slate-700">{row.month}</div>
                <div className="grid grid-cols-31 gap-1">
                  {row.days.map((value, index) => (
                    <div
                      key={`${row.month}-${index}`}
                      title={`Day ${index + 1}: ${inr.format(value)}`}
                      className="h-9 rounded border border-white"
                      style={{ backgroundColor: heatColor(value, max) }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {surge > 20 ? (
          <Annotation
            tone="red"
            title="Post-salary surge detected"
            text={`You spend ${Math.round(surge)}% more in the first week after salary. This looks like emotional relief spending.`}
          />
        ) : (
          <Annotation tone="green" title="Salary week controlled" text="Your first-week spending stays close to baseline." />
        )}
        {monthEndSpike ? (
          <Annotation tone="amber" title="Month-end stress pattern" text="A few spikes appear near month-end, which may indicate budget pressure or catch-up payments." />
        ) : (
          <Annotation tone="green" title="Month-end stable" text="No major month-end stress spending pattern was detected." />
        )}
      </div>
    </div>
  );
}

function Annotation({ title, text, tone }) {
  const palette = {
    red: "border-red-200 bg-red-50 text-red-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    green: "border-green-200 bg-green-50 text-green-900",
  }[tone];

  return (
    <div className={`rounded-lg border p-4 ${palette}`}>
      <p className="flex items-center gap-2 font-semibold">
        <AlertTriangle size={17} />
        {title}
      </p>
      <p className="mt-2 text-sm leading-6">{text}</p>
    </div>
  );
}
