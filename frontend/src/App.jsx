import { Activity, Droplets, LineChart, Radar, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import BodyScan from "./components/BodyScan.jsx";
import LeakMap from "./components/LeakMap.jsx";
import NarrativeSummary from "./components/NarrativeSummary.jsx";
import OpportunityEngine from "./components/OpportunityEngine.jsx";
import PredictionPanel from "./components/PredictionPanel.jsx";
import StressSignature from "./components/StressSignature.jsx";
import UploadZone from "./components/UploadZone.jsx";
import { buildLocalSampleAnalysis } from "./data/localAnalysis.js";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const tabs = [
  { id: "scan", label: "Health Scan", icon: Activity },
  { id: "leaks", label: "Leaks", icon: Droplets },
  { id: "stress", label: "Stress Map", icon: Radar },
  { id: "opportunity", label: "Opportunity", icon: LineChart },
  { id: "predictions", label: "Predictions", icon: Sparkles },
];

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("scan");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze({ file, sampleMode = false }) {
    setIsLoading(true);
    setError("");
    setActiveTab("scan");
    try {
      const formData = new FormData();
      formData.append("sample_mode", sampleMode ? "true" : "false");
      if (file) formData.append("file", file);
      const minimum = new Promise((resolve) => setTimeout(resolve, 1900));
      const request = fetch(`${API_BASE}/api/analyze`, { method: "POST", body: formData }).then((res) => {
        if (!res.ok) throw new Error("Analysis service rejected the statement.");
        return res.json();
      });
      const [result] = await Promise.all([request, minimum]);
      setAnalysis(result);
      if (result.error || result.warning) setError(result.error || result.warning);
    } catch (err) {
      if (sampleMode) {
        setAnalysis(buildLocalSampleAnalysis());
        setError("Live backend is unavailable, so PULSE loaded the built-in sample scan for the demo.");
        return;
      }
      setError(`${err.message} Start the backend or use docker compose, then try the sample again.`);
    } finally {
      setIsLoading(false);
    }
  }

  const ActiveComponent =
    activeTab === "leaks"
      ? LeakMap
      : activeTab === "stress"
        ? StressSignature
        : activeTab === "opportunity"
          ? OpportunityEngine
          : activeTab === "predictions"
            ? PredictionPanel
            : BodyScan;

  return (
    <main className="min-h-screen bg-pulse-paper text-pulse-ink">
      {!analysis ? (
        <UploadZone onAnalyze={analyze} isLoading={isLoading} error={error} />
      ) : (
        <div className="min-h-screen">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
              <button className="flex items-center gap-3 text-left" onClick={() => setAnalysis(null)}>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-pulse-accent text-white shadow-panel">
                  <Activity size={24} />
                </span>
                <span>
                  <span className="block text-xl font-semibold tracking-tight">PULSE</span>
                  <span className="block text-sm text-pulse-muted">Your money has a heartbeat. Now you can read it.</span>
                </span>
              </button>
              <nav className="flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex min-w-max items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                        activeTab === tab.id ? "bg-white text-pulse-accent shadow-sm" : "text-slate-600 hover:text-slate-950"
                      }`}
                      title={tab.label}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </header>

          <section className="mx-auto max-w-7xl px-4 py-6">
            {error ? (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>
            ) : null}
            {activeTab === "scan" ? <NarrativeSummary analysis={analysis} /> : null}
            <ActiveComponent analysis={analysis} />
          </section>
        </div>
      )}
    </main>
  );
}
