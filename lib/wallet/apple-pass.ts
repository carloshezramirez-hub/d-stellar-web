import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PKPass } from "passkit-generator";
import { BUSINESS, SITE_URL } from "@/data/site";
import { appleWalletEnv } from "./env";
import { buildStampStrip } from "./strip";
import { relevantTextOfTheDay } from "./relevant-phrases";
import { tierForLifetimeStamps } from "./tiers";
import type { LoyaltyMember } from "./loyalty-db";

function hexToRgb(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

// Sin logo.png aparte a propósito — el wordmark vive dentro de la franja
// (strip.png) porque ahí sí se puede meter una imagen propia. Todo el
// texto (nombre, sellos, miembro desde, nivel) va como campos nativos de
// Wallet, no dibujado en la imagen — ver la nota larga en lib/wallet/strip.ts
// sobre por qué (texto dibujado a mano no renderiza en producción).
const STATIC_ASSET_FILES = ["icon.png", "icon@2x.png", "icon@3x.png"];

async function loadAssets(): Promise<Record<string, Buffer>> {
  const [staticEntries, strip1x, strip2x, strip3x] = await Promise.all([
    Promise.all(
      STATIC_ASSET_FILES.map(
        async (name) => [name, await readFile(join(process.cwd(), "public/wallet", name))] as const,
      ),
    ),
    buildStampStrip(1),
    buildStampStrip(2),
    buildStampStrip(3),
  ]);

  return {
    ...Object.fromEntries(staticEntries),
    "strip.png": strip1x,
    "strip@2x.png": strip2x,
    "strip@3x.png": strip3x,
  };
}

// Copy de placeholder para el beta técnico — la regla "10 sellos = 1
// sorpresa" ya la confirmó Carlos (se ve como progreso visual en la franja,
// terminando en la cajita de regalo); el resto del programa sigue
// pendiente de definir.
const COPY = {
  es: {
    description: "Tarjeta de fidelidad d-stellar",
    stampsLabel: "Sellos",
    nameLabel: "Miembro",
    memberLabel: "Miembro desde",
    tierLabel: "Nivel",
    backHeader: "d-stellar — Junt★s brillamos más",
    backBody:
      "Muestra el código QR en caja para sumar un sello por compra. Esta es una tarjeta de fidelidad beta — las reglas del programa pueden cambiar.",
    addressLabel: "Dirección",
    websiteLabel: "Sitio web",
  },
  en: {
    description: "d-stellar loyalty card",
    stampsLabel: "Stamps",
    nameLabel: "Member",
    memberLabel: "Member since",
    tierLabel: "Level",
    backHeader: "d-stellar — We shine brighter together",
    backBody:
      "Show the QR code at checkout to earn a stamp per purchase. This is a beta loyalty card — program rules may change.",
    addressLabel: "Address",
    websiteLabel: "Website",
  },
} as const;

export async function buildAppleLoyaltyPass(member: LoyaltyMember): Promise<Buffer> {
  const certs = appleWalletEnv();
  if (!certs) {
    throw new Error("apple_wallet_not_configured");
  }

  const copy = COPY[member.locale];
  const joinDate = new Date(member.created_at).toLocaleDateString(member.locale === "en" ? "en-US" : "es-MX", {
    year: "numeric",
    month: "short",
  });
  const tier = tierForLifetimeStamps(member.lifetime_stamps);
  const assets = await loadAssets();

  const pass = new PKPass(
    assets,
    {
      wwdr: certs.wwdr,
      signerCert: certs.signerCert,
      signerKey: certs.signerKey,
      signerKeyPassphrase: certs.signerKeyPassphrase,
    },
    {
      formatVersion: 1,
      serialNumber: member.serial_number,
      passTypeIdentifier: certs.passTypeIdentifier,
      teamIdentifier: certs.teamIdentifier,
      organizationName: BUSINESS.name,
      description: copy.description,
      backgroundColor: hexToRgb("#000000"),
      foregroundColor: hexToRgb("#ffffff"),
      labelColor: hexToRgb("#ff70e0"),
      webServiceURL: `${SITE_URL}/api/wallet/v1`,
      authenticationToken: member.auth_token,
    },
  );

  pass.type = "storeCard";

  pass.primaryFields.push({
    key: "stamps",
    label: copy.stampsLabel,
    value: `${member.stamps}/${member.stamps_required}`,
  });

  pass.secondaryFields.push(
    { key: "name", label: copy.nameLabel, value: member.name },
    { key: "member", label: copy.memberLabel, value: joinDate },
  );
  pass.auxiliaryFields.push({ key: "tier", label: copy.tierLabel, value: tier.label[member.locale] });

  pass.backFields.push(
    { key: "about", label: copy.backHeader, value: copy.backBody },
    { key: "address", label: copy.addressLabel, value: `${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}` },
    { key: "website", label: copy.websiteLabel, value: SITE_URL },
  );

  pass.setBarcodes({
    message: member.serial_number,
    format: "PKBarcodeFormatQR",
    messageEncoding: "iso-8859-1",
  });

  pass.setLocations({
    latitude: BUSINESS.geo.latitude,
    longitude: BUSINESS.geo.longitude,
    relevantText: relevantTextOfTheDay(member.locale),
  });

  return pass.getAsBuffer();
}
