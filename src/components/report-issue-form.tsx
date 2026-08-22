"use client";

import Link from "next/link";
import { CheckCircle2, ImagePlus, LogIn, Send, ShieldAlert } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

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
  existingIncidents?: Incident[];
  onIncidentCreated?: (incident: Incident) => void;
};

type CreateIncidentResponse = {
  incident: ApiIncident;
  message: string;
};

type PresignedPost = {
  url: string;
  fields: Record<string, string>;
};

type EvidenceReportResponse = CreateIncidentResponse & {
  evidence_upload: PresignedPost;
};

type AuthState = {
  available: boolean;
  authenticated: boolean;
};

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;

export function ReportIssueForm({ apiBaseUrl, existingIncidents = [], onIncidentCreated }: ReportIssueFormProps) {
  const [category, setCategory] = useState<IncidentCategory>("Drainage");
  const [titleDraft, setTitleDraft] = useState("");
  const [areaDraft, setAreaDraft] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedWithPhoto, setSubmittedWithPhoto] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; accuracyMeters?: number } | null>(null);
  const [exactLocationPublicConsent, setExactLocationPublicConsent] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [draftNotice, setDraftNotice] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const isAwsConnected = Boolean(apiBaseUrl);
  const potentialDuplicates = useMemo(() => {
    const normalizedArea = areaDraft.trim().toLowerCase();
    const titleWords = titleDraft.toLowerCase().split(/\s+/).filter((word) => word.length > 3);
    if (!normalizedArea && titleWords.length < 2) return [];
    return existingIncidents.filter((incident) => {
      if (incident.category !== category) return false;
      const areaMatch = normalizedArea.length > 2 && incident.area.toLowerCase().includes(normalizedArea);
      const titleMatch = titleWords.filter((word) => incident.title.toLowerCase().includes(word)).length >= 2;
      return areaMatch || titleMatch;
    }).slice(0, 3);
  }, [areaDraft, category, existingIncidents, titleDraft]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data: AuthState) => setAuth(data))
      .catch(() => setAuth({ available: false, authenticated: false }));
  }, []);

  function useExactLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not available in this browser. You can still enter a general area or landmark.");
      return;
    }

    setIsLocating(true);
    setLocationMessage("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedLocation({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracyMeters: Number(position.coords.accuracy.toFixed(1)),
        });
        setLocationMessage(`Exact public pin added. Reported GPS accuracy is about ${Math.round(position.coords.accuracy)} metres.`);
        setIsLocating(false);
      },
      () => {
        setLocationMessage("Location permission was not granted. You can still report using the area or landmark field.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  function saveDraft() {
    const form = formRef.current;
    if (!form) return;
    const fields = new FormData(form);
    const draft = {
      title: titleDraft,
      area: areaDraft,
      summary: String(fields.get("summary") || ""),
      category,
      urgency: String(fields.get("urgency") || "Medium"),
    };
    window.localStorage.setItem("civicsignal-report-draft", JSON.stringify(draft));
    setDraftNotice("Draft saved on this device.");
  }

  function restoreDraft() {
    try {
      const raw = window.localStorage.getItem("civicsignal-report-draft");
      if (!raw) {
        setDraftNotice("No saved draft was found on this device.");
        return;
      }
      const draft = JSON.parse(raw) as { title?: string; area?: string; summary?: string; category?: IncidentCategory; urgency?: string };
      setTitleDraft(draft.title || "");
      setAreaDraft(draft.area || "");
      if (draft.category) setCategory(draft.category);
      const form = formRef.current;
      const summaryInput = form?.elements.namedItem("summary") as HTMLTextAreaElement | null;
      const urgencyInput = form?.elements.namedItem("urgency") as HTMLSelectElement | null;
      if (summaryInput) summaryInput.value = draft.summary || "";
      if (urgencyInput && draft.urgency) urgencyInput.value = draft.urgency;
      setDraftNotice("Draft restored. Review it before sending.");
    } catch {
      setDraftNotice("The saved draft could not be restored.");
    }
  }

  async function uploadPrivateEvidence(upload: PresignedPost, file: File) {
    const uploadBody = new FormData();
    Object.entries(upload.fields).forEach(([key, value]) => uploadBody.append(key, value));
    uploadBody.append("file", file);

    const uploadResponse = await fetch(upload.url, {
      method: "POST",
      body: uploadBody,
    });

    if (!uploadResponse.ok) {
      throw new Error("The photo could not be uploaded. Your report was not published with photo evidence.");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("title") || "").trim();
    const area = String(form.get("area") || "").trim();
    const summary = String(form.get("summary") || "").trim();
    const urgency = String(form.get("urgency") || "Medium") as Incident["urgency"];
    const reportPayload = {
      title,
      area,
      summary,
      category,
      urgency,
      website: String(form.get("website") || ""),
      location_precision: selectedLocation ? "exact_public" : "area_only",
      exact_location_public_consent: selectedLocation ? exactLocationPublicConsent : undefined,
      ...(selectedLocation ? {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        location_accuracy_meters: selectedLocation.accuracyMeters,
      } : {}),
    };

    setError("");
    if (selectedLocation && !exactLocationPublicConsent) {
      setError("Please confirm that the exact location pin may be visible publicly, or remove the location pin.");
      return;
    }
    setIsSending(true);

    try {
      if (evidenceFile) {
        if (!isAwsConnected) {
          throw new Error("Photo evidence is available after the live reporting service is connected.");
        }
        if (!auth?.available || !auth.authenticated) {
          throw new Error("Please sign in with a verified email before attaching private photo evidence.");
        }
        if (!ACCEPTED_IMAGE_TYPES.has(evidenceFile.type)) {
          throw new Error("Use a JPG, PNG, or WebP image for photo evidence.");
        }
        if (evidenceFile.size > MAX_EVIDENCE_BYTES) {
          throw new Error("Photo evidence must be 5 MB or smaller.");
        }

        const response = await fetch("/api/reports/with-evidence", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...reportPayload, evidence_content_type: evidenceFile.type }),
        });
        const data = await response.json() as EvidenceReportResponse | { message?: string };
        if (!response.ok || !("incident" in data) || !("evidence_upload" in data)) {
          throw new Error(data.message || "The report could not be submitted with photo evidence.");
        }

        await uploadPrivateEvidence(data.evidence_upload, evidenceFile);
        onIncidentCreated?.(incidentFromApi(data.incident));
        setSubmittedWithPhoto(true);
      } else if (apiBaseUrl) {
        const response = await fetch(`${apiBaseUrl}/incidents`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(reportPayload),
        });
        const data = await response.json() as CreateIncidentResponse | { message?: string };
        if (!response.ok || !("incident" in data)) {
          throw new Error(data.message || "The reporting service could not accept this report.");
        }
        onIncidentCreated?.(incidentFromApi(data.incident));
        setSubmittedWithPhoto(false);
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 350));
        onIncidentCreated?.({
          id: `CS-DEMO-${String(Date.now()).slice(-4)}`,
          title,
          category,
          status: "Submitted",
          area,
          reportedAt: "Just now · practice mode",
          summary,
          urgency,
          emoji: categoryMeta[category].emoji,
          updates: 1,
          location: selectedLocation ? { ...selectedLocation, precision: "exact_public" } : undefined,
          statusHistory: [{ status: "Submitted", at: new Date().toISOString(), note: "Report received" }],
        });
        setSubmittedWithPhoto(false);
      }

      formElement.reset();
      setTitleDraft("");
      setAreaDraft("");
      setEvidenceFile(null);
      setSelectedLocation(null);
      setExactLocationPublicConsent(false);
      setLocationMessage("");
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
          <p className="signal-label">Report received</p>
          <h3>{isAwsConnected ? "Your report has been received." : "Your practice report is now on the board."}</h3>
          <p>{submittedWithPhoto ? "Your photo evidence was uploaded privately for review. It will not appear automatically on the public board." : isAwsConnected ? "Your report is now marked Submitted and can be followed on the board. A Submitted status means it has been received; it does not imply an official response or resolution." : "Practice mode lets you explore how reporting works without sending a live community report."}</p>
          <button className="text-action" type="button" onClick={() => setSubmitted(false)}>Submit another report →</button>
        </div>
      </div>
    );
  }

  const photoEvidenceReady = isAwsConnected && auth?.available && auth.authenticated;

  return (
    <form className="report-form" ref={formRef} onSubmit={submit}>
      <label className="honeypot-field" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
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
          <input name="area" required minLength={2} maxLength={80} value={areaDraft} onChange={(event) => setAreaDraft(event.target.value)} placeholder="For example: East Market" />
        </label>
      </div>

      <div className="location-control">
        <div>
          <span>Exact public location <small>Optional</small></span>
          <p>Use your current GPS location to help people find the issue. This exact pin will be visible publicly in the issue detail page and Google Maps link.</p>
        </div>
        <button type="button" className="location-button" onClick={useExactLocation} disabled={isLocating}>{isLocating ? "Finding location…" : selectedLocation ? "📍 Exact pin added" : "📍 Use my current location"}</button>
        {selectedLocation ? <label className="location-consent"><input type="checkbox" checked={exactLocationPublicConsent} onChange={(event) => setExactLocationPublicConsent(event.target.checked)} /> <span>I understand this exact location will be visible publicly.</span></label> : null}
        {locationMessage ? <small className="location-message">{locationMessage} {selectedLocation ? <button type="button" onClick={() => { setSelectedLocation(null); setExactLocationPublicConsent(false); setLocationMessage(""); }}>Remove pin</button> : null}</small> : null}
      </div>

      <label>
        <span>Short issue title</span>
        <input name="title" required minLength={8} maxLength={110} value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} placeholder="For example: Blocked drainage near pedestrian crossing" />
      </label>

      {potentialDuplicates.length ? <div className="duplicate-suggestions"><span>🔁 Possible related reports</span><p>Before creating a new report, check whether one of these already describes the same issue.</p>{potentialDuplicates.map((incident) => <Link href={`/incidents/${incident.id}`} key={incident.id}>{incident.emoji} <strong>{incident.title}</strong><small>{incident.area} · {incident.status}</small></Link>)}</div> : null}

      <label>
        <span>What is happening?</span>
        <textarea name="summary" required minLength={20} maxLength={600} rows={4} placeholder="Describe the issue, its impact, and anything a reviewer should know. Avoid names, phone numbers, and home addresses." />
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
        <div className="evidence-control">
          <span>Photo evidence <small>Optional · private review only</small></span>
          {auth === null ? <div className="evidence-state"><ImagePlus size={17} /> Checking sign-in…</div> : photoEvidenceReady ? (
            <label className="file-picker"><ImagePlus size={17} /><span>{evidenceFile ? evidenceFile.name : "Choose a JPG, PNG, or WebP photo"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setEvidenceFile(event.target.files?.[0] || null)} /></label>
          ) : auth?.available ? (
            <a className="evidence-sign-in" href="/signin"><LogIn size={16} /> Sign in to attach a private photo</a>
          ) : (
            <div className="evidence-state"><ImagePlus size={17} /> Photo sign-in is being prepared</div>
          )}
          <small className="evidence-help">Photos must be JPG, PNG, or WebP and no larger than 5 MB.</small>
        </div>
      </div>

      <p className="privacy-guidance"><ShieldAlert size={15} /> CivicSignal is not an emergency service. For immediate danger, contact local emergency services. Do not submit medical, financial, or sensitive personal information.</p>
      {error ? <p className="report-error" role="alert">⚠️ {error}</p> : null}
      <div className="draft-actions"><button type="button" onClick={saveDraft}>Save draft on this device</button><button type="button" onClick={restoreDraft}>Restore saved draft</button></div>
      {draftNotice ? <p className="draft-notice" role="status">💾 {draftNotice}</p> : null}
      <button className="civic-button report-submit" type="submit" disabled={isSending}>
        <Send size={16} /> {isSending ? "Sending report…" : isAwsConnected ? "Send report" : "Add practice report"}
      </button>
    </form>
  );
}
