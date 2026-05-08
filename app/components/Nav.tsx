"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { STATE_NAMES, STATE_ABBRS, toSlug } from "../lib/slugs"

const ALL_STATES = Object.values(STATE_NAMES)
  .filter((name) => name !== "Washington D.C.")
  .sort()

type MenuId = "states" | "specialty" | "rights"

export default function Nav({ specialties }: { specialties: string[] }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const [openAccordion, setOpenAccordion] = useState<MenuId | null>(null)
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null
    const initial = saved ?? "dark"
    setTheme(initial)
    document.documentElement.setAttribute("data-theme", initial)
  }, [])

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.setAttribute("data-theme", next)
    localStorage.setItem("theme", next)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpenMenu(null); setMobileOpen(false) }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  function toggleMenu(id: MenuId) {
    setOpenMenu((prev) => (prev === id ? null : id))
  }

  function toggleAccordion(id: MenuId) {
    setOpenAccordion((prev) => (prev === id ? null : id))
  }

  return (
    <>
      <nav>
      <div className="nav-inner">
        <button
          className={`nav-hamburger${mobileOpen ? " open" : ""}`}
          onClick={() => { setMobileOpen((o) => !o); setOpenAccordion(null) }}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <Link href="/" className="nav-logo">
          fightfor<span>you</span>
        </Link>

        <ul className={`nav-links${mobileOpen ? " open" : ""}`}>
          {/* Attorneys by State */}
          <li className={`nav-accordion-item${openAccordion === "states" ? " accordion-open" : ""}`}>
            <a
              href="#"
              className="nav-accordion-trigger"
              onClick={(e) => {
                e.preventDefault()
                if (mobileOpen) toggleAccordion("states")
                else toggleMenu("states")
              }}
            >
              Attorneys by State
              <span className="nav-accordion-arrow" aria-hidden>›</span>
            </a>
            <ul className="nav-accordion-list">
              {ALL_STATES.map((state) => (
                <li key={state}><Link href={`/${STATE_ABBRS[state]}`}>{state}</Link></li>
              ))}
              <li><Link href="/dc">Washington D.C.</Link></li>
            </ul>
          </li>

          {/* Attorneys by Specialty */}
          <li className={`nav-accordion-item${openAccordion === "specialty" ? " accordion-open" : ""}`}>
            <a
              href="#"
              className="nav-accordion-trigger"
              onClick={(e) => {
                e.preventDefault()
                if (mobileOpen) toggleAccordion("specialty")
                else toggleMenu("specialty")
              }}
            >
              Attorneys by Specialty
              <span className="nav-accordion-arrow" aria-hidden>›</span>
            </a>
            <ul className="nav-accordion-list">
              {specialties.map((s) => (
                <li key={s}><Link href={`/${toSlug(s)}`}>{s}</Link></li>
              ))}
            </ul>
          </li>

          {/* Know Your Rights */}
          <li className={`nav-accordion-item${openAccordion === "rights" ? " accordion-open" : ""}`}>
            <a
              href="#"
              className="nav-accordion-trigger"
              onClick={(e) => {
                e.preventDefault()
                if (mobileOpen) toggleAccordion("rights")
                else toggleMenu("rights")
              }}
            >
              Know Your Rights
              <span className="nav-accordion-arrow" aria-hidden>›</span>
            </a>
            <ul className="nav-accordion-list">
              <li><a href="#">Guides coming soon.</a></li>
            </ul>
          </li>

          <li>
            <a href="#" className="nav-cta">Sign In</a>
          </li>
        </ul>

        <div className="nav-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              /* Sun — shown in dark mode to switch to light */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              /* Moon — shown in light mode to switch to dark */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <a href="#" className="nav-mobile-signin nav-cta">Sign In</a>
        </div>
      </div>
      </nav>

      {/* Desktop mega menus — hidden on mobile via CSS */}
      <div className={`mega-menu${openMenu === "states" ? " open" : ""}`}>
        <div className="mega-menu-heading">Attorneys by State</div>
        <div className="mega-menu-grid">
          {ALL_STATES.map((state) => (
            <Link key={state} href={`/${STATE_ABBRS[state]}`}>{state}</Link>
          ))}
          <Link href="/dc" className="mega-menu-dc">Washington D.C.</Link>
        </div>
      </div>

      <div className={`mega-menu${openMenu === "specialty" ? " open" : ""}`}>
        <div className="mega-menu-heading">Attorneys by Specialty</div>
        <div className="mega-menu-grid">
          {specialties.map((s) => (
            <Link key={s} href={`/${toSlug(s)}`}>{s}</Link>
          ))}
        </div>
      </div>

      <div className={`mega-menu${openMenu === "rights" ? " open" : ""}`}>
        <div className="mega-menu-heading">Know Your Rights</div>
        <p className="mega-menu-empty">Guides coming soon.</p>
      </div>

      <div
        className={`mega-overlay${openMenu ? " open" : ""}`}
        onClick={() => setOpenMenu(null)}
      />
    </>
  )
}
