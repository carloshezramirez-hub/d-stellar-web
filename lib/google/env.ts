export const googleEnv = {
  serviceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  ga4PropertyId: process.env.GA4_PROPERTY_ID,
  gscSiteUrl: process.env.GSC_SITE_URL,
};

export function isGa4Configured() {
  return Boolean(googleEnv.serviceAccountJson && googleEnv.ga4PropertyId);
}

export function isSearchConsoleConfigured() {
  return Boolean(googleEnv.serviceAccountJson && googleEnv.gscSiteUrl);
}
