"use client";

import { Bell, HeartHandshake, LoaderCircle, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

type EngagementProps = {
  incidentId: string;
};

type AuthState = {
  available: boolean;
  authenticated: boolean;
};

export function IncidentEngagement({ incidentId }: EngagementProps) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data: AuthState) => setAuth(data))
      .catch(() => setAuth({ available: false, authenticated: false }));
  }, []);

  async function act(action: "confirm" | "follow") {
    setBusy(action); setMessage("");
    try {
      const response = await fetch(`/api/incidents/${incidentId}/${action}`, { method: "POST" });
      const data = await response.json() as { message?: string };
      setMessage(data.message || (response.ok ? "Your response was saved." : "Unable to save your response."));
    } catch {
      setMessage("Unable to contact CivicSignal right now.");
    } finally { setBusy(""); }
  }

  if (auth === null) return <div className="engagement-loading"><LoaderCircle size={15} /> Loading participation options…</div>;
  if (!auth.available) return null;
  if (!auth.authenticated) return <div className="incident-engagement"><div><strong>See this issue too?</strong><span>Sign in to confirm an issue or follow its status.</span></div><a className="civic-button civic-button-small" href="/signin"><LogIn size={15} /> Sign in</a></div>;

  return (
    <div className="incident-engagement">
      <div><strong>Help strengthen the community signal</strong><span>Confirm this issue if you have seen it, or follow it to revisit later.</span></div>
      <div className="engagement-actions"><button type="button" disabled={Boolean(busy)} onClick={() => void act("confirm")}><HeartHandshake size={15} /> {busy === "confirm" ? "Saving…" : "I see this too"}</button><button type="button" disabled={Boolean(busy)} onClick={() => void act("follow")}><Bell size={15} /> {busy === "follow" ? "Saving…" : "Follow issue"}</button></div>
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}
