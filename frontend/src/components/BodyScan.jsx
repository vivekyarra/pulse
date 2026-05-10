import { Activity, Brain, HeartPulse, Info, Landmark, MoveVertical, Wind } from "lucide-react";
import { useMemo, useState } from "react";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function colorFor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function organClass(score) {
  if (score >= 80) return "organ healthy-organ";
  if (score < 40) return "organ critical-organ";
  return "organ";
}

export default function BodyScan({ analysis }) {
  const scores = analysis?.scores || {};
  const summary = analysis?.summary || {};
  const [active, setActive] = useState("heart");
  const [hovered, setHovered] = useState(null);

  const organs = useMemo(
    () => ({
      brain: {
        name: "Brain",
        icon: Brain,
        label: "Investment Ratio",
        score: scores.brain_score ?? 0,
        measures: "Long-term wealth planning and SIP discipline.",
        actual: `${summary.investment_ratio || 0}% of income invested`,
        benchmark: "National average: 6%. You: " + `${summary.investment_ratio || 0}%` + ". Top quartile: 20%+.",
        action: "Increase SIP by Rs 2,000 after cancelling one forgotten subscription cluster.",
      },
      heart: {
        name: "Heart",
        icon: HeartPulse,
        label: "Savings Rate",
        score: scores.heart_score ?? 0,
        measures: "How much income stays with you after expenses.",
        actual: `${summary.savings_rate || 0}% saved, ${inr.format(summary.savings_amount || 0)} retained`,
        benchmark: "National average: 12%. You: " + `${summary.savings_rate || 0}%` + ". Top quartile: 28%+.",
        action: "Cap food delivery in the first five salary days and move the difference into an auto-sweep buffer.",
      },
      lungs: {
        name: "Lungs",
        icon: Wind,
        label: "Liquidity",
        score: scores.lung_score ?? 0,
        measures: "Breathing room if income pauses or an emergency hits.",
        actual: `${summary.liquidity_months || 0} months of average expenses covered`,
        benchmark: "Healthy range: 3 months. Excellent range: 6 months.",
        action: "Build a separate emergency account until it reaches three months of expenses.",
      },
      stomach: {
        name: "Stomach",
        icon: Activity,
        label: "Spending Discipline",
        score: scores.stomach_score ?? 0,
        measures: "Impulse spending, category balance, and salary-week surges.",
        actual: `${summary.post_salary_surge || 0}% post-salary surge detected`,
        benchmark: "Low-stress pattern: under 15% surge. High-risk pattern: 40%+ surge.",
        action: "Pre-commit a weekly food budget before salary arrives, not after.",
      },
      spine: {
        name: "Spine",
        icon: MoveVertical,
        label: "Income Stability",
        score: scores.spine_score ?? 0,
        measures: "Reliability of monthly credits and recurring income.",
        actual: `${summary.income_stability || 0}/100 consistency score`,
        benchmark: "Salaried stability benchmark: 90+.",
        action: "Keep fixed obligations below 50% of income so one delayed credit does not bend the month.",
      },
    }),
    [scores, summary],
  );

  const selected = organs[active];
  const tooltip = hovered ? organs[hovered] : null;
  const GradeIcon = selected.icon || Landmark;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="medical-card overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-5 py-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pulse-accent">Financial Health Scan</p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <span className="rounded-lg bg-pulse-accent px-5 py-2 text-5xl font-semibold text-white shadow-panel">{scores.overall_grade || "C"}</span>
            <div className="text-left">
              <p className="text-sm font-medium text-pulse-muted">Overall grade</p>
              <p className="text-xl font-semibold">Body scan complete</p>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[560px] items-center justify-center bg-gradient-to-b from-white to-slate-50 p-4">
          <svg viewBox="0 0 360 460" className="h-[560px] max-h-[72vh] w-full max-w-[440px]" role="img" aria-label="Financial body scan visualization">
            <defs>
              <linearGradient id="bodyAura" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#dbeafe" />
                <stop offset="100%" stopColor="#eff6ff" />
              </linearGradient>
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d="M180 34c38 0 64 28 64 62 0 22-10 41-27 52 25 12 44 37 48 70l12 102c4 35-21 66-56 68l-11 1-7-112h-46l-7 112-11-1c-35-2-60-33-56-68l12-102c4-33 23-58 48-70-17-11-27-30-27-52 0-34 26-62 64-62Z"
              fill="url(#bodyAura)"
              stroke="#bfdbfe"
              strokeWidth="2"
            />
            <path d="M116 184c-44 18-58 65-65 119" fill="none" stroke="#bfdbfe" strokeWidth="18" strokeLinecap="round" />
            <path d="M244 184c44 18 58 65 65 119" fill="none" stroke="#bfdbfe" strokeWidth="18" strokeLinecap="round" />
            <path d="M155 387l-14 54" stroke="#bfdbfe" strokeWidth="21" strokeLinecap="round" />
            <path d="M205 387l14 54" stroke="#bfdbfe" strokeWidth="21" strokeLinecap="round" />

            <circle
              className={organClass(organs.brain.score)}
              cx="180"
              cy="91"
              r="29"
              fill={colorFor(organs.brain.score)}
              opacity="0.94"
              onMouseEnter={() => setHovered("brain")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setActive("brain")}
            />
            <path
              className={organClass(organs.heart.score)}
              d="M166 174c-18-18-47 4-34 30 8 16 25 25 48 43 23-18 40-27 48-43 13-26-16-48-34-30-6 6-10 10-14 19-4-9-8-13-14-19Z"
              fill={colorFor(organs.heart.score)}
              opacity="0.95"
              onMouseEnter={() => setHovered("heart")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setActive("heart")}
            />
            <path
              className={organClass(organs.lungs.score)}
              d="M142 142c-31 6-47 36-44 76 2 28 23 42 52 32 18-7 20-27 16-54-3-22-9-39-24-54Z"
              fill={colorFor(organs.lungs.score)}
              opacity="0.8"
              onMouseEnter={() => setHovered("lungs")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setActive("lungs")}
            />
            <path
              className={organClass(organs.lungs.score)}
              d="M218 142c31 6 47 36 44 76-2 28-23 42-52 32-18-7-20-27-16-54 3-22 9-39 24-54Z"
              fill={colorFor(organs.lungs.score)}
              opacity="0.8"
              onMouseEnter={() => setHovered("lungs")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setActive("lungs")}
            />
            <ellipse
              className={organClass(organs.stomach.score)}
              cx="183"
              cy="287"
              rx="48"
              ry="34"
              fill={colorFor(organs.stomach.score)}
              opacity="0.92"
              onMouseEnter={() => setHovered("stomach")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setActive("stomach")}
            />
            <g
              className={organClass(organs.spine.score)}
              fill={colorFor(organs.spine.score)}
              opacity="0.95"
              onMouseEnter={() => setHovered("spine")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setActive("spine")}
            >
              {[140, 162, 184, 206, 228, 250, 272, 294, 316].map((y) => (
                <rect key={y} x="174" y={y} width="12" height="14" rx="3" />
              ))}
            </g>
          </svg>

          {tooltip ? (
            <div className="pointer-events-none absolute left-1/2 top-6 w-[min(92%,360px)] -translate-x-1/2 rounded-lg border border-slate-200 bg-white/95 p-4 text-sm shadow-clinical backdrop-blur">
              <p className="font-semibold">
                {tooltip.name} ({tooltip.label}) - Score: {tooltip.score}/100
              </p>
              <p className="mt-1 text-pulse-muted">{tooltip.measures}</p>
              <p className="mt-2 text-slate-700">{tooltip.actual}</p>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="medical-card h-fit p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: `${colorFor(selected.score)}20`, color: colorFor(selected.score) }}>
            <GradeIcon size={24} />
          </span>
          <div>
            <p className="text-sm font-medium text-pulse-muted">{selected.label}</p>
            <h3 className="text-2xl font-semibold">{selected.name}</h3>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-end justify-between">
            <span className="text-6xl font-semibold tracking-tight" style={{ color: colorFor(selected.score) }}>
              {selected.score}
            </span>
            <span className="mb-2 text-lg font-medium text-pulse-muted">/100</span>
          </div>
          <div className="mt-3 h-3 rounded-full bg-slate-100">
            <div className="h-3 rounded-full transition-all" style={{ width: `${selected.score}%`, backgroundColor: colorFor(selected.score) }} />
          </div>
        </div>

        <Detail title="What it measures" text={selected.measures} />
        <Detail title="Your numbers" text={selected.actual} />
        <Detail title="Benchmark" text={selected.benchmark} />
        <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-pulse-accent">
            <Info size={16} />
            Action
          </p>
          <p className="mt-2 text-sm text-slate-700">{selected.action}</p>
        </div>
      </aside>
    </div>
  );
}

function Detail({ title, text }) {
  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-pulse-muted">{text}</p>
    </div>
  );
}
