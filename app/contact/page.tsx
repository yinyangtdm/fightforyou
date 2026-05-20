import type { Metadata } from "next"
import Nav from "../components/Nav"
import Footer from "../components/Footer"
import Breadcrumb from "../components/Breadcrumb"
import GeneralContactForm from "./ContactForm"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with fightfor.you — report an error, request a listing, or send us a message.",
  alternates: { canonical: "https://fightfor.you/contact" },
}

export default function ContactPage() {
  const breadcrumbItems = [
    { label: "Contact", href: "" },
  ]

  return (
    <div className="public">
      <Nav specialties={[]} guides={[]} />
      <main className="contact-page" id="main-content">
        <div className="breadcrumb-container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className="contact-page-inner contact-page-inner--centered">
          <div>
            <h1 className="contact-page-title">Contact Us</h1>
            <p className="contact-page-lead">
              Questions, corrections, attorney listing requests, or anything else — we'd love to hear from you.
            </p>
            <GeneralContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
