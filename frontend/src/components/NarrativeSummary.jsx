import { ShieldCheck, TrendingUp, WalletCards } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function NarrativeSummary({ analysis }) {
  const scores = analysis?.scores || {};
  const summary = analysis?.summary || {};
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
      <div className="medical-card p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pulse-accent">Doctor's summary</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{scores.headline}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-green-800">
              <ShieldCheck size={16} />
              Strength
            </p>
            <p className="mt-2 text-sm text-green-900">{scores.top_strength}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
              <WalletCards size={16} />
              Concern
            </p>
            <p className="mt-2 text-sm text-red-900">{scores.top_concern}</p>
          </div>
        </div>
      </div>
      <Metric icon={TrendingUp} label="Savings rate" value={`${summary.savings_rate || 0}%`} helper={`${inr.format(summary.savings_amount || 0)} retained`} />
      <Metric icon={WalletCards} label="Monthly expenses" value={inr.format(summary.avg_monthly_expenses || 0)} helper="Average over scanned months" />
    </div>
  );
}

function Metric({ icon: Icon, label, value, helper }) {
  return (
    <div className="medical-card p-5">
      <Icon className="text-pulse-accent" size={24} />
      <p className="mt-5 text-sm font-medium text-pulse-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-pulse-muted">{helper}</p>
    </div>
  );
}
