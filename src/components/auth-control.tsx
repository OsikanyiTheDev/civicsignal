"use client";

import { Bell, ClipboardCheck, LogIn, LogOut, UserRoundCheck } from "lucide-react";
import { useEffect, useState } from "react";

type AuthState = {
  available: boolean;
  authenticated: boolean;
  email?: string | null;
  groups?: string[];
};

export function AuthControl() {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data: AuthState) => setAuth(data))
      .catch(() => setAuth({ available: false, authenticated: false }));
  }, []);

  if (!auth?.available) {
    return <span className="auth-coming-soon">Photo sign-in coming soon</span>;
  }

  if (auth.authenticated) {
    const canModerate = auth.groups?.some((group) => ["Moderator", "Administrator", "Responder"].includes(group));
    return (
      <>
        <a className="auth-control auth-control-following" href="/following"><Bell size={15} /> My issues</a>
        {canModerate ? <a className="auth-control auth-control-moderator" href="/moderator"><ClipboardCheck size={15} /> Operations desk</a> : null}
        <a className="auth-control auth-control-signed-in" href="/api/auth/logout"><UserRoundCheck size={15} /> Signed in <LogOut size={14} /></a>
      </>
    );
  }

  return <a className="auth-control" href="/signin"><LogIn size={15} /> Sign in for photo evidence</a>;
}
