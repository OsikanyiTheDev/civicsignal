"use client";

import Link from "next/link";
import { Bell, ClipboardCheck, LogIn, LogOut, Menu, Radio, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthControl } from "@/components/auth-control";

const navItems = [
  ["Live board", "/#board"],
  ["How it works", "/#how-it-works"],
  ["Insights", "/insights"],
  ["Safety", "/#safety"],
] as const;

type AuthState = {
  available: boolean;
  authenticated: boolean;
  email?: string | null;
  groups?: string[];
};

export function CivicHeader() {
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data: AuthState) => setAuth(data))
      .catch(() => setAuth({ available: false, authenticated: false }));
  }, []);

  const canModerate = auth?.groups?.some((group) => ["Moderator", "Administrator", "Responder"].includes(group));
  const closeMenu = () => setOpen(false);

  return (
    <header className="civic-header">
      <div className="shell civic-nav-shell">
        <Link className="civic-brand" href="/" aria-label="CivicSignal home">
          <span className="civic-brand-mark" aria-hidden="true"><Radio size={18} /></span>
          <span>
            <strong>CivicSignal</strong>
            <small>Community response board</small>
          </span>
        </Link>

        <nav className="civic-desktop-nav" aria-label="Primary navigation">
          {navItems.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>

        <div className="civic-nav-actions">
          <AuthControl />
          <Link className="civic-button civic-button-small" href="/#report">Report an issue <span aria-hidden="true">↗</span></Link>
          <div className="mobile-account-control">
            {auth?.authenticated ? (
              <button type="button" onClick={() => setOpen(true)} aria-label="Open account navigation"><UserRound size={15} /> Account</button>
            ) : (
              <Link href="/signin"><LogIn size={15} /> Sign in</Link>
            )}
          </div>
          <button
            type="button"
            className="civic-menu-button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="civic-mobile-navigation"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div className={`civic-mobile-nav ${open ? "is-open" : ""}`} id="civic-mobile-navigation">
        <nav className="shell" aria-label="Mobile navigation">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} onClick={closeMenu}>{label}</Link>
          ))}
          <Link href="/#report" onClick={closeMenu}>Report an issue ↗</Link>
          <div className="mobile-account-menu">
            {auth?.authenticated ? (
              <>
                <p>👋 Signed in{auth.email ? ` as ${auth.email}` : ""}</p>
                <Link href="/following" onClick={closeMenu}><Bell size={15} /> My issues</Link>
                {canModerate ? <Link href="/moderator" onClick={closeMenu}><ClipboardCheck size={15} /> Operations desk</Link> : null}
                <Link href="/api/auth/logout" onClick={closeMenu}><LogOut size={15} /> Sign out</Link>
              </>
            ) : (
              <Link href="/signin" onClick={closeMenu}><LogIn size={15} /> Sign in for photo evidence</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
