const CONTACT_PATHS = ["", "/contacto", "/contact", "/nosotros", "/about", "/quienes-somos", "/about-us"];
const FETCH_TIMEOUT_MS = 6000;

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// dominios de plataformas/placeholders que no son un email de contacto real
const JUNK_DOMAINS = [
  "sentry.io", "wixpress.com", "example.com", "godaddy.com", "domain.com",
  "yourdomain.com", "schema.org", "w3.org", "cloudflare.com",
];

function isJunkEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  if (JUNK_DOMAINS.some((j) => domain.includes(j))) return true;
  if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(email)) return true;
  return false;
}

async function fetchWithTimeout(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DStellarEventsBot/1.0)" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function cleanEmailCandidate(candidate: string): string | null {
  const match = candidate.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : null;
}

function findEmailInHtml(html: string): string | null {
  const mailtoMatch = html.match(/mailto:([^"'\s]+)/i);
  if (mailtoMatch) {
    const cleaned = cleanEmailCandidate(mailtoMatch[1]);
    if (cleaned && !isJunkEmail(cleaned)) return cleaned;
  }

  const matches = html.match(EMAIL_RE) ?? [];
  const valid = matches.map((m) => m.toLowerCase()).find((m) => !isJunkEmail(m));
  return valid ?? null;
}

/**
 * Nombre de contacto — SOLO si el propio sitio lo dice de forma explícita
 * e inequívoca (ej. "Fundado por María Gómez", "Directora: Ana Ruiz").
 * Deliberadamente conservador: mejor no encontrar nombre que agarrar el
 * nombre de un testimonio o un texto cualquiera.
 */
const NAME_SIGNAL_RE =
  /(?:founded by|owned by|owner|founder|director|ceo)[:\s]+([A-Z][a-zà-ÿ'-]+(?:\s[A-Z][a-zà-ÿ'-]+){0,2})|(?:fundad[oa] por|director[a]?|propietari[oa])[:\s]+([A-Z][a-zà-ÿ'-]+(?:\s[A-Z][a-zà-ÿ'-]+){0,2})/;

function findContactNameInHtml(html: string): string | null {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const match = text.match(NAME_SIGNAL_RE);
  const full = match?.[1] ?? match?.[2];
  if (!full) return null;
  const firstName = full.trim().split(/\s+/)[0];
  if (firstName.length < 2) return null;
  return firstName;
}

export interface ContactInfo {
  email: string | null;
  contactName: string | null;
}

/**
 * Intenta extraer un email de contacto público del sitio del prospecto y,
 * si el sitio lo publica explícitamente, un nombre de contacto. Revisa el
 * home y un par de rutas de contacto/nosotros comunes.
 */
export async function extractContactInfo(websiteUrl: string): Promise<ContactInfo> {
  let base: URL;
  try {
    base = new URL(websiteUrl);
  } catch {
    return { email: null, contactName: null };
  }

  let email: string | null = null;
  let contactName: string | null = null;

  for (const path of CONTACT_PATHS) {
    const html = await fetchWithTimeout(`${base.origin}${path}`);
    if (!html) continue;

    if (!email) email = findEmailInHtml(html);
    if (!contactName) contactName = findContactNameInHtml(html);

    if (email && contactName) break;
  }

  return { email, contactName };
}
