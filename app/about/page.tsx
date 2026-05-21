import type { Metadata } from "next"
import NavServer from "../components/NavServer"
import Footer from "../components/Footer"
import Link from "next/link"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "About",
  description: "fightfor.you is a free public directory of civil rights attorneys who fight police misconduct, excessive force, and government abuse — carefully selected, proven in court.",
  alternates: { canonical: "https://fightfor.you/about" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "fightfor.you",
  "url": "https://fightfor.you",
  "description": "A free public directory of civil rights attorneys who fight police misconduct, excessive force, and government abuse — carefully selected, proven in court.",
  "foundingDate": "2026",
}

export default function AboutPage() {
  return (
    <div className="public">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavServer />

      <main className="guide-page" id="main-content" style={{ paddingTop: "52px" }}>
        <div className="guide-page-inner">
          <article className="guide-article">
            <h1 className="guide-title">About fightfor.you</h1>

            <div className="guide-body">

              <h2 className="guide-body-h2">The Playing Field Is Not Level</h2>
              <p>
                When you take on a police department, a sheriff&apos;s office, or a federal agency, you are not
                just facing one officer. You are facing an entire legal machine — staffed by experienced attorneys,
                funded by taxpayer dollars, and built to protect itself. Police unions provide aggressive legal
                defense. City and county attorneys fight victims at every stage. Qualified immunity shields officers
                from personal liability in most cases. The system, as it exists, was not designed with accountability
                in mind.
              </p>
              <p>
                Most victims and families have never been through anything like this. The process is complex, the
                timeline is long, and the opposition is formidable. Intimidation — through delay, paperwork, and the
                sheer weight of institutional resources — is part of the strategy. Most people simply do not know
                where to start, and that uncertainty is exploited.
              </p>
              <p>
                fightfor.you exists to change that equation.
              </p>

              <h2 className="guide-body-h2">What We Are</h2>
              <p>
                fightfor.you is a free, searchable directory of civil rights attorneys and law firms with a
                documented record of success against law enforcement and government entities. Every listing has
                been researched and verified. We document practice areas, notable results, bar credentials, and
                contact information so that people who have been harmed can find qualified representation
                quickly — without having to navigate generic legal directories that bury civil rights specialists
                under personal injury ads.
              </p>
              <p>
                There are no pay-to-play listings and no unvetted submissions. Placement in this directory is
                based on a demonstrated track record — attorneys who have taken law enforcement to court and won.
                This is not an advertising platform. We do not accept payment for inclusion or ranking.
              </p>

              <h2 className="guide-body-h2">Who We Serve</h2>
              <p>
                We serve anyone who has experienced harm at the hands of law enforcement or government actors:
              </p>
              <ul className="guide-body-list">
                <li>Police misconduct and excessive force</li>
                <li>Wrongful arrest or false imprisonment</li>
                <li>Wrongful death caused by law enforcement</li>
                <li>Unlawful search and seizure</li>
                <li>Civil rights violations under federal or state law</li>
                <li>Jail and prison abuse</li>
                <li>Government retaliation for protected activity</li>
              </ul>
              <p>
                We also serve family members of victims, community advocates, and anyone trying to understand
                their rights and options before deciding whether to pursue a case.
              </p>

              <h2 className="guide-body-h2">Contingency Means You Pay Nothing Unless You Win</h2>
              <p>
                Attorneys in this field almost universally work on contingency — meaning they take no upfront
                fee and collect only a percentage of any settlement or verdict. If they do not win, you owe
                nothing. This means that you should hire the best attorney you can find, without worrying about how to pay them. The attorney you hire will have a financial stake in winning your case, so they should be motivated to do just that.
              </p>  
              <p>
                It also means that when an attorney agrees to take your case, they have made a business
                decision: they believe they can win. That is a meaningful signal. There is no reason to settle
                for anything less than a lawyer with a real track record in this specific area of law.
              </p>

              <h2 className="guide-body-h2">Deadlines Are Not Flexible</h2>
              <p>
                One of the most important things we want every visitor to understand: civil rights cases have
                strict filing deadlines, and missing them permanently bars your claim — regardless of how strong
                your case is.
              </p>
              <p>
                Statutes of limitations for Section 1983 federal civil rights claims vary by state, typically
                ranging from one to three years. But many jurisdictions also require a separate notice of claim
                to be filed with a government agency within as little as 90 days of the incident. Miss that
                notice deadline and no attorney, however skilled, can help you.
              </p>
              <p>
                Our <Link href="/guides/filing-deadlines-by-state" className="guide-body-link">State Filing Deadlines guide</Link> covers
                both statutes of limitations and notice-of-claim requirements for every state. Look up your
                state as soon as possible.
              </p>

              <h2 className="guide-body-h2">Knowledge Is Part of the Fight</h2>
              <p>
                We believe that an informed client is a stronger client. The guides on this site explain the
                laws, processes, and legal concepts that matter in civil rights cases — in plain language, without
                the jargon that makes this area of law feel inaccessible. Understanding your situation is the
                first step toward making decisions with confidence.
              </p>
              <p>
                Our guides cover qualified immunity and which states have reformed or abolished it, what Section
                1983 means and how it works, how to evaluate whether you have a case, what the litigation process
                looks like from filing to verdict, and much more.
              </p>

              <h2 className="guide-body-h2">Free to Use</h2>
              <p>
                fightfor.you is free for the public. There is no cost to search the directory, read our guides,
                or contact an attorney through our platform. We do not sell your information. We do not require
                an account to use any part of the site.
              </p>

              <h2 className="guide-body-h2">Contact</h2>
              <p>
                Questions, corrections, or feedback? Use our <Link href="/contact" className="guide-body-link">contact form</Link> or
                reach us directly at <a href="mailto:contact@fightfor.you" className="guide-body-link">contact@fightfor.you</a>.
              </p>
              <p>
                If you are an attorney or firm with a documented track record of civil rights litigation or personal injury claims against police and would like to be
                considered for inclusion, use the contact form and select &ldquo;Attorney Listing Request.&rdquo;
              </p>

            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
