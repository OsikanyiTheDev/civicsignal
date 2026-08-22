"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, MailCheck, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

type AuthMode = "signin" | "signup" | "confirm";

async function postJson(path: string, body: Record<string, string>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json() as { message?: string; confirmationRequired?: boolean; confirmed?: boolean; authenticated?: boolean };
  if (!response.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data;
}

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      await postJson("/api/auth/password-login", { email, password });
      router.replace("/?auth=signed_in");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to sign in.");
    } finally { setBusy(false); }
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      await postJson("/api/auth/signup", { email, password });
      setMode("confirm");
      setMessage("A verification code was sent to your email. Enter it below to finish setting up your account.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to create the account.");
    } finally { setBusy(false); }
  }

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      await postJson("/api/auth/confirm", { email, code });
      setMode("signin");
      setPassword("");
      setMessage("Email verified. Sign in to attach private photo evidence to a report.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to verify the email.");
    } finally { setBusy(false); }
  }

  async function resendCode() {
    setBusy(true); setError("");
    try {
      await postJson("/api/auth/resend-confirmation", { email });
      setMessage("A new verification code was sent to your email.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to resend the code.");
    } finally { setBusy(false); }
  }

  const heading = mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your CivicSignal account" : "Verify your email";
  const subheading = mode === "signin" ? "Sign in to add private photo evidence to a community report." : mode === "signup" ? "A verified email helps keep private photo evidence safer for everyone." : "Enter the code sent to your email to activate photo evidence access.";

  return (
    <main className="auth-page">
      <div className="auth-background" aria-hidden="true" />
      <div className="auth-shell">
        <Link href="/" className="auth-back"><ArrowLeft size={16} /> Back to CivicSignal</Link>
        <div className="auth-grid">
          <section className="auth-story">
            <div className="auth-brand"><span>📍</span><div><strong>CivicSignal</strong><small>Community response board</small></div></div>
            <p className="signal-label"><Sparkles size={15} /> Private evidence, thoughtful reporting</p>
            <h1>Share what you see. Keep sensitive evidence <em>private.</em></h1>
            <p>Text-only reports remain open to the community. A verified email is needed only when you choose to attach photo evidence.</p>
            <div className="auth-benefits">
              <div><ShieldCheck size={18} /><span><strong>Private by default</strong><small>Photos are not shown on the public board automatically.</small></span></div>
              <div><MailCheck size={18} /><span><strong>Verified email</strong><small>Helps create a safer path for evidence contributors.</small></span></div>
              <div><CheckCircle2 size={18} /><span><strong>Clear status</strong><small>Submitted reports remain visible without promising an official response.</small></span></div>
            </div>
          </section>

          <section className="auth-card" aria-labelledby="auth-heading">
            <div className="auth-card-top"><span className="auth-mark">🔐</span><span>{mode === "confirm" ? "Step 2 of 2" : "Verified photo evidence"}</span></div>
            <h2 id="auth-heading">{heading}</h2>
            <p>{subheading}</p>
            {message ? <p className="auth-message" role="status">✅ {message}</p> : null}
            {error ? <p className="auth-error" role="alert">⚠️ {error}</p> : null}

            {mode === "confirm" ? (
              <form className="auth-form" onSubmit={handleConfirm}>
                <label><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
                <label><span>Verification code</span><input value={code} onChange={(event) => setCode(event.target.value)} required inputMode="numeric" autoComplete="one-time-code" placeholder="Enter the code from your email" /></label>
                <button className="civic-button auth-submit" type="submit" disabled={busy}>{busy ? "Verifying…" : "Verify email"}</button>
                <button className="auth-link-button" type="button" disabled={busy} onClick={resendCode}>Send a new code</button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={mode === "signin" ? handleSignIn : handleSignUp}>
                <label><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" /></label>
                <label className="password-field"><span>Password</span><div><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={12} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="At least 12 characters" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
                {mode === "signup" ? <p className="password-hint"><KeyRound size={14} /> Use 12+ characters with upper/lowercase letters, a number, and a symbol.</p> : null}
                <button className="civic-button auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in securely" : "Create account"}</button>
              </form>
            )}

            {mode !== "confirm" ? <div className="auth-switch">{mode === "signin" ? <>New here? <button type="button" onClick={() => { setMode("signup"); setError(""); setMessage(""); }}>Create an account</button></> : <>Already have an account? <button type="button" onClick={() => { setMode("signin"); setError(""); setMessage(""); }}>Sign in</button></>}</div> : <div className="auth-switch">Already verified? <button type="button" onClick={() => setMode("signin")}>Sign in</button></div>}
            <p className="auth-footnote">CivicSignal is not an emergency service. Do not upload photos containing medical, financial, or sensitive personal information.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
