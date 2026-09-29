export const metaEnv = {
  accessToken: process.env.META_ACCESS_TOKEN,
  igAccountId: process.env.META_IG_ACCOUNT_ID,
  pageId: process.env.META_PAGE_ID,
};

export function isMetaConfigured() {
  return Boolean(metaEnv.accessToken && metaEnv.igAccountId && metaEnv.pageId);
}

export const tikTokEnv = {
  handle: process.env.TIKTOK_HANDLE,
};

export function isTikTokConfigured() {
  return Boolean(tikTokEnv.handle);
}

export const analyticsDashboardEnv = {
  password: process.env.ANALYTICS_DASHBOARD_PASSWORD,
};

export function isAnalyticsDashboardConfigured() {
  return Boolean(analyticsDashboardEnv.password);
}
