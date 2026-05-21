"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Turnstile } from "@marsidev/react-turnstile"
import type { TurnstileInstance } from "@marsidev/react-turnstile"

const STATE_OPTIONS: [string, string][] = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],
  ["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],
  ["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
  ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],
  ["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],
  ["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],
  ["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],
  ["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"],
  ["DC","Washington D.C."],
]

function digitsOnly(val: string) {
  return val.replace(/\D/g, "")
}

function isValidEmail(val: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
}

type FormState = {
  name: string
  email: string
  phone: string
  city: string
  state: string
  message: string
}

type Errors = Partial<Record<keyof FormState, string>>

function validate(form: FormState): Errors {
  const errs: Errors = {}
  if (!form.name.trim()) errs.name = "Name is required."
  if (!form.email.trim()) errs.email = "Email is required."
  else if (!isValidEmail(form.email)) errs.email = "Enter a valid email address."
  if (!form.phone.trim()) errs.phone = "Phone number is required."
  else if (digitsOnly(form.phone).length < 10) errs.phone = "Enter a 10-digit phone number."
  if (!form.city.trim()) errs.city = "City is required."
  if (!form.state) errs.state = "State is required."
  if (!form.message.trim()) errs.message = "Please describe your situation."
  else if (form.message.trim().length < 50) errs.message = `At least 50 characters required (${form.message.trim().length}/50).`
  return errs
}

export default function ContactForm({ slug, attorneyName }: { slug: string; attorneyName: string }) {
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", city: "", state: "", message: "" })
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
    if (touched[name as keyof FormState]) {
      setErrors(validate(updated))
    }
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
      const res = await fetch(`/api/contact/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, attorneyName, turnstileToken }),
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
        <p>Your message has been received. {attorneyName} will be in touch with you soon.</p>
        <p className="contact-disclaimer">Submitting this form does not create an attorney-client relationship.</p>
      </div>
    )
  }

  const msgLen = form.message.trim().length
  const msgMax = 999

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className={`contact-field${errors.name && touched.name ? " contact-field--error" : ""}`}>
        <label htmlFor="contact-name">Full Name</label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Your full name"
        />
        {errors.name && touched.name && <span className="contact-field-error">{errors.name}</span>}
      </div>

      <div className={`contact-field${errors.email && touched.email ? " contact-field--error" : ""}`}>
        <label htmlFor="contact-email">Email Address</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="you@example.com"
        />
        {errors.email && touched.email && <span className="contact-field-error">{errors.email}</span>}
      </div>

      <div className={`contact-field${errors.phone && touched.phone ? " contact-field--error" : ""}`}>
        <label htmlFor="contact-phone">Phone Number</label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="(555) 000-0000"
        />
        {errors.phone && touched.phone && <span className="contact-field-error">{errors.phone}</span>}
      </div>

      <div className="contact-field-row">
        <div className={`contact-field${errors.city && touched.city ? " contact-field--error" : ""}`}>
          <label htmlFor="contact-city">City</label>
          <input
            id="contact-city"
            name="city"
            type="text"
            autoComplete="address-level2"
            value={form.city}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Your city"
          />
          {errors.city && touched.city && <span className="contact-field-error">{errors.city}</span>}
        </div>

        <div className={`contact-field${errors.state && touched.state ? " contact-field--error" : ""}`}>
          <label htmlFor="contact-state">State</label>
          <select
            id="contact-state"
            name="state"
            value={form.state}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Select…</option>
            {STATE_OPTIONS.map(([abbr, name]) => (
              <option key={abbr} value={abbr}>{name}</option>
            ))}
          </select>
          {errors.state && touched.state && <span className="contact-field-error">{errors.state}</span>}
        </div>
      </div>

      <div className={`contact-field contact-field--message${errors.message && touched.message ? " contact-field--error" : ""}`}>
        <label htmlFor="contact-message">Explain Your Legal Situation</label>
        <textarea
          id="contact-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Describe what happened, when it occurred, and what kind of help you are looking for. The more detail you provide, the better."
          maxLength={msgMax}
        />
        <div className="contact-message-meta">
          {errors.message && touched.message
            ? <span className="contact-field-error">{errors.message}</span>
            : <span />}
          <span className={`contact-char-count${msgLen > msgMax - 50 ? " contact-char-count--warn" : ""}`}>
            {msgLen}/{msgMax}
          </span>
        </div>
      </div>

      {siteKey && (
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          options={{ theme: "dark" }}
        />
      )}

      {serverError && <p className="contact-error" role="alert">{serverError}</p>}

      <button
        type="submit"
        className="btn-primary contact-submit"
        disabled={loading || (!!siteKey && !turnstileToken)}
      >
        {loading ? "Sending…" : "Send Message"}
      </button>

      <p className="contact-disclaimer">
        By submitting this form, you agree to our{" "}
        <Link href="/terms" className="contact-disclaimer-link">Terms of Service</Link>{" "}
        and{" "}
        <Link href="/privacy" className="contact-disclaimer-link">Privacy Policy</Link>.
        Submission of this form does not create an attorney-client relationship and should not be construed as legal advice.
        Do not include privileged or confidential information in your message.
      </p>
    </form>
  )
}
