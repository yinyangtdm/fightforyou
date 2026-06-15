import type { Metadata } from "next"
import NavServer from "../components/NavServer"
import Footer from "../components/Footer"
import Link from "next/link"
import GeneralContactForm from "./ContactForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with fightfor.you — report an error, request a listing, or send us a message.",
  alternates: { canonical: "https://fightfor.you/contact" },
}

export default function ContactPage() {
  return (
    <div className="public">
      <NavServer />
      <main className="guide-page" id="main-content">
        <div className="guide-back-container">
          <Link href="/" className="guide-back">← Home</Link>
        </div>
        <div className="guide-page-inner">
          <div className="guide-article" style={{ maxWidth: 600 }}>
            <h1 className="guide-title">Contact Us</h1>
            <p className="guide-lead">
              Questions, corrections, attorney listing requests, or anything else — we&apos;d love to hear from you.
            </p>
            <GeneralContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
