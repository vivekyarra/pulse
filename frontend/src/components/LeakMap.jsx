import { ExternalLink, ShieldAlert } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function LeakMap({ analysis }) {
  const leaks = analysis?.leaks?.items || [];
  const groups = analysis?.leaks?.groups || [];
  const total = analysis?.leaks?.total_monthly || 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="medical-card p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pulse-accent">Leak map</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">You are leaking {inr.format(total)}/month</h2>
          </div>
          <p className="max-w-sm text-sm text-pulse-muted">Small recurring charges under Rs 500 become visible as drips in your income pipe.</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
          <svg viewBox="0 0 760 440" className="h-[430px] w-full min-w-[620px]" role="img" aria-label="Subscription leak pipe diagram">
            <defs>
              <linearGradient id="pipeFlow" x1="0" x2="1">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <path d="M80 80 H380 V340 H675" fill="none" stroke="#dbeafe" strokeWidth="54" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M80 80 H380 V340 H675" fill="none" stroke="url(#pipeFlow)" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
            <text x="82" y="42" fill="#0f172a" fontSize="20" fontWeight="700">Income pipe</text>
            <text x="573" y="392" fill="#0f172a" fontSize="18" fontWeight="700">Savings flow</text>

            {groups.map((group, index) => {
              const x = 250 + index * 150;
              return (
                <g key={group.name}>
                  <path d={`M${x} 80 V190`} stroke="#bfdbfe" strokeWidth="30" strokeLinecap="round" />
                  <path d={`M${x} 80 V190`} stroke="#ef4444" strokeWidth="16" strokeLinecap="round" />
                  <text x={x - 58} y="226" fill="#0f172a" fontSize="16" fontWeight="700">{group.name}</text>
                  <text x={x - 43} y="250" fill="#64748b" fontSize="14">{inr.format(group.amount)}/mo</text>
                  {[0, 1, 2].map((drop) => (
                    <circle
                      key={drop}
                      cx={x + drop * 18 - 18}
                      cy="196"
                      r="7"
                      fill="#ef4444"
                      opacity="0.82"
                      style={{ animation: "drip 1.7s ease-in-out infinite", animationDelay: `${drop * 0.28 + index * 0.2}s` }}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      <aside className="medical-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <ShieldAlert size={22} />
          </span>
          <div>
            <p className="text-sm font-medium text-pulse-muted">Potential leaks</p>
            <h3 className="text-xl font-semibold">Cancel candidates</h3>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {leaks.map((leak) => (
            <div key={`${leak.merchant}-${leak.amount}`} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{leak.merchant}</p>
                  <p className="mt-1 text-sm text-pulse-muted">Expected around day {leak.next_expected_day}</p>
                </div>
                <p className="text-lg font-semibold text-red-600">{inr.format(leak.monthly_total)}</p>
              </div>
              <a
                href={`https://www.google.com/search?q=cancel+${encodeURIComponent(leak.merchant)}+subscription+India`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-pulse-accent hover:border-pulse-accent"
              >
                Cancel this
                <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
