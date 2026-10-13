// Formato: "termino1|url_feed_1,termino2|url_feed_2" — un par por cada
// alerta creada en google.com/alerts (entregada como "RSS feed").
export interface AlertFeedConfig {
  term: string;
  feedUrl: string;
}

function parseFeeds(raw: string | undefined): AlertFeedConfig[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [term, feedUrl] = pair.split("|");
      return { term: term?.trim() ?? "", feedUrl: feedUrl?.trim() ?? "" };
    })
    .filter((f) => f.term && f.feedUrl);
}

export const mentionsEnv = {
  googleAlertFeeds: parseFeeds(process.env.GOOGLE_ALERT_FEEDS),
};

export function isMentionsConfigured() {
  return mentionsEnv.googleAlertFeeds.length > 0;
}
