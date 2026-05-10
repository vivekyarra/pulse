import { AlertCircle, CalendarClock, CheckCircle2 } from "lucide-react";

const toneMap = {
  high: {
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-900",
    icon: AlertCircle,
  },
  medium: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-900",
    icon: CalendarClock,
  },
  low: {
    border: "border-green-200",
    bg: "bg-green-50",
    text: "text-green-900",
    icon: CheckCircle2,
  },
};

export default function PredictionPanel({ analysis }) {
  const predictions = analysis?.predictions || [];

  return (
    <div className="medical-card p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pulse-accent">30-day prediction</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Near-term financial vitals</h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-pulse-muted">Short, conservative predictions based on recurring bills, salary-cycle behavior, and unusual pattern breaks.</p>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {predictions.map((prediction, index) => {
          const tone = toneMap[prediction.urgency] || toneMap.low;
          const Icon = tone.icon;
          return (
            <article key={`${prediction.prediction}-${index}`} className={`rounded-lg border ${tone.border} ${tone.bg} p-5 ${tone.text}`}>
              <div className="flex items-start justify-between gap-4">
                <Icon size={24} />
                <span className="rounded-md bg-white/70 px-2 py-1 text-xs font-semibold">{prediction.confidence}% likely</span>
              </div>
              <p className="mt-5 text-lg font-semibold leading-7">{prediction.prediction}</p>
              <div className="mt-5 flex items-center justify-between border-t border-current/10 pt-4 text-sm">
                <span className="font-semibold capitalize">{prediction.category}</span>
                <span>{prediction.amount_range}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
