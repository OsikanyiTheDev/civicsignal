"use client";

import { ArrowUpRight, CheckCheck, Filter, MessageCircleMore, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  categoryMeta,
  demoIncidents,
  incidentCategories,
  incidentFromApi,
  incidentStatuses,
  type ApiIncident,
  type Incident,
  type IncidentCategory,
  type IncidentStatus,
} from "@/data/incidents";
import { ReportIssueForm } from "@/components/report-issue-form";

const allCategories = "All categories" as const;
const allStatuses = "All statuses" as const;

export function LiveSignalBoard() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_CIVICSIGNAL_API_URL?.replace(/\/$/, "");
  const [incidents, setIncidents] = useState<Incident[]>(demoIncidents);
  const [category, setCategory] = useState<IncidentCategory | typeof allCategories>(allCategories);
  const [status, setStatus] = useState<IncidentStatus | typeof allStatuses>(allStatuses);
  const [search, setSearch] = useState("");
  const [boardMode, setBoardMode] = useState<"demo" | "loading" | "aws" | "fallback">(apiBaseUrl ? "loading" : "demo");

  useEffect(() => {
    if (!apiBaseUrl) return;

    const controller = new AbortController();
    async function loadAwsBoard() {
      try {
        const response = await fetch(`${apiBaseUrl}/incidents`, { signal: controller.signal });
        const data = await response.json() as { incidents?: ApiIncident[] };
        if (!response.ok || !Array.isArray(data.incidents)) {
          throw new Error("The API response was not usable.");
        }
        setIncidents(data.incidents.map(incidentFromApi));
        setBoardMode("aws");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setBoardMode("fallback");
        }
      }
    }

    void loadAwsBoard();
    return () => controller.abort();
  }, [apiBaseUrl]);

  const visibleIncidents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return incidents.filter((incident) => {
      const categoryMatches = category === allCategories || incident.category === category;
      const statusMatches = status === allStatuses || incident.status === status;
      const queryMatches = !query || [incident.title, incident.area, incident.category, incident.status].join(" ").toLocaleLowerCase().includes(query);
      return categoryMatches && statusMatches && queryMatches;
    });
  }, [category, incidents, search, status]);

  const counts = incidentStatuses.reduce<Record<IncidentStatus, number>>((result, item) => {
    result[item] = incidents.filter((incident) => incident.status === item).length;
    return result;
  }, { Submitted: 0, Verified: 0, "In progress": 0, Resolved: 0 });

  return (
    <section className="signal-workspace" id="board" aria-label="Community signal board">
      <div className="signal-workspace-header">
        <div>
          <p className="signal-label"><span className="pulse-dot" /> Live community board</p>
          <h2>See the signals. Understand the status. Keep the response visible.</h2>
        </div>
        <div className="status-snapshot" aria-label="Incident status summary">
          <span><b>{counts.Submitted}</b> new</span>
          <span><b>{counts.Verified}</b> verified</span>
          <span><b>{counts["In progress"]}</b> active</span>
          <span><b>{counts.Resolved}</b> resolved</span>
        </div>
      </div>

      <div className="signal-layout">
        <div className="signal-board-panel">
          <div className="signal-filterbar">
            <label className="signal-search"><Search size={17} /><span className="sr-only">Search incidents</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by issue, area or status" /></label>
            <label className="signal-select"><Filter size={16} /><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value as IncidentCategory | typeof allCategories)}><option>{allCategories}</option>{incidentCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="signal-select"><SlidersHorizontal size={16} /><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => setStatus(event.target.value as IncidentStatus | typeof allStatuses)}><option>{allStatuses}</option>{incidentStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>

          <div className="signal-board-title-row">
            <span>Showing {visibleIncidents.length} signal{visibleIncidents.length === 1 ? "" : "s"}</span>
            <span>{boardMode === "aws" ? "☁️ Live AWS development data" : boardMode === "loading" ? "Connecting to AWS API…" : boardMode === "fallback" ? "⚠️ API unavailable · demo data shown" : "Public demo data · no live incident feed"}</span>
          </div>
          <div className="signal-list">
            {visibleIncidents.map((incident) => {
              const meta = categoryMeta[incident.category];
              return (
                <article className={`signal-card accent-${meta.accent}`} key={incident.id}>
                  <div className="signal-card-icon" aria-hidden="true">{incident.emoji}</div>
                  <div className="signal-card-main">
                    <div className="signal-card-meta"><span>{incident.id}</span><span>{incident.reportedAt}</span></div>
                    <h3>{incident.title}</h3>
                    <p>{incident.summary}</p>
                    <div className="signal-card-tags"><span>{incident.category}</span><span>📍 {incident.area}</span><span>💬 {incident.updates} update{incident.updates === 1 ? "" : "s"}</span></div>
                  </div>
                  <div className="signal-card-side">
                    <span className={`status-badge status-${incident.status.toLowerCase().replaceAll(" ", "-")}`}>{incident.status}</span>
                    <span className={`urgency urgency-${incident.urgency.toLowerCase()}`}>{incident.urgency}</span>
                    <button type="button" aria-label={`View ${incident.id} details`} title="Details route will be connected to the AWS API"><ArrowUpRight size={17} /></button>
                  </div>
                </article>
              );
            })}
            {visibleIncidents.length === 0 ? <div className="empty-signals"><CheckCheck size={22} /><p>No signals match that filter. Try a different category or status.</p></div> : null}
          </div>
        </div>

        <aside className="signal-report-panel" id="report">
          <ReportIssueForm apiBaseUrl={apiBaseUrl} onIncidentCreated={(incident) => {
            setIncidents((current) => [incident, ...current]);
            if (apiBaseUrl) setBoardMode("aws");
          }} />
          <div className="report-panel-footer"><MessageCircleMore size={16} /><span>Public reports enter a moderation path before any official response is displayed.</span></div>
        </aside>
      </div>
    </section>
  );
}
