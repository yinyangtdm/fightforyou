"use client"

import Link from "next/link"
import { useState, useEffect, useRef, useCallback } from "react"
import { STATE_NAMES, STATE_ABBRS, toSlug } from "../lib/slugs"
import { PINNED_GUIDES } from "../guides/_lib"

const ALL_STATES = Object.values(STATE_NAMES)
  .filter((name) => name !== "Washington D.C.")
  .sort()

type MenuId = "states" | "specialty" | "rights"

export default function Nav({ specialties, guides = [] }: { specialties: string[], guides?: { title: string, slug: string }[] }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const [openAccordion, setOpenAccordion] = useState<MenuId | null>(null)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark"
    return (localStorage.getItem("theme") as "dark" | "light") ?? "dark"
  })

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

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
    function onVisibilityChange() {
      if (document.hidden) { setOpenMenu(null); setMobileOpen(false) }
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [])

  useEffect(() => {
    const locked = mobileOpen || openMenu !== null
    document.documentElement.style.overflow = locked ? "hidden" : ""
    document.body.style.overflow = locked ? "hidden" : ""
    return () => {
      document.documentElement.style.overflow = ""
      document.body.style.overflow = ""
    }
  }, [mobileOpen, openMenu])

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statesRef = useRef<HTMLLIElement>(null)
  const specialtyRef = useRef<HTMLLIElement>(null)
  const rightsRef = useRef<HTMLLIElement>(null)

  function hoverOpen(id: MenuId) {
    if (mobileOpen) return
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenMenu(id)
  }

  function hoverStartClose() {
    if (mobileOpen) return
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150)
  }

  function hoverCancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const handleNavMouseMove = useCallback((e: React.MouseEvent) => {
    if (mobileOpen) return
    const x = e.clientX
    const triggers = [
      [statesRef, "states"],
      [specialtyRef, "specialty"],
      [rightsRef, "rights"],
    ] as const
    for (const [ref, id] of triggers) {
      if (!ref.current) continue
      const { left, right } = ref.current.getBoundingClientRect()
      if (x >= left && x <= right) {
        if (closeTimer.current) clearTimeout(closeTimer.current)
        setOpenMenu(prev => prev === id ? prev : id)
        return
      }
    }
  }, [mobileOpen])

  function toggleMenu(id: MenuId) {
    setOpenMenu((prev) => (prev === id ? null : id))
  }

  function toggleAccordion(id: MenuId) {
    setOpenAccordion((prev) => (prev === id ? null : id))
  }

  const glossaryEntry = PINNED_GUIDES.find(g => g.slug === "glossary")!
  const sortedGuideLinks = [
    ...PINNED_GUIDES
      .filter(g => g.slug !== "glossary")
      .map(g => ({ title: g.title, href: g.href, slug: g.slug })),
    ...guides
      .filter(g => !PINNED_GUIDES.some(p => p.slug === g.slug))
      .map(g => ({ title: g.title, href: `/guides/${g.slug}`, slug: g.slug })),
  ].sort((a, b) => a.title.localeCompare(b.title))
  sortedGuideLinks.push({ title: glossaryEntry.title, href: glossaryEntry.href, slug: glossaryEntry.slug })

  return (
    <>
      <nav className="site-nav" onMouseMove={handleNavMouseMove} onMouseLeave={hoverStartClose}>
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
          {/* Browse by State */}
          <li ref={statesRef} className={`nav-accordion-item${openAccordion === "states" ? " accordion-open" : ""}`}
            onMouseEnter={() => hoverOpen("states")}
            onMouseLeave={hoverStartClose}
          >
            <a
              href="#"
              className={`nav-accordion-trigger${openMenu === "states" ? " nav-trigger-active" : ""}`}
              onClick={(e) => {
                e.preventDefault()
                if (mobileOpen) toggleAccordion("states")
                else toggleMenu("states")
              }}
            >
              Browse by State
              <span className="nav-accordion-arrow" aria-hidden>›</span>
            </a>
            <ul className="nav-accordion-list">
              {ALL_STATES.map((state) => (
                <li key={state}><Link href={`/${STATE_ABBRS[state]}`}>{state}</Link></li>
              ))}
              <li><Link href="/dc">Washington D.C.</Link></li>
            </ul>
          </li>

          {/* Browse by Specialty */}
          <li ref={specialtyRef} className={`nav-accordion-item${openAccordion === "specialty" ? " accordion-open" : ""}`}
            onMouseEnter={() => hoverOpen("specialty")}
            onMouseLeave={hoverStartClose}
          >
            <a
              href="#"
              className={`nav-accordion-trigger${openMenu === "specialty" ? " nav-trigger-active" : ""}`}
              onClick={(e) => {
                e.preventDefault()
                if (mobileOpen) toggleAccordion("specialty")
                else toggleMenu("specialty")
              }}
            >
              Browse by Specialty
              <span className="nav-accordion-arrow" aria-hidden>›</span>
            </a>
            <ul className="nav-accordion-list">
              {specialties.map((s) => (
                <li key={s}><Link href={`/${toSlug(s)}`}>{s}</Link></li>
              ))}
            </ul>
          </li>

          {/* Know Your Rights */}
          <li ref={rightsRef} className={`nav-accordion-item${openAccordion === "rights" ? " accordion-open" : ""}`}
            onMouseEnter={() => hoverOpen("rights")}
            onMouseLeave={hoverStartClose}
          >
            <a
              href="#"
              className={`nav-accordion-trigger${openMenu === "rights" ? " nav-trigger-active" : ""}`}
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
              {sortedGuideLinks.map(g => (
                <li key={g.slug}><Link href={g.href}>{g.title}</Link></li>
              ))}
              <li><Link href="/guides">All Guides →</Link></li>
            </ul>
          </li>

          <li>
            <Link href="/admin/login" className="nav-cta">Sign In</Link>
          </li>
        </ul>

        <div className="nav-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EBCB8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      </nav>

      {/* Desktop mega menus — hidden on mobile via CSS */}
      <div className={`mega-menu${openMenu === "states" ? " open" : ""}`} onMouseEnter={hoverCancelClose} onMouseLeave={() => setOpenMenu(null)}>
        <div className="mega-menu-heading">Browse by State</div>
        <div className="mega-menu-grid">
          {ALL_STATES.map((state) => (
            <Link key={state} href={`/${STATE_ABBRS[state]}`}>{state}</Link>
          ))}
          <Link href="/dc">Washington D.C.</Link>
        </div>
      </div>

      <div className={`mega-menu${openMenu === "specialty" ? " open" : ""}`} onMouseEnter={hoverCancelClose} onMouseLeave={() => setOpenMenu(null)}>
        <div className="mega-menu-heading">Browse by Specialty</div>
        <div className="mega-menu-grid mega-menu-grid--4col">
          {specialties.map((s) => (
            <Link key={s} href={`/${toSlug(s)}`}>{s}</Link>
          ))}
        </div>
      </div>

      <div className={`mega-menu${openMenu === "rights" ? " open" : ""}`} onMouseEnter={hoverCancelClose} onMouseLeave={() => setOpenMenu(null)}>
        <div className="mega-menu-heading">Know Your Rights</div>
        <div className="mega-menu-grid mega-menu-grid--3col">
          {sortedGuideLinks.map(g => (
            <Link key={g.slug} href={g.href}>{g.title}</Link>
          ))}
          <Link href="/guides">All Guides →</Link>
        </div>
      </div>

      <div
        className={`mega-overlay${openMenu ? " open" : ""}`}
        onClick={() => setOpenMenu(null)}
      />
    </>
  )
}
