// Full LinkedIn check — includes original links + corrected candidates
const links = [
  // Original links from check-linkedin.mjs
  {name:"ACLU of Arkansas",linkedin:"https://linkedin.com/company/aclu-of-arkansas"},
  {name:"ACLU of Louisiana",linkedin:"https://www.linkedin.com/company/aclu-of-louisiana"},
  {name:"Alfredo Parrish",linkedin:"https://www.linkedin.com/company/parrish-kruidenier"},
  {name:"Al Gerhardstein",linkedin:"https://www.linkedin.com/company/fggfirm/"},
  {name:"Andy Freeman",linkedin:"https://www.linkedin.com/in/andrew-freeman-3229b08/"},
  {name:"Anna Christiansen",linkedin:"https://www.linkedin.com/in/annapchristiansen/"},
  {name:"Antonio Ponvert, III",linkedin:"https://www.linkedin.com/in/antonio-ponvert-iii"},
  {name:"Antonio Romanucci",linkedin:"https://www.linkedin.com/in/antonio-romanucci"},
  {name:"ArchCity Defenders",linkedin:"https://www.linkedin.com/company/archcity-defenders"},
  {name:"Bakari Sellers",linkedin:"https://www.linkedin.com/in/bakari-sellers-80410425/"},
  {name:"Benjamin L. Crump",linkedin:"https://www.linkedin.com/company/ben-crump-law-pllc"},
  {name:"Ben Salango",linkedin:"https://www.linkedin.com/company/salangolaw"},
  {name:"Bobby DiCello",linkedin:"https://www.linkedin.com/in/bobby-dicello"},
  {name:"Bob Hilliard",linkedin:"https://www.linkedin.com/in/bob-hilliard"},
  {name:"Brewster & De Angelis, PLLC",linkedin:"https://www.linkedin.com/company/brewster-&-de-angelis-law-offices"},
  {name:"Bryan & Terrill Law, PLLC",linkedin:"https://www.linkedin.com/in/j-spencer-bryan"},
  {name:"Budge & Heipt, PLLC",linkedin:"https://www.linkedin.com/company/budge-&-heipt-pllc/"},
  {name:"Chopra & Nocerino, LLP",linkedin:"https://www.linkedin.com/company/chopra-nocerino-llp"},
  {name:"Christopher C. Myers",linkedin:"https://www.linkedin.com/in/christopher-myers-209a3411"},
  {name:"Coxwell & Associates, PLLC",linkedin:"https://www.linkedin.com/company/coxwell-&-associates-pllc/"},
  {name:"Dale K. Galipo",linkedin:"https://www.linkedin.com/company/the-law-offices-of-dale-k-galipo/"},
  {name:"Dan Stormer",linkedin:"https://www.linkedin.com/company/hadsell-stormer-richardson-&-renick-llp"},
  {name:"David Rudovsky",linkedin:"https://www.linkedin.com/company/kairys-rudovsky-messing-&-feinberg-llp"},
  {name:"Friedman Law Offices",linkedin:"https://www.linkedin.com/company/friedman-law-offices"},
  {name:"Gerald A. Griggs",linkedin:"https://www.linkedin.com/in/gerald-griggs-esq"},
  {name:"Gimbel, Reilly, Guerin & Brown, LLP",linkedin:"https://www.linkedin.com/company/gimbel-reilly-guerin-&-brown-llp"},
  {name:"Gingras, Thomsen & Wachs, LLP",linkedin:"https://www.linkedin.com/company/gingras-thomsen-wachs"},
  {name:"Gonzalo Fernandez",linkedin:"https://www.linkedin.com/in/gonzalo-fernandez-7347429/"},
  {name:"Goodman Hurwitz & James, PC",linkedin:"https://www.linkedin.com/company/goodman-hurwitz-&-james-pc"},
  {name:"Heidepriem, Purtell, Siegel & Hinrichs, LLP",linkedin:"https://www.linkedin.com/company/hps-law-firm"},
  {name:"Hillary P. Carls",linkedin:"https://www.linkedin.com/in/hillary-carls/"},
  {name:"J. Ashwin Madia",linkedin:"https://www.linkedin.com/in/ashwin-madia"},
  {name:"Jeff Edwards",linkedin:"https://www.linkedin.com/in/jeff-edwards-civil-rights"},
  {name:"J. Kyle Brooks",linkedin:"https://www.linkedin.com/in/kyle-brooks-b61a528/"},
  {name:"John M. Phillips",linkedin:"https://www.linkedin.com/in/john-m-phillips"},
  {name:"Joshua Erlich",linkedin:"http://www.linkedin.com/company/the-erlich-law-office-pllc"},
  {name:"Josiah Swinney",linkedin:"https://www.linkedin.com/in/josiah-swinney-a0089756/"},
  {name:"Kennedy Kennedy & Ives, PC",linkedin:"https://www.linkedin.com/in/joseph-kennedy-681b7244"},
  {name:"Killmer Lane, LLP",linkedin:"https://www.linkedin.com/company/killmer-lane-llp"},
  {name:"Langrock Sperry & Wool, LLP",linkedin:"https://www.linkedin.com/company/langrock-sperry-&-wool-llp"},
  {name:"Lawyers for Civil Rights",linkedin:"https://www.linkedin.com/company/lawyers-for-civil-rights"},
  {name:"L. Chris Stewart",linkedin:"https://www.linkedin.com/in/l-chris-stewart-attorney"},
  {name:"Loevy & Loevy",linkedin:"https://www.linkedin.com/company/loevy-&-loevy"},
  {name:"Maren Lynn Chaloupka",linkedin:"https://www.linkedin.com/in/maren-lynn-chaloupka-739ba4202/"},
  {name:"Matthew Kaplan",linkedin:"https://www.linkedin.com/in/matthew-kaplan-2108b24/"},
  {name:"Michael Fuller",linkedin:"https://www.linkedin.com/in/mrfuller"},
  {name:"Nathaniel Cade, III",linkedin:"https://www.linkedin.com/in/nathaniel-cade-iii"},
  {name:"Neufeld Scheck Brustin Hoffmann & Freudenberger, LLP",linkedin:"https://www.linkedin.com/company/neufeld-scheck-brustin-hoffmann-freudenberger-llp/"},
  {name:"Northern Justice Project, LLC",linkedin:"https://www.linkedin.com/company/northern-justice-project-llc"},
  {name:"Paeten Denning",linkedin:"https://www.linkedin.com/in/paeten-denning"},
  {name:"Panish Shea Ravipudi LLP",linkedin:"https://www.linkedin.com/company/panish-shea-ravipudi-llp"},
  {name:"Peter Goldstein",linkedin:"https://www.linkedin.com/company/law-offices-of-peter-goldstein/"},
  {name:"Quacy Smith",linkedin:"https://www.linkedin.com/in/quacy-l-smith-esq-89b63552/"},
  {name:"Rathod Mohamedbhai, LLC",linkedin:"https://www.linkedin.com/company/rathod-mohamedbhai-llc/"},
  {name:"Raybin & Weissman, PC",linkedin:"https://www.linkedin.com/company/raybin-weissman-pc/"},
  {name:"Ringstrom DeKrey, PLLP",linkedin:"https://www.linkedin.com/company/ringstrom-dekrey"},
  {name:"Salvi, Schostok & Pritchard, P.C.",linkedin:"https://www.linkedin.com/in/patrick-salvi-6123bb6/"},
  {name:"Schonbrun Seplow Harris Hoffman & Zeldes, LLP",linkedin:"https://www.linkedin.com/company/sshhz"},
  {name:"Sean L. Walton",linkedin:"https://www.linkedin.com/company/walton-brown-llp-/"},
  {name:"Shaheen & Gordon, PA",linkedin:"https://www.linkedin.com/company/shaheen-&-gordon-p-a-"},
  {name:"Smolen & Roytman, PLLC",linkedin:"https://www.linkedin.com/company/smolenroytman/"},
  {name:"Steven R. Romines",linkedin:"https://www.linkedin.com/in/steven-romines-ab68a318/"},
  {name:"Stritmatter Kessler Koehler Moore",linkedin:"https://www.linkedin.com/company/stritmatter"},
  {name:"Stroud, Flechas & Dalton",linkedin:"https://www.linkedin.com/company/stroud-flechas-&-dalton/"},
  {name:"Subodh Chandra",linkedin:"https://www.linkedin.com/in/subodh-chandra"},
  {name:"Sykes McAllister Law Offices, PLLC",linkedin:"https://www.linkedin.com/company/sykes-mcallister-law-offices-pllc/"},
  {name:"Terry Gilbert",linkedin:"https://www.linkedin.com/in/terry-gilbert-attorney"},
  {name:"The Cochran Firm",linkedin:"https://www.linkedin.com/company/the-cochran-firm"},
  {name:"The Richardson Firm",linkedin:"https://www.linkedin.com/in/william-richardson"},
  {name:"The Simon Law Firm, PC",linkedin:"https://www.linkedin.com/company/the-simon-law-firm"},
  {name:"Thomas C. Crumplar",linkedin:"https://www.linkedin.com/company/jacobs-crumplarp-a-/"},
  {name:"Thomas H. Roberts",linkedin:"https://www.linkedin.com/in/thomas-h-roberts"},
  {name:"Tom Porto",linkedin:"https://www.linkedin.com/in/tom-porto-204081a4"},
  {name:"Travis M. Brennan",linkedin:"https://www.linkedin.com/company/berman-simmons-maine-injury-lawyers/"},
  {name:"V. Edward Formisano",linkedin:"https://www.linkedin.com/in/edward-formisano-9604697"},
  {name:"Ven Johnson",linkedin:"https://www.linkedin.com/in/ven-johnson"},
  {name:"Walter M. Mason",linkedin:"https://www.linkedin.com/in/waltmason/"},
  {name:"Zalkind Duncan & Bernstein, LLP",linkedin:"https://www.linkedin.com/company/zalkind-duncan-&-bernstein-llp"},
]

