"use client";
/* eslint-disable @next/next/no-img-element */

import { Check, Eye, ImageOff, LoaderCircle, RefreshCw, ShieldAlert, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { categoryMeta, incidentFromApi, incidentStatuses, type ApiIncident, type IncidentStatus } from "@/data/incidents";

type ModerationIncident = ApiIncident & {
  evidence_status?: string;
  evidence_review_note?: string;
};

export function ModerationDesk() {
  const [incidents, setIncidents] = useState<ModerationIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<{ id: string; url: string } | null>(null);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/moderation/incidents", { cache: "no-store" });
      const data = await response.json() as { incidents?: ModerationIncident[]; message?: string };
      if (!response.ok || !data.incidents) throw new Error(data.message || "Unable to load the operations queue.");
      setIncidents(data.incidents);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load the operations queue.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    async function initialLoad() {
      try {
        const response = await fetch("/api/moderation/incidents", { cache: "no-store" });
        const data = await response.json() as { incidents?: ModerationIncident[]; message?: string };
        if (!response.ok || !data.incidents) throw new Error(data.message || "Unable to load the operations queue.");
        if (active) setIncidents(data.incidents);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load the operations queue.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void initialLoad();
    return () => { active = false; };
  }, []);

  async function viewEvidence(id: string) {
    setBusyId(id); setError("");
    try {
      const response = await fetch(`/api/moderation/incidents/${id}/evidence`);
      const data = await response.json() as { evidence_url?: string; message?: string };
      if (!response.ok || !data.evidence_url) throw new Error(data.message || "Unable to load private evidence.");
      setSelectedEvidence({ id, url: data.evidence_url });
    } catch (viewError) {
      setError(viewError instanceof Error ? viewError.message : "Unable to load private evidence.");
    } finally { setBusyId(""); }
  }

  async function reviewEvidence(id: string, decision: "Approved" | "Rejected") {
    const note = window.prompt(`Optional ${decision.toLowerCase()} note for this evidence:`, "") || "Evidence reviewed";
    setBusyId(id); setError("");
    try {
      const response = await fetch(`/api/moderation/incidents/${id}/review`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision, note }),
      });
      const data = await response.json() as { message?: string };
      if (!response.ok) throw new Error(data.message || "Unable to review evidence.");
      setSelectedEvidence(null);
      await load();
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Unable to review evidence.");
    } finally { setBusyId(""); }
  }

  async function updateStatus(id: string, status: IncidentStatus) {
    setBusyId(id); setError("");
    try {
      const response = await fetch(`/api/moderation/incidents/${id}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, note: `Status changed to ${status}` }),
      });
      const data = await response.json() as { message?: string };
      if (!response.ok) throw new Error(data.message || "Unable to update report status.");
      await load();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to update report status.");
    } finally { setBusyId(""); }
  }

  const evidenceQueue = incidents.filter((incident) => incident.evidence_status && incident.evidence_status !== "Approved" && incident.evidence_status !== "Rejected");

  if (loading) return <div className="moderation-loading"><LoaderCircle size={22} /> Loading operations queue…</div>;
  if (error && incidents.length === 0) return <div className="moderation-error"><ShieldAlert size={24} /><h2>Operations access is unavailable.</h2><p>{error}</p><button className="civic-button" type="button" onClick={load}>Try again</button></div>;

  return (
    <div className="moderation-desk">
      <div className="moderation-desk-header"><div><p className="signal-label">Verified operations</p><h1>Community review desk</h1><p>Review private evidence, update report status, and keep public information accurate.</p></div><button className="moderation-refresh" type="button" onClick={load}><RefreshCw size={16} /> Refresh</button></div>
      {error ? <p className="moderation-inline-error">⚠️ {error}</p> : null}
      <div className="moderation-summary"><span><b>{incidents.length}</b> reports</span><span><b>{evidenceQueue.length}</b> private photos awaiting review</span><span><b>{incidents.filter((item) => item.status === "Submitted").length}</b> submitted reports</span></div>
      <div className="moderation-list">
        {incidents.map((raw) => {
          const incident = incidentFromApi(raw);
          const meta = categoryMeta[incident.category];
          const busy = busyId === incident.id;
          return <article className={`moderation-card accent-${meta.accent}`} key={incident.id}>
            <div className="moderation-card-top"><span>{incident.emoji}</span><div><strong>{incident.title}</strong><small>{incident.id} · 📍 {incident.area}</small></div><span className={`status-badge status-${incident.status.toLowerCase().replaceAll(" ", "-")}`}>{incident.status}</span></div>
            <p>{incident.summary}</p>
            <div className="moderation-actions"><label>Status<select value={incident.status} onChange={(event) => void updateStatus(incident.id, event.target.value as IncidentStatus)} disabled={busy}>{incidentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>{raw.evidence_status ? <div className="evidence-review-actions"><span>📷 {raw.evidence_status}</span><button type="button" disabled={busy} onClick={() => void viewEvidence(incident.id)}><Eye size={15} /> Review photo</button>{raw.evidence_status !== "Approved" && raw.evidence_status !== "Rejected" ? <><button type="button" disabled={busy} className="approve" onClick={() => void reviewEvidence(incident.id, "Approved")}><Check size={15} /> Approve</button><button type="button" disabled={busy} className="reject" onClick={() => void reviewEvidence(incident.id, "Rejected")}><ImageOff size={15} /> Reject</button></> : null}</div> : <span className="no-evidence">No photo evidence</span>}</div>
          </article>;
        })}
      </div>
      {selectedEvidence ? <div className="evidence-modal" role="dialog" aria-modal="true" aria-label="Private evidence review"><div><button className="evidence-modal-close" type="button" onClick={() => setSelectedEvidence(null)} aria-label="Close private evidence"><X size={18} /></button><p className="signal-label">Private evidence · {selectedEvidence.id}</p><img src={selectedEvidence.url} alt="Private evidence for moderation review" /><p>Do not download, redistribute, or publish this image unless it passes your moderation and privacy policy.</p></div></div> : null}
    </div>
  );
}
