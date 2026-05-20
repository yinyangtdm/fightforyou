"use client"

import { useState, useRef } from "react"
import { Turnstile } from "@marsidev/react-turnstile"
import type { TurnstileInstance } from "@marsidev/react-turnstile"

const SUBJECTS = [
  "General Inquiry",
  "Report an Error",
  "Attorney Listing Request",
  "Press / Media",
  "Other",
]

function isValidEmail(val: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
}

type FormState = { name: string; email: string; subject: string; message: string }
type Errors = Partial<Record<keyof FormState, string>>

function validate(form: FormState): Errors {
  const errs: Errors = {}
  if (!form.name.trim()) errs.name = "Name is required."
  if (!form.email.trim()) errs.email = "Email is required."
  else if (!isValidEmail(form.email)) errs.email = "Enter a valid email address."
  if (!form.subject) errs.subject = "Please select a subject."
  if (!form.message.trim()) errs.message = "Message is required."
  else if (form.message.trim().length < 20) errs.message = `At least 20 characters required (${form.message.trim().length}/20).`
  return errs
}

export default function GeneralContactForm() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    const updated = { ...form, [name]: value }
    setForm(updated)
    if (touched[name as keyof FormState]) setErrors(validate(updated))
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const name = e.target.name as keyof FormState
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(validate(form))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const allTouched = Object.fromEntries(Object.keys(form).map(k => [k, true])) as Record<keyof FormState, boolean>
    setTouched(allTouched)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setServerError("")
    setLoading(true)
    try {
      const res = await fetch("/api/contact-general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      })
      if (!res.ok) {
        const data = await res.json()
        setServerError(data.error || "Something went wrong. Please try again.")
      } else {
        setSubmitted(true)
      }
    } catch {
      setServerError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    }
  }

  if (submitted) {
    return (
      <div className="contact-success">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h2>Message Sent</h2>
        <p>Thanks for reaching out. We'll get back to you as soon as possible.</p>
      </div>
    )
  }

  const msgLen = form.message.trim().length
  const msgMax = 2000

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className={`contact-field${errors.name && touched.name ? " contact-field--error" : ""}`}>
        <label htmlFor="gc-name">Full Name</label>
        <input id="gc-name" name="name" type="text" autoComplete="name"
          value={form.name} onChange={handleChange} onBlur={handleBlur} placeholder="Your full name" />
        {errors.name && touched.name && <span className="contact-field-error">{errors.name}</span>}
      </div>

      <div className={`contact-field${errors.email && touched.email ? " contact-field--error" : ""}`}>
        <label htmlFor="gc-email">Email Address</label>
        <input id="gc-email" name="email" type="email" autoComplete="email"
          value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="you@example.com" />
        {errors.email && touched.email && <span className="contact-field-error">{errors.email}</span>}
      </div>

      <div className={`contact-field${errors.subject && touched.subject ? " contact-field--error" : ""}`}>
        <label htmlFor="gc-subject">Subject</label>
        <select id="gc-subject" name="subject" value={form.subject} onChange={handleChange} onBlur={handleBlur}>
          <option value="">Select a subject…</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.subject && touched.subject && <span className="contact-field-error">{errors.subject}</span>}
      </div>

      <div className={`contact-field contact-field--message${errors.message && touched.message ? " contact-field--error" : ""}`}>
        <label htmlFor="gc-message">Message</label>
        <textarea id="gc-message" name="message" value={form.message}
          onChange={handleChange} onBlur={handleBlur}
          placeholder="How can we help?"
          maxLength={msgMax} />
        <div className="contact-message-meta">
          {errors.message && touched.message
            ? <span className="contact-field-error">{errors.message}</span>
            : <span />}
          <span className={`contact-char-count${msgLen > msgMax - 100 ? " contact-char-count--warn" : ""}`}>
            {msgLen}/{msgMax}
          </span>
        </div>
      </div>

      {siteKey && (
        <Turnstile ref={turnstileRef} siteKey={siteKey}
          onSuccess={setTurnstileToken} onExpire={() => setTurnstileToken(null)}
          options={{ theme: "dark" }} />
      )}

      {serverError && <p className="contact-error" role="alert">{serverError}</p>}

      <button type="submit" className="btn-primary contact-submit"
        disabled={loading || (!!siteKey && !turnstileToken)}>
        {loading ? "Sending…" : "Send Message"}
      </button>
    </form>
  )
}
