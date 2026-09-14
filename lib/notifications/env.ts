export const emailEnv = {
  user: process.env.GMAIL_USER,
  appPassword: process.env.GMAIL_APP_PASSWORD,
  notificationTo: process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER,
};

export function isEmailConfigured() {
  return Boolean(emailEnv.user && emailEnv.appPassword && emailEnv.notificationTo);
}