async function check(name, url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(12000)
    })
    const finalUrl = res.url
    const body = await res.text()
    const notFound =
      res.status === 404 ||
      finalUrl.includes("/404") ||
      body.includes("Page not found") ||
      body.includes("profile-not-found") ||
      body.includes("This profile doesn") ||
      body.includes("This page doesn") ||
      (body.includes("authwall") && !finalUrl.includes("/in/") && !finalUrl.includes("/company/"))
    return { name, url, status: res.status, finalUrl, notFound }
  } catch(e) {
    return { name, url, status: "ERR", finalUrl: "", notFound: true, err: e.message }
  }
}

async function run() {
  const results = []
  for (let i = 0; i < links.length; i += 8) {
    const batch = links.slice(i, i + 8)
    const batchResults = await Promise.all(batch.map(l => check(l.name, l.linkedin)))
    results.push(...batchResults)
    process.stdout.write(".")
  }
  console.log("\n")
  const bad = results.filter(r => r.notFound)
  const ok = results.filter(r => !r.notFound)
  console.log(`BAD (${bad.length}):`)
  bad.forEach(r => {
    console.log(`  ${r.name}`)
    console.log(`    ${r.url}`)
    console.log(`    -> ${r.finalUrl} [${r.status}]${r.err ? "\n    ERR: "+r.err : ""}`)
  })
  console.log(`\nOK (${ok.length}):`)
  ok.forEach(r => console.log(`  ok  ${r.name}`))
}
run()
