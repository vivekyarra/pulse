import { Activity, FileText, ShieldCheck, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SAMPLE_DATA } from "../data/sample_data.js";

const loadingMessages = [
  "Identifying spending patterns...",
  "Detecting financial leaks...",
  "Building your health profile...",
  "Generating predictions...",
];

const banks = ["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB", "BoB"];

export default function UploadZone({ onAnalyze, isLoading, error }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isLoading) return undefined;
    const timer = setInterval(() => setMessageIndex((index) => (index + 1) % loadingMessages.length), 1200);
    return () => clearInterval(timer);
  }, [isLoading]);

  function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) onAnalyze({ file });
  }

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (file) onAnalyze({ file });
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 glass-grid">
      <div className="absolute inset-x-8 top-20 hidden h-[72vh] rounded-lg border border-slate-200 bg-white/55 shadow-clinical blur-[1px] md:block">
        <div className="grid h-full grid-cols-3 gap-5 p-8 opacity-35">
          <div className="rounded-lg bg-white p-5 shadow-panel">
            <div className="h-24 rounded-md bg-slate-100" />
            <div className="mt-4 h-3 w-3/4 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
          </div>
          <div className="rounded-lg bg-white p-5 shadow-panel">
            <div className="mx-auto h-64 w-32 rounded-full border border-blue-100 bg-blue-50" />
          </div>
          <div className="rounded-lg bg-white p-5 shadow-panel">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-10 rounded bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-clinical md:p-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-pulse-accent text-white">
          <Activity size={30} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pulse-accent">Financial Health Intelligence</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-pulse-ink md:text-6xl">PULSE</h1>
          <p className="mt-3 text-lg text-pulse-muted">Your money has a heartbeat. Now you can read it.</p>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-left text-sm text-green-900">
          <ShieldCheck className="mt-0.5 shrink-0" size={21} />
          <p>
            <strong>Your data is analyzed and immediately discarded.</strong> Nothing is stored on any server.
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          className="relative mt-6 overflow-hidden rounded-lg border-2 border-dashed border-blue-200 bg-slate-50 p-8 text-center transition hover:border-pulse-accent hover:bg-blue-50/40"
        >
          {isLoading ? (
            <div className="relative mx-auto flex min-h-[260px] max-w-md flex-col items-center justify-center">
              <div className="relative h-56 w-40 overflow-hidden rounded-full border border-blue-200 bg-white">
                <div className="absolute inset-x-3 top-8 h-16 rounded-full border border-slate-200" />
                <div className="absolute left-1/2 top-24 h-28 w-20 -translate-x-1/2 rounded-full border border-slate-200" />
                <div className="absolute inset-x-0 top-0 h-1 bg-pulse-accent shadow-[0_0_22px_rgba(30,64,175,0.7)] animate-scan" />
              </div>
              <p className="mt-5 text-lg font-semibold">PULSE is reading your statement...</p>
              <p className="mt-2 text-pulse-muted">{loadingMessages[messageIndex]}</p>
            </div>
          ) : (
            <>
              <UploadCloud className="mx-auto text-pulse-accent" size={44} />
              <h2 className="mt-4 text-2xl font-semibold">Drop your bank statement here</h2>
              <p className="mt-2 text-pulse-muted">CSV or PDF from Indian bank statements</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-pulse-accent px-5 py-3 font-semibold text-white shadow-panel transition hover:bg-blue-800"
                >
                  <FileText size={18} />
                  Upload Statement
                </button>
                <button
                  onClick={() => onAnalyze({ sampleMode: true })}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-pulse-ink transition hover:border-pulse-accent hover:text-pulse-accent"
                  title={`${SAMPLE_DATA.profile.name}, ${SAMPLE_DATA.transactions.length} transactions`}
                >
                  Use sample statement
                </button>
              </div>
              <input ref={inputRef} className="hidden" type="file" accept=".csv,.pdf,text/csv,application/pdf" onChange={handleFile} />
            </>
          )}
        </div>

        <div className="mt-6">
          <p className="text-center text-sm font-medium text-pulse-muted">Built for statements from major Indian banks</p>
          <p className="mt-2 text-center text-xs text-slate-500">
            Demo story: {SAMPLE_DATA.profile.name}, {SAMPLE_DATA.profile.age}, {SAMPLE_DATA.profile.city}; {SAMPLE_DATA.transactions.length} transactions.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {banks.map((bank) => (
              <span key={bank} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                {bank}
              </span>
            ))}
          </div>
        </div>

        {error ? <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      </div>
    </section>
  );
}
