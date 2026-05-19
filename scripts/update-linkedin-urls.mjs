import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const DB = 'postgresql://postgres:MQSFLiQjrLvGYFnfAWegffwQpOlQJJJY@switchback.proxy.rlwy.net:31851/railway'
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DB }) })

const updates = [
  // Corrected URLs (old slugs were wrong/outdated)
  { name: 'Alfredo Parrish',                               linkedin: 'https://www.linkedin.com/company/parrish-kruidenier' },
  { name: 'Benjamin L. Crump',                             linkedin: 'https://www.linkedin.com/company/ben-crump-law-pllc' },
  { name: 'Ben Salango',                                   linkedin: 'https://www.linkedin.com/company/salangolaw' },
  { name: 'Brewster & De Angelis, PLLC',                   linkedin: 'https://www.linkedin.com/company/brewster-&-de-angelis-law-offices' },
  { name: 'Dan Stormer',                                   linkedin: 'https://www.linkedin.com/company/hadsell-stormer-richardson-&-renick-llp' },
  { name: 'David Rudovsky',                                linkedin: 'https://www.linkedin.com/company/kairys-rudovsky-messing-&-feinberg-llp' },
  { name: 'Friedman Law Offices',                          linkedin: 'https://www.linkedin.com/company/friedman-law-offices' },
  { name: 'Gingras, Thomsen & Wachs, LLP',                linkedin: 'https://www.linkedin.com/company/gingras-thomsen-wachs' },
  { name: 'Langrock Sperry & Wool, LLP',                   linkedin: 'https://www.linkedin.com/company/langrock-sperry-&-wool-llp' },
  { name: 'Ringstrom DeKrey, PLLP',                        linkedin: 'https://www.linkedin.com/company/ringstrom-dekrey' },
  { name: 'Schonbrun Seplow Harris Hoffman & Zeldes, LLP', linkedin: 'https://www.linkedin.com/company/sshhz' },
  { name: 'Shaheen & Gordon, PA',                          linkedin: 'https://www.linkedin.com/company/shaheen-&-gordon-p-a-' },
  { name: 'The Simon Law Firm, PC',                        linkedin: 'https://www.linkedin.com/company/the-simon-law-firm' },
  // No company page exists — clear broken links
  { name: 'Goodman Hurwitz & James, PC',                   linkedin: null },
  { name: 'Stroud, Flechas & Dalton',                      linkedin: null },
]

let ok = 0, notFound = 0
for (const { name, linkedin } of updates) {
  const result = await prisma.listing.updateMany({ where: { name }, data: { linkedin } })
  if (result.count > 0) {
    ok++
    console.log((linkedin ? 'UPDATED' : 'NULLED ') + '  ' + name)
  } else {
    notFound++
    console.log('NOT FOUND  ' + name)
  }
}
console.log(`\nDone: ${ok} updated, ${notFound} not matched`)
await prisma.$disconnect()
