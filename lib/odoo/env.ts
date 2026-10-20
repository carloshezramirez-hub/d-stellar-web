export const odooEnv = {
  url: process.env.ODOO_URL,
  db: process.env.ODOO_DB,
  username: process.env.ODOO_USERNAME,
  apiKey: process.env.ODOO_API_KEY,
};

export function isOdooConfigured() {
  return Boolean(odooEnv.url && odooEnv.db && odooEnv.username && odooEnv.apiKey);
}
