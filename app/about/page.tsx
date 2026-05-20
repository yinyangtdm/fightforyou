import type { Metadata } from "next"
import Nav from "../components/Nav"
import Footer from "../components/Footer"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "About",
  description: "fightfor.you is a free public directory connecting people with civil rights attorneys who fight police misconduct, excessive force, and government abuse.",
  alternates: { canonical: "https://fightfor.you/about" },
}

export default function AboutPage() {
  return (
    <div className="public">
      <Nav specialties={[]} guides={[]} />

      <main className="guide-page" id="main-content">
        <div className="guide-page-inner">
          <article className="guide-article">
            <h1 className="guide-title">About fightfor.you</h1>

            <div className="guide-body">
              <p>
                When law enforcement causes harm, the system is designed to make accountability as difficult as possible.
                Qualified immunity shields officers from civil liability. Police unions fund aggressive legal defense.
                City attorneys fight victims at every turn. And most people don&apos;t know where to start.
              </p>

              <p>
                fightfor.you exists to change that. We built a free, searchable directory of civil rights attorneys
                who specialize in holding law enforcement and government entities accountable — lawyers with the
                track record, expertise, and commitment to take these cases seriously.
              </p>

              <h2 className="guide-body-h2">What We Do</h2>
              <p>
                Every attorney listed on fightfor.you has been researched and verified. We document their practice
                areas, notable results, bar credentials, and contact information so that people who have been harmed
                can find qualified representation quickly — without having to navigate a maze of generic legal
                directories that bury civil rights attorneys under personal injury ads.
              </p>

              <h2 className="guide-body-h2">Who We Serve</h2>
              <p>
                We serve anyone who has experienced police misconduct, excessive force, false arrest, wrongful death
                at the hands of law enforcement, or other civil rights violations by government actors. Our guides
                explain your rights, the legal process, and what to look for in an attorney — because understanding
                your situation is the first step toward justice.
              </p>

              <h2 className="guide-body-h2">Free to Use</h2>
              <p>
                fightfor.you is free for the public. There is no cost to search the directory, read our guides,
                or contact an attorney through our platform.
              </p>

              <h2 className="guide-body-h2">Contact</h2>
              <p>
                Questions, corrections, or feedback? Reach us at{" "}
                <a href="mailto:contact@fightfor.you">contact@fightfor.you</a>.
              </p>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
