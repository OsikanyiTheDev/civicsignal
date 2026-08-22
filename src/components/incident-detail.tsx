"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3, MapPinned, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { categoryMeta, incidentFromApi, type ApiIncident, type Incident, type StatusEvent } from "@/data/incidents";

type IncidentDetailProps = { id: string };

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function IncidentDetail({ id }: IncidentDetailProps) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_CIVICSIGNAL_API_URL?.replace(/\/$/, "");
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(Boolean(apiBaseUrl));
  const [error, setError] = useState(apiBaseUrl ? "" : "This issue detail page is available when the live reporting service is connected.");

  useEffect(() => {
    if (!apiBaseUrl) return;

    const controller = new AbortController();
    fetch(`${apiBaseUrl}/incidents/${id}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as { incident?: ApiIncident; message?: string };
        if (!response.ok || !data.incident) throw new Error(data.message || "Unable to load this report.");
        setIncident(incidentFromApi(data.incident));
      })
      .catch((requestError) => {
        if ((requestError as Error).name !== "AbortError") setError(requestError instanceof Error ? requestError.message : "Unable to load this report.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [apiBaseUrl, id]);

  const history = useMemo<StatusEvent[]>(() => {
    if (!incident) return [];
    return incident.statusHistory?.length ? incident.statusHistory : [{ status: incident.status, at: incident.reportedAt, note: "Current reported status" }];
  }, [incident]);

  if (loading) {
    return <main className="incident-page"><div className="shell incident-loading"><span className="pulse-dot" /> Loading community report…</div></main>;
  }

  if (error || !incident) {
    return <main className="incident-page"><div className="shell incident-empty"><ShieldCheck size={28} /><h1>We could not open this report.</h1><p>{error || "This report may no longer be available."}</p><Link className="civic-button" href="/#board"><ArrowLeft size={16} /> Back to the board</Link></div></main>;
  }

  const meta = categoryMeta[incident.category];
  const mapUrl = incident.location ? `https://www.openstreetmap.org/?mlat=${incident.location.latitude}&mlon=${incident.location.longitude}#map=15/${incident.location.latitude}/${incident.location.longitude}` : "";

  return (
    <main className="incident-page">
      <div className="shell incident-shell">
        <Link className="incident-back" href="/#board"><ArrowLeft size={16} /> Back to the community board</Link>
        <div className="incident-hero-grid">
          <section className={`incident-summary accent-${meta.accent}`}>
            <div className="incident-summary-top"><span className="incident-category-icon">{incident.emoji}</span><span className={`status-badge status-${incident.status.toLowerCase().replaceAll(" ", "-")}`}>{incident.status}</span></div>
            <p className="signal-label">Community report · {incident.id}</p>
            <h1>{incident.title}</h1>
            <p>{incident.summary}</p>
            <div className="incident-summary-meta"><span>📍 {incident.area}</span><span>⚡ {incident.urgency} priority</span><span>💬 {incident.updates} update{incident.updates === 1 ? "" : "s"}</span></div>
          </section>
          <aside className="incident-guidance"><ShieldCheck size={20} /><h2>Report status is not a promise of an official response.</h2><p>CivicSignal helps people follow what has been reported. For immediate danger, contact local emergency services.</p></aside>
        </div>

        <div className="incident-detail-grid">
          <section className="incident-timeline-card">
            <p className="signal-label"><Clock3 size={15} /> Status timeline</p>
            <h2>What has happened so far</h2>
            <ol className="incident-timeline">
              {history.map((event, index) => <li key={`${event.status}-${event.at}-${index}`}><span>{index === history.length - 1 ? "●" : "○"}</span><div><strong>{event.status}</strong><small>{event.note}</small><time>{event.at.includes("T") ? formatTime(event.at) : event.at}</time></div></li>)}
            </ol>
          </section>

          <section className="incident-location-card">
            <p className="signal-label"><MapPinned size={15} /> Location</p>
            <h2>{incident.location ? "Approximate area reference" : "General area shared"}</h2>
            <div className={`approximate-map ${incident.location ? "has-location" : ""}`}><span>📍</span><div className="map-grid" aria-hidden="true" /></div>
            <p>{incident.location ? "This pin is rounded to a general area. CivicSignal does not show exact reporter GPS coordinates publicly." : `This report identifies ${incident.area}. An approximate map pin was not shared.`}</p>
            {mapUrl ? <a className="text-action incident-map-link" href={mapUrl} target="_blank" rel="noreferrer">Open general area in a map <ArrowUpRight size={15} /></a> : null}
          </section>

          <section className="incident-evidence-card">
            <p className="signal-label">📷 Photo evidence</p>
            <h2>Private review only</h2>
            <p>Photos shared with a report remain private until a future moderation workflow approves them for public display. No raw uploaded image is shown here automatically.</p>
            <span>🔐 Helps protect people, homes, and sensitive details</span>
          </section>
        </div>
      </div>
    </main>
  );
}
