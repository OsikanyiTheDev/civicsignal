"use client";

import Link from "next/link";
import { Menu, Radio, X } from "lucide-react";
import { useState } from "react";

import { AuthControl } from "@/components/auth-control";

const navItems = [
  ["Live board", "#board"],
  ["How it works", "#how-it-works"],
  ["Architecture", "#architecture"],
  ["Safety", "#safety"],
] as const;

export function CivicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="civic-header">
      <div className="shell civic-nav-shell">
        <Link className="civic-brand" href="#top" aria-label="CivicSignal home">
          <span className="civic-brand-mark" aria-hidden="true"><Radio size={18} /></span>
          <span>
            <strong>CivicSignal</strong>
            <small>Community response board</small>
          </span>
        </Link>

        <nav className="civic-desktop-nav" aria-label="Primary navigation">
          {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>

        <div className="civic-nav-actions">
          <AuthControl />
          <a className="civic-button civic-button-small" href="#report">Report an issue <span aria-hidden="true">↗</span></a>
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
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <a href="#report" onClick={() => setOpen(false)}>Report an issue ↗</a>
        </nav>
      </div>
    </header>
  );
}
