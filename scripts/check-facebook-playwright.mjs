import { chromium } from 'playwright'

const links = [
  {name:"ACLU of Arkansas",facebook:"https://facebook.com/ACLUArkansas"},
  {name:"ACLU of Louisiana",facebook:"https://www.facebook.com/ACLUofLA"},
  {name:"Alfredo Parrish",facebook:"https://www.facebook.com/ParrishKruidenier"},
  {name:"Al Gerhardstein",facebook:"https://www.facebook.com/GerhardstenBranch"},
  {name:"Andrew Bizer",facebook:"https://www.facebook.com/bizerlaw"},
  {name:"Antonio Ponvert, III",facebook:"https://www.facebook.com/KoskoffKoskoffBieder"},
  {name:"Antonio Romanucci",facebook:"https://www.facebook.com/RomanucciAndBlandin"},
  {name:"ArchCity Defenders",facebook:"https://www.facebook.com/ArchCityDefenders"},
  {name:"Bakari Sellers",facebook:"https://www.facebook.com/StromLawFirm/"},
  {name:"Benjamin L. Crump",facebook:"https://www.facebook.com/attorneycrump"},
  {name:"Ben Salango",facebook:"https://www.facebook.com/wvlawyers/"},
  {name:"Bobby DiCello",facebook:"https://www.facebook.com/bobbydicello"},
  {name:"Bob Hilliard",facebook:"https://www.facebook.com/HilliardMartinezGonzales"},
  {name:"Breit Biniazan, PC",facebook:"https://www.facebook.com/BreitLaw"},
  {name:"Brewster & De Angelis, PLLC",facebook:"https://www.facebook.com/brewsterlaw2617/"},
  {name:"Bryan & Terrill Law, PLLC",facebook:"https://www.facebook.com/BryanTerrillLaw"},
  {name:"Chase H. Livingston",facebook:"https://www.facebook.com/DavisLevinLivingston/"},
  {name:"Chopra & Nocerino, LLP",facebook:"https://www.facebook.com/profile.php?id=61554903827420"},
  {name:"Christopher C. Myers",facebook:"https://www.facebook.com/christophercmyersassociates"},
  {name:"Cohen & Malad, LLP",facebook:"https://www.facebook.com/CohenMalad"},
  {name:"Collins & Collins, PC",facebook:"https://www.facebook.com/CollinsAndCollinsPC"},
  {name:"Coxwell & Associates, PLLC",facebook:"https://www.facebook.com/CoxwellLaw/"},
  {name:"Dale K. Galipo",facebook:"https://www.facebook.com/DaleGalipoLaw"},
  {name:"Dan Stormer",facebook:"https://www.facebook.com/HadsellStormer"},
  {name:"David Rudovsky",facebook:"https://www.facebook.com/KRMFLlaw/"},
  {name:"Emancipate NC",facebook:"https://www.facebook.com/emancipatenc/"},
  {name:"Frederick K. Brewington",facebook:"https://www.facebook.com/frederickbrewington"},
  {name:"Friedman Law Offices",facebook:"https://www.facebook.com/FriedmanLawOfficesPCLLO/"},
  {name:"Gerald A. Griggs",facebook:"https://www.facebook.com/AttyGriggs/"},
  {name:"Gimbel, Reilly, Guerin & Brown, LLP",facebook:"https://www.facebook.com/GimbelReillyGuerinBrown"},
  {name:"Gingras, Thomsen & Wachs, LLP",facebook:"https://www.facebook.com/gtwlawyers"},
  {name:"Gonzalo Fernandez",facebook:"https://www.facebook.com/Dsnfl/"},
  {name:"Goodman Hurwitz & James, PC",facebook:"https://www.facebook.com/GoodmanHurwitzJames"},
  {name:"Heidepriem, Purtell, Siegel & Hinrichs, LLP",facebook:"https://www.facebook.com/hpslawfirm"},
  {name:"Horn Wright, LLP",facebook:"https://www.facebook.com/HornWrightLLP"},
  {name:"Jeff Edwards",facebook:"https://www.facebook.com/EdwardsLawFirm"},
  {name:"Jeff Scott Olson",facebook:"https://www.facebook.com/jeffscottolson"},
  {name:"J. Kyle Brooks",facebook:"https://www.facebook.com/BlaskaHolmTrIalAttorneys"},
  {name:"John M. Phillips",facebook:"https://www.facebook.com/JohnMPhillipsLaw"},
  {name:"Joshua Erlich",facebook:"https://www.facebook.com/TheErlichLawOffice"},
  {name:"Josiah Swinney",facebook:"https://www.facebook.com/61575177843449/"},
  {name:"Justin Bamberg",facebook:"https://www.facebook.com/BambergLegal"},
  {name:"Kennedy Kennedy & Ives, PC",facebook:"https://www.facebook.com/Kennedylawcivilrights"},
  {name:"Langrock Sperry & Wool, LLP",facebook:"https://www.facebook.com/LangrockSperryWool"},
  {name:"Lawyers for Civil Rights",facebook:"https://www.facebook.com/LawyersForCivilRights"},
  {name:"L. Chris Stewart",facebook:"https://www.facebook.com/StewartTrialAttorneys"},
  {name:"Leroy Maxwell, Jr.",facebook:"https://www.facebook.com/MaxwellTillman"},
  {name:"Loevy & Loevy",facebook:"https://www.facebook.com/loevyandloevy"},
  {name:"Luther Oneal Sutter, II",facebook:"https://www.facebook.com/sutter.gillham"},
  {name:"Lyons & Associates, PC",facebook:"https://www.facebook.com/LyonsAssociatesPC"},
  {name:"MacDonald Hoague & Bayless",facebook:"https://www.facebook.com/macdonaldhoaguebayless"},
  {name:"Malissa Burnette",facebook:"https://www.facebook.com/BurnetteShuttMcDaniel"},
  {name:"Maren Lynn Chaloupka",facebook:"https://www.facebook.com/ChaloupkaLawLLC"},
  {name:"Marsh, Rickard & Bryan, LLC",facebook:"https://www.facebook.com/pages/Marsh-Rickard-Bryan-LLC/207939732573732"},
  {name:"Matthew Kaplan",facebook:"https://www.facebook.com/KaplanLaw13"},
  {name:"Mawuli Davis",facebook:"https://www.facebook.com/DavisBozemanLaw"},
  {name:"Michael Fuller",facebook:"https://www.facebook.com/underdoglaw"},
  {name:"Nathaniel Cade, III",facebook:"https://www.facebook.com/CadeLawGroup"},
  {name:"Norm Pattis",facebook:"https://www.facebook.com/normpattis"},
  {name:"Northern Justice Project, LLC",facebook:"https://www.facebook.com/NorthernJusticeProject"},
  {name:"Paeten Denning",facebook:"https://www.facebook.com/denninglawfirm"},
  {name:"Panish Shea Ravipudi LLP",facebook:"https://www.facebook.com/PanishSheaRavipudiLLP"},
  {name:"People's Law Office",facebook:"https://www.facebook.com/PeoplesLawOffice"},
  {name:"Peter Goldstein",facebook:"https://www.facebook.com/PGLawyer"},
  {name:"Pitt McGehee Palmer Bonanni & Rivers, PC",facebook:"https://www.facebook.com/PittMcGeheePalmerBonanniRivers"},
  {name:"Quacy Smith",facebook:"https://www.facebook.com/Quacylsmith/"},
  {name:"Raybin & Weissman, PC",facebook:"https://www.facebook.com/RaybinaWeissman"},
  {name:"Ringstrom DeKrey, PLLP",facebook:"https://www.facebook.com/ringstromdekrey"},
  {name:"Robert Zaytoun",facebook:"https://www.facebook.com/ZaytounAbrams"},
  {name:"Sabatini & Associates, LLC",facebook:"https://www.facebook.com/SabatiniAssociatesLLC"},
  {name:"Salvi, Schostok & Pritchard, P.C.",facebook:"https://www.facebook.com/SalviLaw"},
  {name:"Sam Aguiar",facebook:"https://www.facebook.com/SamAguiarLaw"},
  {name:"Sanford Rubenstein",facebook:"https://www.facebook.com/RubensteinRynecki"},
  {name:"Schiller, Pittenger & Galvin, PC",facebook:"https://www.facebook.com/schillerpittengergalvinlaw/"},
  {name:"Schonbrun Seplow Harris Hoffman & Zeldes, LLP",facebook:"https://www.facebook.com/sshhzlaw/"},
  {name:"Sean L. Walton",facebook:"https://www.facebook.com/waltonbrownlaw"},
  {name:"Shaheen & Gordon, PA",facebook:"https://www.facebook.com/ShaheenGordon"},
  {name:"Shanin Specter",facebook:"https://www.facebook.com/KlineSpecter"},
  {name:"Smith Mullin, PC",facebook:"https://www.facebook.com/SmithMullinLaw"},
  {name:"Smolen & Roytman, PLLC",facebook:"https://www.facebook.com/SSROK"},
  {name:"Steven R. Romines",facebook:"https://www.facebook.com/RominesWeisYoung"},
  {name:"Stritmatter Kessler Koehler Moore",facebook:"https://www.facebook.com/StritmatterKesslerKoehlerMoore"},
  {name:"Stroud, Flechas & Dalton",facebook:"https://www.facebook.com/stroudflechasdalton/"},
  {name:"Stuart Grossman",facebook:"https://www.facebook.com/GrossmanRoth"},
  {name:"Subodh Chandra",facebook:"https://www.facebook.com/ChandraLawFirm"},
  {name:"Sykes McAllister Law Offices, PLLC",facebook:"https://www.facebook.com/sykes.mcallister.law"},
  {name:"Teresa Toriseva",facebook:"https://www.facebook.com/torisevalaw"},
  {name:"Terry Gilbert",facebook:"https://www.facebook.com/TerryFGGfirm/"},
  {name:"The Cochran Firm",facebook:"https://www.facebook.com/CochranFirm"},
  {name:"The Simon Law Firm, PC",facebook:"https://www.facebook.com/simonlawstl/"},
  {name:"The Spence Law Firm, LLC",facebook:"https://www.facebook.com/GerrySpence"},
  {name:"Thomas C. Crumplar",facebook:"https://www.facebook.com/JacobsCrumplar/"},
  {name:"Thomas H. Roberts",facebook:"https://www.facebook.com/thomashrobertsandassociates"},
  {name:"Thomas J. Curcio",facebook:"https://www.facebook.com/CurcioLaw/"},
  {name:"Tom Porto",facebook:"https://www.facebook.com/pophamlaw"},
  {name:"Travis M. Brennan",facebook:"https://www.facebook.com/bermansimmons"},
  {name:"Ven Johnson",facebook:"https://www.facebook.com/VenJohnsonLaw"},
  {name:"Wagner Reese, LLP",facebook:"https://www.facebook.com/WagnerReese"},
  {name:"William Jungbauer",facebook:"https://www.facebook.com/Wjungbauer"},
  {name:"Zalkind Duncan & Bernstein, LLP",facebook:"https://www.facebook.com/Zalkind-Duncan-Bernstein-LLP-524597237620620"},
]

