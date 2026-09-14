export const mercadoPagoEnv = {
  accessToken: process.env.MP_ACCESS_TOKEN,
  webhookSecret: process.env.MP_WEBHOOK_SECRET,
};

export function isMercadoPagoConfigured() {
  return Boolean(mercadoPagoEnv.accessToken);
}
