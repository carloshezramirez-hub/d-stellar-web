import { BUSINESS } from "@/data/site";
import type { PlaceResult } from "./places";

/**
 * Filtra una lista de PlaceResult a solo los que están de verdad a <= 2km
 * CAMINANDO desde la tienda — nunca línea recta. Usa Google Distance
 * Matrix API (mode=walking), no una estimación. Requiere
 * GOOGLE_PLACES_API_KEY con "Distance Matrix API" habilitada (mismo
 * proyecto de Google Cloud que Places API).
 */
const DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";
const MAX_WALKING_DISTANCE_M = 2000;
const BATCH_SIZE = 25; // límite de destinos por request de Distance Matrix API

function apiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY no está configurada.");
  return key;
}

export interface WalkableResult {
  place: PlaceResult;
  walkingDistanceM: number;
  walkingDurationMin: number;
}

interface DistanceMatrixElement {
  status: string;
  distance?: { value: number };
  duration?: { value: number };
}

async function fetchBatch(destinations: PlaceResult[]): Promise<DistanceMatrixElement[]> {
  const origin = `${BUSINESS.geo.latitude},${BUSINESS.geo.longitude}`;
  const destParam = destinations.map((d) => `${d.lat},${d.lng}`).join("|");

  const url = new URL(DISTANCE_MATRIX_URL);
  url.searchParams.set("origins", origin);
  url.searchParams.set("destinations", destParam);
  url.searchParams.set("mode", "walking");
  url.searchParams.set("key", apiKey());

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Distance Matrix API HTTP ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  if (data.status !== "OK") {
    throw new Error(`Distance Matrix API status ${data.status}: ${data.error_message ?? ""}`);
  }
  return (data.rows?.[0]?.elements ?? []) as DistanceMatrixElement[];
}

/** Divide `items` en lotes de tamaño `size`. */
function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

export async function filterWalkable(places: PlaceResult[]): Promise<WalkableResult[]> {
  const withCoords = places.filter((p) => p.lat !== null && p.lng !== null);
  const results: WalkableResult[] = [];

  for (const batch of chunk(withCoords, BATCH_SIZE)) {
    const elements = await fetchBatch(batch);
    elements.forEach((el, i) => {
      if (el.status !== "OK" || !el.distance || !el.duration) return;
      if (el.distance.value > MAX_WALKING_DISTANCE_M) return;
      results.push({
        place: batch[i],
        walkingDistanceM: el.distance.value,
        walkingDurationMin: Math.round(el.duration.value / 60),
      });
    });
  }

  return results;
}
