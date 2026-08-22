"use client";

import Link from "next/link";
import { Bell, LoaderCircle, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { categoryMeta, incidentFromApi, type ApiIncident, type Incident } from "@/data/incidents";

export function FollowingIssues() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/me/following", { cache: "no-store" });
        const data = await response.json() as { incidents?: ApiIncident[]; message?: string };
        if (!response.ok || !data.incidents) throw new Error(data.message || "Unable to load followed issues.");
        if (active) setIncidents(data.incidents.map(incidentFromApi));
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load followed issues.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="following-loading"><LoaderCircle size={21} /> Loading your followed issues…</div>;
  if (error) return <div className="following-error"><ShieldAlert size={24} /><h2>We could not load your followed issues.</h2><p>{error}</p></div>;
  if (!incidents.length) return <div className="following-empty"><Bell size={25} /><h2>You are not following any issues yet.</h2><p>Open a report and select <strong>Follow issue</strong> to return to it later.</p><Link className="civic-button" href="/#board">Explore the community board</Link></div>;

  return <div className="following-list">{incidents.map((incident) => { const meta=categoryMeta[incident.category]; return <Link className={`following-card accent-${meta.accent}`} href={`/incidents/${incident.id}`} key={incident.id}><span>{incident.emoji}</span><div><small>{incident.status} · {incident.area}</small><strong>{incident.title}</strong><p>{incident.summary}</p></div><Bell size={17} /></Link>; })}</div>;
}
