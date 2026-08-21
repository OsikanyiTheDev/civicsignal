"use client";

import { CheckCircle2, ImagePlus, Send, ShieldAlert } from "lucide-react";
import { FormEvent, useState } from "react";

import { categoryMeta, incidentCategories, type Incident, type IncidentCategory } from "@/data/incidents";

type ReportIssueFormProps = {
  onIncidentCreated?: (incident: Incident) => void;
};

export function ReportIssueForm({ onIncidentCreated }: ReportIssueFormProps) {
  const [category, setCategory] = useState<IncidentCategory>("Drainage");
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("title") || "Community infrastructure report").trim();
    const area = String(form.get("area") || "Unspecified area").trim();
    const summary = String(form.get("summary") || "A new community report was submitted.").trim();
    const urgency = String(form.get("urgency") || "Medium") as Incident["urgency"];

    setIsSending(true);
    window.setTimeout(() => {
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
      setIsSending(false);
      setSubmitted(true);
      formElement.reset();
    }, 450);
  }

  if (submitted) {
    return (
      <div className="report-success" role="status">
        <CheckCircle2 size={27} />
        <div>
          <p className="signal-label">Signal received</p>
          <h3>Your demonstration report is on the board.</h3>
          <p>This local preview does not send a public alert. The AWS deployment will validate, store, moderate and notify from the real API.</p>
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
        <span className="demo-pill">Demo mode</span>
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
          <input name="area" required maxLength={80} placeholder="For example: East Market" />
        </label>
      </div>

      <label>
        <span>Short issue title</span>
        <input name="title" required maxLength={110} placeholder="For example: Blocked drainage near pedestrian crossing" />
      </label>

      <label>
        <span>What is happening?</span>
        <textarea name="summary" required maxLength={600} rows={4} placeholder="Describe the issue, its impact, and anything a verifier should know. Avoid names, phone numbers, and home addresses." />
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
          <span>Photo evidence <small>Optional in AWS deployment</small></span>
          <div><ImagePlus size={17} /> Secure S3 upload path planned</div>
        </label>
      </div>

      <p className="privacy-guidance"><ShieldAlert size={15} /> CivicSignal is not an emergency service. For immediate danger, contact local emergency services. Do not submit medical, financial, or sensitive personal information.</p>
      <button className="civic-button report-submit" type="submit" disabled={isSending}>
        <Send size={16} /> {isSending ? "Sending signal…" : "Add demonstration report"}
      </button>
    </form>
  );
}