const DEAD_SIGNALS = [
  "this content isn",
  "this page isn",
  "content not found",
  "page not found",
  "this page is not available",
  "the link you followed may be broken",
  "sorry, this page",
  "page you're looking for",
]

const browser = await chromium.launch({ headless: false, slowMo: 50 })
const context = await browser.newContext({
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  locale: "en-US",
})

const loginPage = await context.newPage()
await loginPage.goto("https://www.facebook.com/login", { waitUntil: "domcontentloaded" })
console.log("\nA browser window has opened. Log in to Facebook, then come back here and press Enter.")
await new Promise(resolve => process.stdin.once("data", resolve))
await loginPage.close()

const results = []

for (const { name, facebook } of links) {
  const page = await context.newPage()
  try {
    await page.goto(facebook, { waitUntil: "domcontentloaded", timeout: 15000 })
    // Give JS time to render error states
    await page.waitForTimeout(3000)

    const finalUrl = page.url()
    const title = await page.title()
    const bodyText = (await page.evaluate(() => document.body?.innerText || "")).toLowerCase()

    const isDead = DEAD_SIGNALS.some(s => bodyText.includes(s))
    // Redirected to login without a ?next= means FB couldn't associate a destination = page gone
    const loginNoNext = finalUrl.includes("facebook.com/login") && !finalUrl.includes("next=")

    results.push({ name, url: facebook, finalUrl, title, isDead: isDead || loginNoNext })
    process.stdout.write(isDead || loginNoNext ? "X" : ".")
  } catch (e) {
    results.push({ name, url: facebook, finalUrl: "", title: "", isDead: true, err: e.message })
    process.stdout.write("E")
  } finally {
    await page.close()
  }
}

await browser.close()
console.log("\n")

const dead = results.filter(r => r.isDead)
const ok = results.filter(r => !r.isDead)

console.log(`BROKEN (${dead.length}):`)
dead.forEach(r => {
  console.log(`  ${r.name}`)
  console.log(`    ${r.url}`)
  console.log(`    title: "${r.title}"`)
  console.log(`    final: ${r.finalUrl}`)
})

console.log(`\nOK (${ok.length}):`)
ok.forEach(r => console.log(`  ${r.name} — "${r.title}"`))
