import type { Metadata } from "next"
import NavServer from "../components/NavServer"
import Footer from "../components/Footer"
import GeneralContactForm from "./ContactForm"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with fightfor.you — report an error, request a listing, or send us a message.",
  alternates: { canonical: "https://fightfor.you/contact" },
}

export default function ContactPage() {
  return (
    <div className="public">
      <NavServer />
      <main className="contact-page" id="main-content">
        <div className="contact-page-inner contact-page-inner--centered">
          <div>
            <h1 className="contact-page-title">Contact Us</h1>
            <p className="contact-page-lead">
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
