// Parser de los feeds Atom que genera Google Alerts (gratis, sin API key).
// Los <link href> de Google Alerts apuntan a una URL de redirección
// (https://www.google.com/url?q=<url real>&...), así que se extrae el
// parámetro `q` para guardar la URL real del artículo/post.

export interface AlertMention {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishedAt: string | null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function stripHtml(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, "")).trim();
}

function stripCdata(s: string): string {
  return s.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

function extractRealUrl(href: string): string {
  try {
    const u = new URL(href.replace(/&amp;/g, "&"));
    return u.searchParams.get("q") ?? href;
  } catch {
    return href;
  }
}

export function parseGoogleAlertFeed(xml: string): AlertMention[] {
  const entries: AlertMention[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml))) {
    const block = match[1];
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const linkMatch = block.match(/<link[^>]*href="([^"]+)"/);
    const publishedMatch = block.match(/<published>([^<]+)<\/published>/);
    const contentMatch = block.match(/<content[^>]*>([\s\S]*?)<\/content>/);
    if (!titleMatch || !linkMatch) continue;

    const url = extractRealUrl(linkMatch[1]);
    let domain = "";
    try {
      domain = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      // URL no parseable (raro) — se guarda sin domain.
    }

    entries.push({
      title: stripHtml(stripCdata(titleMatch[1])),
      url,
      domain,
      snippet: stripHtml(stripCdata(contentMatch?.[1] ?? "")).slice(0, 300),
      publishedAt: publishedMatch ? publishedMatch[1] : null,
    });
  }

  return entries;
}

export async function fetchGoogleAlertFeed(feedUrl: string): Promise<AlertMention[]> {
  const res = await fetch(feedUrl);
  if (!res.ok) throw new Error(`google_alert_fetch_failed_${res.status}`);
  const xml = await res.text();
  return parseGoogleAlertFeed(xml);
}
