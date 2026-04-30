"use strict";

function parsePgArray(value) {
  if (!value || value === "{}" || value === "\\N") return [];
  if (!value.startsWith("{")) return [];
  const inner = value.slice(1, -1);
  if (!inner) return [];
  const result = [];
  let current = "";
  let inQuotes = false;
  let i = 0;
  while (i < inner.length) {
    const ch = inner[i];
    if (ch === "\\" && inQuotes) {
      const next = inner[i + 1];
      if (next === '"')  { current += '"';  i += 2; continue; }
      if (next === "\\") { current += "\\"; i += 2; continue; }
    }
    if (ch === '"' && !inQuotes) { inQuotes = true;  i++; continue; }
    if (ch === '"' &&  inQuotes) { inQuotes = false; i++; continue; }
    if (ch === "," && !inQuotes) { result.push(current); current = ""; i++; continue; }
    current += ch;
    i++;
  }
  result.push(current);
  return result.map((s) => s.trim()).filter(Boolean);
}

function nullOrString(v) {
  return v === "\\N" || v === "" ? null : v;
}

function parseBool(v) {
  return v === "t";
}

const columns = ["id","name","firm","state","city","tagline","description","specialties","key_characteristics","notable_results","created_at","website","is_national","phone","email","is_firm","slug"];

const line = `13\tBenjamin L. Crump\tBen Crump Law, PLLC\tFlorida\tTallahassee, FL & Kansas City, KS\tThe National Catalyst\tThe nation's most prominent civil rights figure, operating nationally with key offices in Florida and Kansas. In Florida, focuses on high-profile police shootings and systemic racial injustice, often using a media-first strategy to turn local cases into national conversations. In Kansas, his team has taken a leading role in landmark 2025–2026 civil rights cases, spearheading litigation that brought national attention to the treatment of pretrial detainees in Kansas jails and pioneering challenges to unauthorized prone restraints by deputies.\t{"Police Shootings",Discrimination,"Wrongful Death","Pretrial Justice","Police Misconduct","Restraint Asphyxia"}\t{"Turns local cases into national conversations through strategic media engagement","History of securing some of the largest settlements in civil rights history","Transparency Champions: Uses the legal system to force release of body-cam and surveillance footage that authorities refuse to make public","Prone Restraint Litigation: Leading experts challenging use of unauthorized prone restraints by law enforcement"}\t{"$779 million verdict in a Gadsden County wrongful death case","98.65 million verdict for Botham Jean, who was shot inside his own home by an off-duty police officer","$27 million George Floyd settlement","$45 million settlement for a man paralyzed in a police van in Connecticut","Brought national attention to treatment of pretrial detainees in Kansas jails","Active in multiple high-profile 2025–2026 Kansas civil rights cases"}\t2026-04-23 05:30:36.731653\thttps://bencrump.com\tt\t(800) 730-1331\tinfo@bencrumplaw.com\tf\tbenjamin-l-crump`;

const fields = line.split("\t");
const row = {};
columns.forEach((col, i) => { row[col] = fields[i] ?? "\\N"; });

const parsed = {
  name:               row.name,
  slug:               nullOrString(row.slug),
  firm:               nullOrString(row.firm),
  state:              row.state,
  city:               nullOrString(row.city),
  tagline:            nullOrString(row.tagline),
  description:        nullOrString(row.description),
  specialties:        parsePgArray(row.specialties),
  keyCharacteristics: parsePgArray(row.key_characteristics),
  notableResults:     parsePgArray(row.notable_results),
  website:            nullOrString(row.website),
  isNational:         parseBool(row.is_national),
  phone:              nullOrString(row.phone),
  email:              nullOrString(row.email),
  isFirm:             parseBool(row.is_firm),
  approved:           false,
  featured:           false,
};

console.log(JSON.stringify(parsed, null, 2));
