"use client";

import { LogIn, LogOut, UserRoundCheck } from "lucide-react";
import { useEffect, useState } from "react";

type AuthState = {
  available: boolean;
  authenticated: boolean;
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
    return <a className="auth-control auth-control-signed-in" href="/api/auth/logout"><UserRoundCheck size={15} /> Signed in · Sign out <LogOut size={14} /></a>;
  }

  return <a className="auth-control" href="/api/auth/login"><LogIn size={15} /> Sign in for photo evidence</a>;
}
