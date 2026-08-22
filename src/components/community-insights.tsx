"use client";

import { BarChart3, LoaderCircle, MapPinned, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type Insights = {
  total_reports: number;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  top_areas: Array<{ area: string; count: number }>;
};

export function CommunityInsights() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/insights", { cache: "no-store" });
      const data = await response.json() as { insights?: Insights; message?: string };
      if (!response.ok || !data.insights) throw new Error(data.message || "Unable to load community insights.");
      setInsights(data.insights);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load community insights.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    async function initialLoad() {
      try {
        const response = await fetch("/api/insights", { cache: "no-store" });
        const data = await response.json() as { insights?: Insights; message?: string };
        if (!response.ok || !data.insights) throw new Error(data.message || "Unable to load community insights.");
        if (active) setInsights(data.insights);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load community insights.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void initialLoad();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="insights-loading"><LoaderCircle size={22} /> Loading community patterns…</div>;
  if (error || !insights) return <div className="insights-error"><ShieldCheck size={24} /><h2>Insights are unavailable right now.</h2><p>{error}</p><button className="civic-button" type="button" onClick={load}>Try again</button></div>;

  const categoryEntries = Object.entries(insights.by_category);
  const statusEntries = Object.entries(insights.by_status);
  const maxCategory = Math.max(1, ...categoryEntries.map(([, value]) => value));
  const maxStatus = Math.max(1, ...statusEntries.map(([, value]) => value));

  return (
    <div className="insights-dashboard">
      <div className="insights-header"><div><p className="signal-label"><BarChart3 size={15} /> Community patterns</p><h1>What the board is showing</h1><p>Aggregate issue information can help communities understand recurring concerns without exposing personal reporter details.</p></div><button className="moderation-refresh" type="button" onClick={load}><RefreshCw size={16} /> Refresh</button></div>
      <div className="insight-stat-grid"><article><span>📍</span><strong>{insights.total_reports}</strong><small>Reports on the board</small></article><article><span>🗂️</span><strong>{categoryEntries.length}</strong><small>Issue categories reported</small></article><article><span>📡</span><strong>{statusEntries.reduce((total, [, value]) => total + value, 0)}</strong><small>Visible status records</small></article></div>
      <div className="insights-grid"><section><p className="signal-label">Issue categories</p><h2>What people are reporting</h2><div className="insight-bars">{categoryEntries.map(([label, count]) => <div key={label}><span>{label}</span><i><b style={{ width: `${(count / maxCategory) * 100}%` }} /></i><strong>{count}</strong></div>)}</div></section><section><p className="signal-label">Status overview</p><h2>Where reports are in the journey</h2><div className="insight-bars">{statusEntries.map(([label, count]) => <div key={label}><span>{label}</span><i><b style={{ width: `${(count / maxStatus) * 100}%` }} /></i><strong>{count}</strong></div>)}</div></section><section className="areas-card"><p className="signal-label"><MapPinned size={15} /> Frequently reported areas</p><h2>General areas with recurring reports</h2>{insights.top_areas.length ? <ol>{insights.top_areas.map((entry, index) => <li key={entry.area}><span>0{index + 1}</span><strong>{entry.area}</strong><small>{entry.count} report{entry.count === 1 ? "" : "s"}</small></li>)}</ol> : <p>No public area patterns are available yet.</p>}</section></div>
      <p className="insights-footnote">These are aggregate community patterns, not performance promises or official statistics.</p>
    </div>
  );
}
