import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const facebookUpdates = [
  { name: "ACLU of Louisiana",                          facebook: "https://www.facebook.com/aclu.louisiana/" },
  { name: "Alfredo Parrish",                            facebook: "https://www.facebook.com/p/Parrish-Kruidenier-Law-Firm-100028701979783/" },
  { name: "Al Gerhardstein",                            facebook: "https://www.facebook.com/fggfirmcincinnati/" },
  { name: "Andrew Bizer",                               facebook: "https://www.facebook.com/BizerandDeReus/" },
  { name: "Antonio Ponvert, III",                       facebook: "https://www.facebook.com/p/Koskoff-Koskoff-Bieder-PC-100063785843562/" },
  { name: "Antonio Romanucci",                          facebook: "https://www.facebook.com/RomanucciBlandin/" },
  { name: "Ben Salango",                                facebook: "https://www.facebook.com/salangolaw/" },
  { name: "Bob Hilliard",                               facebook: "https://www.facebook.com/hmglawfirm/" },
  { name: "Bryan & Terrill Law, PLLC",                  facebook: "https://www.facebook.com/btlawfirm/" },
  { name: "Cohen & Malad, LLP",                         facebook: "https://www.facebook.com/cohenmaladllp/" },
  { name: "Collins & Collins, PC",                      facebook: "https://www.facebook.com/CollinsAttorneys/" },
  { name: "Coxwell & Associates, PLLC",                 facebook: "https://www.facebook.com/coxwell.firm/" },
  { name: "Dale K. Galipo",                             facebook: "https://www.facebook.com/p/Law-Offices-of-Dale-K-Galipo-100068346655424/" },
  { name: "Gimbel, Reilly, Guerin & Brown, LLP",        facebook: "https://www.facebook.com/grgblaw/" },
  { name: "Goodman Hurwitz & James, PC",                facebook: "https://www.facebook.com/GHJPC/" },
  { name: "Horn Wright, LLP",                           facebook: "https://www.facebook.com/hornwright/" },
  { name: "L. Chris Stewart",                           facebook: "https://www.facebook.com/smstrialattorneys/" },
  { name: "Luther Oneal Sutter, II",                    facebook: "https://www.facebook.com/SutterandGillham/" },
  { name: "Lyons & Associates, PC",                     facebook: "https://www.facebook.com/lyonspc/" },
  { name: "MacDonald Hoague & Bayless",                 facebook: "https://www.facebook.com/macdonaldhoageandbayless/" },
  { name: "Marsh, Rickard & Bryan, LLC",                facebook: "https://www.facebook.com/MarshRickardBryan/" },
  { name: "Mawuli Davis",                               facebook: "https://www.facebook.com/DBJLaw/" },
  { name: "Pitt McGehee Palmer Bonanni & Rivers, PC",   facebook: "https://www.facebook.com/pittmcgehee/" },
  { name: "Raybin & Weissman, PC",                      facebook: "https://www.facebook.com/NashvilleTnLaw/" },
  { name: "Ringstrom DeKrey, PLLP",                     facebook: "https://www.facebook.com/ringstromlaw/" },
  { name: "Sam Aguiar",                                 facebook: "https://www.facebook.com/LouisvillePersonalInjury/" },
  { name: "Steven R. Romines",                          facebook: "https://www.facebook.com/rwylawky/" },
  { name: "Stritmatter Kessler Koehler Moore",          facebook: "https://www.facebook.com/stritmatterlawfirm/" },
  { name: "Stroud, Flechas & Dalton",                   facebook: "https://www.facebook.com/Mississippi.Personal.Injury.Attorneys/" },
  { name: "Teresa Toriseva",                            facebook: "https://www.facebook.com/TorisevaLawFirm/" },
  { name: "Thomas H. Roberts",                          facebook: "https://www.facebook.com/robertslawva/" },
  { name: "Ven Johnson",                                facebook: "https://www.facebook.com/venfights/" },
  { name: "Christopher C. Myers",                       facebook: null },
  { name: "John M. Phillips",                           facebook: null },
  { name: "Robert Zaytoun",                             facebook: null },
]

const linkedinUpdates = [
  { name: "Alfredo Parrish",                               linkedin: "https://www.linkedin.com/company/parrish-kruidenier" },
  { name: "Benjamin L. Crump",                             linkedin: "https://www.linkedin.com/company/ben-crump-law-pllc" },
  { name: "Ben Salango",                                   linkedin: "https://www.linkedin.com/company/salangolaw" },
  { name: "Brewster & De Angelis, PLLC",                   linkedin: "https://www.linkedin.com/company/brewster-&-de-angelis-law-offices" },
  { name: "Dan Stormer",                                   linkedin: "https://www.linkedin.com/company/hadsell-stormer-richardson-&-renick-llp" },
  { name: "David Rudovsky",                                linkedin: "https://www.linkedin.com/company/kairys-rudovsky-messing-&-feinberg-llp" },
  { name: "Friedman Law Offices",                          linkedin: "https://www.linkedin.com/company/friedman-law-offices" },
  { name: "Gingras, Thomsen & Wachs, LLP",                linkedin: "https://www.linkedin.com/company/gingras-thomsen-wachs" },
  { name: "Langrock Sperry & Wool, LLP",                   linkedin: "https://www.linkedin.com/company/langrock-sperry-&-wool-llp" },
  { name: "Ringstrom DeKrey, PLLP",                        linkedin: "https://www.linkedin.com/company/ringstrom-dekrey" },
  { name: "Schonbrun Seplow Harris Hoffman & Zeldes, LLP", linkedin: "https://www.linkedin.com/company/sshhz" },
  { name: "Shaheen & Gordon, PA",                          linkedin: "https://www.linkedin.com/company/shaheen-&-gordon-p-a-" },
  { name: "The Simon Law Firm, PC",                        linkedin: "https://www.linkedin.com/company/the-simon-law-firm" },
  { name: "Goodman Hurwitz & James, PC",                   linkedin: null },
  { name: "Stroud, Flechas & Dalton",                      linkedin: null },
]

export async function POST() {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const results: { name: string; field: string; value: string | null; matched: number }[] = []

  for (const { name, facebook } of facebookUpdates) {
    const r = await prisma.listing.updateMany({ where: { name }, data: { facebook } })
    results.push({ name, field: "facebook", value: facebook, matched: r.count })
  }

  for (const { name, linkedin } of linkedinUpdates) {
    const r = await prisma.listing.updateMany({ where: { name }, data: { linkedin } })
    results.push({ name, field: "linkedin", value: linkedin, matched: r.count })
  }

  const updated = results.filter(r => r.matched > 0)
  const missed = results.filter(r => r.matched === 0)

  return Response.json({ updated: updated.length, missed: missed.map(r => r.name) })
}
