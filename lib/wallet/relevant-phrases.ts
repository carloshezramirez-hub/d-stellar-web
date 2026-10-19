// Texto que aparece en la pantalla de bloqueo cuando el teléfono detecta
// que el cliente está cerca de Nuevo León 217 (geofence nativo de Wallet,
// ver pass.locations). Cambia una vez al día — "la frase del día" — para
// que valga la pena volver a ver la tarjeta, en vez de repetir siempre el
// mismo texto. El cron diario (app/api/cron/wallet-daily-refresh) empuja
// esta rotación a las tarjetas ya instaladas.
const PHRASES: Record<"es" | "en", string[]> = {
  es: [
    "¿Ya te diste un gusto hoy? Pasa a d-stellar.",
    "Nunca es un mal momento para una cookie.",
    "Pssst... hoy puede ser tu cheat day.",
    "Andas cerca. Tu cookie también.",
    "Una pausa dulce no le ha hecho daño a nadie.",
    "¿Café o cookie? ¿Por qué no los dos?",
    "Hoy amaneciste con cara de merecer algo rico.",
    "El universo (y d-stellar) te mandan una señal.",
    "Tu yo de las 5pm te lo va a agradecer.",
    "Spoiler: hoy sí puedes.",
    "Un break de 5 minutos. Una cookie que vas a recordar.",
    "¿Ya comiste algo rico hoy? Nosotros sí tenemos.",
    "No es destino, es que estás a dos cuadras.",
    "Sorpresa: estás cerca de tu lugar feliz.",
  ],
  en: [
    "Did you treat yourself today? Swing by d-stellar.",
    "There's never a bad time for a cookie.",
    "Psst... today could be your cheat day.",
    "You're close. So is your cookie.",
    "A sweet break never hurt anybody.",
    "Coffee or cookie? Why not both.",
    "You woke up looking like you deserve something good.",
    "The universe (and d-stellar) are sending you a sign.",
    "Future you will thank present you.",
    "Spoiler: today you can.",
    "A 5-minute break. A cookie you'll remember.",
    "Did you eat something good today? We did.",
    "It's not fate, you're just two blocks away.",
    "Surprise: you're near your happy place.",
  ],
};

export function relevantTextOfTheDay(locale: "es" | "en", date = new Date()): string {
  const pool = PHRASES[locale];
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - startOfYear) / 86_400_000);
  return pool[dayOfYear % pool.length];
}
