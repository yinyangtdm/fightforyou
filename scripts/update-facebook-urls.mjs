import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const DB = 'postgresql://postgres:MQSFLiQjrLvGYFnfAWegffwQpOlQJJJY@switchback.proxy.rlwy.net:31851/railway'
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DB }) })

const updates = [
  { name: 'ACLU of Louisiana',                          facebook: 'https://www.facebook.com/aclu.louisiana/' },
  { name: 'Alfredo Parrish',                            facebook: 'https://www.facebook.com/p/Parrish-Kruidenier-Law-Firm-100028701979783/' },
  { name: 'Al Gerhardstein',                            facebook: 'https://www.facebook.com/fggfirmcincinnati/' },
  { name: 'Andrew Bizer',                               facebook: 'https://www.facebook.com/BizerandDeReus/' },
  { name: 'Antonio Ponvert, III',                       facebook: 'https://www.facebook.com/p/Koskoff-Koskoff-Bieder-PC-100063785843562/' },
  { name: 'Antonio Romanucci',                          facebook: 'https://www.facebook.com/RomanucciBlandin/' },
  { name: 'Ben Salango',                                facebook: 'https://www.facebook.com/salangolaw/' },
  { name: 'Bob Hilliard',                               facebook: 'https://www.facebook.com/hmglawfirm/' },
  { name: 'Bryan & Terrill Law, PLLC',                  facebook: 'https://www.facebook.com/btlawfirm/' },
  { name: 'Cohen & Malad, LLP',                         facebook: 'https://www.facebook.com/cohenmaladllp/' },
  { name: 'Collins & Collins, PC',                      facebook: 'https://www.facebook.com/CollinsAttorneys/' },
  { name: 'Coxwell & Associates, PLLC',                 facebook: 'https://www.facebook.com/coxwell.firm/' },
  { name: 'Dale K. Galipo',                             facebook: 'https://www.facebook.com/p/Law-Offices-of-Dale-K-Galipo-100068346655424/' },
  { name: 'Gimbel, Reilly, Guerin & Brown, LLP',        facebook: 'https://www.facebook.com/grgblaw/' },
  { name: 'Goodman Hurwitz & James, PC',                facebook: 'https://www.facebook.com/GHJPC/' },
  { name: 'Horn Wright, LLP',                           facebook: 'https://www.facebook.com/hornwright/' },
  { name: 'L. Chris Stewart',                           facebook: 'https://www.facebook.com/smstrialattorneys/' },
  { name: 'Luther Oneal Sutter, II',                    facebook: 'https://www.facebook.com/SutterandGillham/' },
  { name: 'Lyons & Associates, PC',                     facebook: 'https://www.facebook.com/lyonspc/' },
  { name: 'MacDonald Hoague & Bayless',                 facebook: 'https://www.facebook.com/macdonaldhoageandbayless/' },
  { name: 'Marsh, Rickard & Bryan, LLC',                facebook: 'https://www.facebook.com/MarshRickardBryan/' },
  { name: 'Mawuli Davis',                               facebook: 'https://www.facebook.com/DBJLaw/' },
  { name: 'Pitt McGehee Palmer Bonanni & Rivers, PC',   facebook: 'https://www.facebook.com/pittmcgehee/' },
  { name: 'Raybin & Weissman, PC',                      facebook: 'https://www.facebook.com/NashvilleTnLaw/' },
  { name: 'Ringstrom DeKrey, PLLP',                     facebook: 'https://www.facebook.com/ringstromlaw/' },
  { name: 'Sam Aguiar',                                 facebook: 'https://www.facebook.com/LouisvillePersonalInjury/' },
  { name: 'Steven R. Romines',                          facebook: 'https://www.facebook.com/rwylawky/' },
  { name: 'Stritmatter Kessler Koehler Moore',          facebook: 'https://www.facebook.com/stritmatterlawfirm/' },
  { name: 'Stroud, Flechas & Dalton',                   facebook: 'https://www.facebook.com/Mississippi.Personal.Injury.Attorneys/' },
  { name: 'Teresa Toriseva',                            facebook: 'https://www.facebook.com/TorisevaLawFirm/' },
  { name: 'Thomas H. Roberts',                          facebook: 'https://www.facebook.com/robertslawva/' },
  { name: 'Ven Johnson',                                facebook: 'https://www.facebook.com/venfights/' },
  // No confirmed current page found — clearing old broken links
  { name: 'Christopher C. Myers',                       facebook: null },
  { name: 'John M. Phillips',                           facebook: null },
  { name: 'Robert Zaytoun',                             facebook: null },
]

let ok = 0, notFound = 0
for (const { name, facebook } of updates) {
  const result = await prisma.listing.updateMany({ where: { name }, data: { facebook } })
  if (result.count > 0) {
    ok++
    console.log((facebook ? 'UPDATED' : 'NULLED ') + '  ' + name)
  } else {
    notFound++
    console.log('NOT FOUND  ' + name)
  }
}
console.log(`\nDone: ${ok} updated, ${notFound} not matched`)
await prisma.$disconnect()
