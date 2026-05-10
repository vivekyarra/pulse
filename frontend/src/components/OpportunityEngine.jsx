import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function futureValue(monthly, years) {
  const r = 0.12 / 12;
  const n = years * 12;
  return monthly * (((1 + r) ** n - 1) / r);
}

function niceCategory(category) {
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function OpportunityEngine({ analysis }) {
  const byCategory = analysis?.summary?.by_category || {};
  const months = Math.max(1, analysis?.summary?.months?.length || 3);
  const options = Object.entries(byCategory)
    .filter(([category, amount]) => amount > 0 && !["transfer", "investment"].includes(category))
    .map(([category, total]) => ({ category, monthly: total / months }))
    .sort((a, b) => b.monthly - a.monthly);
  const [selectedCategory, setSelectedCategory] = useState(options[0]?.category || "food");
  const [redirect, setRedirect] = useState(35);
  const selected = options.find((item) => item.category === selectedCategory) || options[0] || { category: "food", monthly: 0 };
  const redirectedMonthly = Math.round((selected.monthly * redirect) / 100);
  const currentSipMonthly = Math.round((byCategory.investment || 0) / months);

  const data = useMemo(
    () =>
      [0, 5, 10, 15, 20].map((year) => ({
        year: `${year}y`,
        current: year === 0 ? 0 : Math.round(futureValue(currentSipMonthly, year)),
        optimized: year === 0 ? 0 : Math.round(futureValue(currentSipMonthly + redirectedMonthly, year)),
      })),
    [currentSipMonthly, redirectedMonthly],
  );

  const aha = Math.round(futureValue(currentSipMonthly + redirectedMonthly, 20));

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <aside className="medical-card p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pulse-accent">Opportunity engine</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Redirect spend into future wealth</h2>
        <div className="mt-6">
          <label className="text-sm font-semibold text-slate-800" htmlFor="category">Category</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-pulse-accent"
          >
            {options.map((option) => (
              <option key={option.category} value={option.category}>
                {niceCategory(option.category)} - {inr.format(option.monthly)}/mo
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800" htmlFor="redirect">Redirect to SIP</label>
            <span className="text-sm font-semibold text-pulse-accent">{redirect}%</span>
          </div>
          <input
            id="redirect"
            type="range"
            min="0"
            max="100"
            value={redirect}
            onChange={(event) => setRedirect(Number(event.target.value))}
            className="mt-3 w-full accent-pulse-accent"
          />
          <p className="mt-3 text-sm text-pulse-muted">{inr.format(redirectedMonthly)} per month would move from {niceCategory(selected.category)} to SIP.</p>
        </div>
      </aside>

      <section className="medical-card p-5">
        <div className="rounded-lg border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-semibold text-green-800">AHA NUMBER</p>
          <h3 className="mt-2 text-4xl font-semibold tracking-tight text-green-900 md:text-5xl">
            {inr.format(aha)} in 20 years
          </h3>
          <p className="mt-2 text-sm text-green-900">
            If your SIP became {inr.format(currentSipMonthly + redirectedMonthly)}/month by redirecting {inr.format(redirectedMonthly)} from {niceCategory(selected.category).toLowerCase()}.
          </p>
        </div>

        <div className="mt-6 h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 24, bottom: 10, left: 8 }}>
              <CartesianGrid stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={(value) => `Rs ${Math.round(value / 100000)}L`} />
              <Tooltip formatter={(value) => inr.format(value)} />
              <Line type="monotone" dataKey="current" name="Current SIP trajectory" stroke="#94a3b8" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="optimized" name="Optimized trajectory" stroke="#22c55e" strokeWidth={4} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
