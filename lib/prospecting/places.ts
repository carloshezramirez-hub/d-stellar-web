import { BUSINESS } from "@/data/site";

/**
 * Prospección vía Google Places API (New) — Text Search, restringida
 * geográficamente a un círculo alrededor de la tienda (`locationRestriction`)
 * en vez de por ciudad. API oficial de Google (no scraping de Maps).
 * Requiere GOOGLE_PLACES_API_KEY con "Places API (New)" habilitada.
 *
 * El radio de búsqueda (2.5km) es solo la red geométrica gruesa: la
 * distancia en línea recta siempre es <= la distancia caminando, así que
 * un radio de 2.5km nunca deja fuera a un candidato que resulte caminable
 * <= 2km — el filtro real de "caminable" pasa después, en
 * `lib/prospecting/walking-distance.ts`.
 */
const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const SEARCH_RADIUS_M = 2500;

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.nationalPhoneNumber",
  "places.location",
].join(",");

function apiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY no está configurada.");
  return key;
}

export interface PlaceResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  websiteUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
}

interface RawPlace {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  location?: { latitude?: number; longitude?: number };
}

export async function textSearchNearby(category: string): Promise<PlaceResult[]> {
  const res = await fetch(TEXT_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: category,
      locationRestriction: {
        circle: {
          center: { latitude: BUSINESS.geo.latitude, longitude: BUSINESS.geo.longitude },
          radius: SEARCH_RADIUS_M,
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Places Text Search (New) HTTP ${res.status}: ${body}`);
  }

  const data = await res.json();
  const rawPlaces = (data.places ?? []) as RawPlace[];

  return rawPlaces.map((p) => ({
    placeId: p.id,
    name: p.displayName?.text ?? "",
    formattedAddress: p.formattedAddress ?? "",
    websiteUri: p.websiteUri ?? null,
    rating: p.rating ?? null,
    userRatingCount: p.userRatingCount ?? null,
    phone: p.nationalPhoneNumber ?? null,
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
  }));
}
