"use client";

import { CheckCircle2, ImagePlus, Send, ShieldAlert } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  categoryMeta,
  incidentCategories,
  incidentFromApi,
  type ApiIncident,
  type Incident,
  type IncidentCategory,
} from "@/data/incidents";

type ReportIssueFormProps = {
  apiBaseUrl?: string;
  onIncidentCreated?: (incident: Incident) => void;
};

type CreateIncidentResponse = {
  incident: ApiIncident;
  message: string;
};

export function ReportIssueForm({ apiBaseUrl, onIncidentCreated }: ReportIssueFormProps) {
  const [category, setCategory] = useState<IncidentCategory>("Drainage");
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const isAwsConnected = Boolean(apiBaseUrl);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("title") || "").trim();
    const area = String(form.get("area") || "").trim();
    const summary = String(form.get("summary") || "").trim();
    const urgency = String(form.get("urgency") || "Medium") as Incident["urgency"];

    setError("");
    setIsSending(true);

    try {
      if (apiBaseUrl) {
        const response = await fetch(`${apiBaseUrl}/incidents`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, area, summary, category, urgency }),
        });
        const data = await response.json() as CreateIncidentResponse | { message?: string };
        if (!response.ok || !("incident" in data)) {
          throw new Error(data.message || "The AWS API could not accept this report.");
        }
        onIncidentCreated?.(incidentFromApi(data.incident));
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 350));
        onIncidentCreated?.({
          id: `CS-DEMO-${String(Date.now()).slice(-4)}`,
          title,
          category,
          status: "Submitted",
          area,
          reportedAt: "Just now · demo mode",
          summary,
          urgency,
          emoji: categoryMeta[category].emoji,
          updates: 1,
        });
      }

      formElement.reset();
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to submit this report. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  if (submitted) {
    return (
      <div className="report-success" role="status">
        <CheckCircle2 size={27} />
        <div>
          <p className="signal-label">Signal received</p>
          <h3>{isAwsConnected ? "Your report has been received." : "Your practice report is now on the board."}</h3>
          <p>{isAwsConnected ? "Your report is now marked Submitted and can be followed on the board. A Submitted status means it has been received; it does not imply an official response or resolution." : "Practice mode lets you explore how reporting works without sending a live community report."}</p>
          <button className="text-action" type="button" onClick={() => setSubmitted(false)}>Submit another report →</button>
        </div>
      </div>
    );
  }

  return (
    <form className="report-form" onSubmit={submit}>
      <div className="report-form-heading">
        <div>
          <p className="signal-label">Create a community signal</p>
          <h3>Report an issue without exposing unnecessary personal data.</h3>
        </div>
        <span className="demo-pill">{isAwsConnected ? "Ready to submit" : "Practice mode"}</span>
      </div>

      <div className="report-form-grid">
        <label>
          <span>Issue category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as IncidentCategory)}>
            {incidentCategories.map((item) => <option key={item} value={item}>{categoryMeta[item].emoji} {item}</option>)}
          </select>
        </label>
        <label>
          <span>Area or landmark</span>
          <input name="area" required minLength={2} maxLength={80} placeholder="For example: East Market" />
        </label>
      </div>

      <label>
        <span>Short issue title</span>
        <input name="title" required minLength={8} maxLength={110} placeholder="For example: Blocked drainage near pedestrian crossing" />
      </label>

      <label>
        <span>What is happening?</span>
        <textarea name="summary" required minLength={20} maxLength={600} rows={4} placeholder="Describe the issue, its impact, and anything a verifier should know. Avoid names, phone numbers, and home addresses." />
      </label>

      <div className="report-form-grid report-form-bottom">
        <label>
          <span>Estimated urgency</span>
          <select name="urgency" defaultValue="Medium">
            <option value="Low">Low — inconvenience or maintenance need</option>
            <option value="Medium">Medium — recurring or safety concern</option>
            <option value="High">High — immediate public-risk concern</option>
          </select>
        </label>
        <label className="upload-placeholder">
          <span>Photo evidence <small>{isAwsConnected ? "Coming next" : "Available after public launch"}</small></span>
          <div><ImagePlus size={17} /> Photo evidence is reviewed privately</div>
        </label>
      </div>

      <p className="privacy-guidance"><ShieldAlert size={15} /> CivicSignal is not an emergency service. For immediate danger, contact local emergency services. Do not submit medical, financial, or sensitive personal information.</p>
      {error ? <p className="report-error" role="alert">⚠️ {error}</p> : null}
      <button className="civic-button report-submit" type="submit" disabled={isSending}>
        <Send size={16} /> {isSending ? "Sending report…" : isAwsConnected ? "Send report" : "Add practice report"}
      </button>
    </form>
  );
}
