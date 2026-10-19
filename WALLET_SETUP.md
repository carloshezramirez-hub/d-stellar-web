# Tarjeta de fidelidad en Apple Wallet (beta) — estado y referencia

Un cliente llena `/fidelidad`, se le genera un pase `.pkpass` firmado y lo
agrega a su Apple Wallet. Caja lo escanea en `/wallet-staff` para sumar
sellos o canjear, y la tarjeta ya instalada se actualiza sola (push de
Apple) sin que el cliente tenga que volver a descargarla. Aparte, iOS avisa
solo en la pantalla de bloqueo cuando el cliente pasa cerca de Nuevo León
217 (geofence nativo, sin servidor de por medio).

## Ya está hecho (2026-10-19)

- Pass Type ID `pass.co.d-stellar.loyalty` registrado en la cuenta Apple
  Developer de Carlos (Team ID `5879285VW5`), certificado emitido
  (expira 2027-11-18).
- Las 6 variables `APPLE_*` ya están en Vercel (Production + Preview) como
  secretos "sensitive" — nunca se guardaron en texto plano en ningún lado
  después de configurarlas.
- `/wallet-staff` ya no tiene su propia contraseña — desde el 2026-10-19
  cuelga del panel único `/admin` (una sola sesión para Fidelidad,
  Analytics, Eventos y Pedidos). Entra por `/admin/login` con
  `ANALYTICS_DASHBOARD_PASSWORD` y de ahí navega a cualquier sección sin
  volver a loguearte — ver `lib/admin-auth.ts`.
- `/wallet-staff/clientes` muestra la base completa de clientes que
  descargaron la tarjeta (nombre, teléfono, email, nivel, sellos) con
  descarga en CSV — el email es obligatorio desde el signup.
- Schema de Supabase aplicado al proyecto `d-stellar` (`loyalty_members`,
  `loyalty_devices`).
- Diseño final de la franja (`lib/wallet/strip.ts`): fondo negro con
  destellos rosa tipo "shine" (no un degradado parejo), logo + nombre del
  cliente (serif cursiva con glow rosa) + su nivel arriba, fila de sellos
  con la galleta en forma de estrella (foto real,
  `public/wallet/star-cookie.png`, recortada de `cookie-display-dark.webp`)
  con glow fuerte en las ganadas, y abajo en un solo renglón: la ecuación
  visual "10 🍪 = 1 🎁" a la izquierda + "MIEMBRO DESDE" (monospace) a la
  derecha — sin campos nativos de Wallet debajo, tarjeta compacta.
- Sistema de niveles (`lib/wallet/tiers.ts`), según sellos ganados en toda
  la vida del cliente (`lifetime_stamps`, nunca se reinicia al canjear):
  Cookie Noobie (0+) → Cookie Trotter (10+) → Cookie Insider (30+) → Elite
  Cookie (60+). Se muestra como badge junto al nombre.
- Regla confirmada por Carlos: **10 sellos = 1 sorpresa**.
- **Dirección de Instagram agregada** (2026-10-19): en Instagram →
  Configuración → Cuenta profesional, el campo "Business address" estaba
  vacío — se llenó con Av. Nuevo León 217, Mexico City, 06100 y se guardó.
  Meta puede tardar en procesar esto y generar el lugar "d-stellar" en el
  buscador de ubicaciones — si en unos días sigue sin aparecer, revisar de
  nuevo.

### Límite real de Apple Wallet (no se puede evitar)

El QR de la tarjeta lo renderiza **iOS de forma nativa** — cuadrado, fondo
blanco, sin ninguna opción de personalizar forma, color o ponerle algo
encima. No existe ese control en PassKit, así que una versión circular o en
forma de estrella no es técnicamente posible dentro de Wallet. Igual con el
fondo general de la tarjeta (fuera de la franja): es un color plano fijo,
no admite blur/transparencia en vivo — por eso todo el efecto "glass" vive
dentro de la imagen de la franja, que es la única zona personalizable.

## Cómo probarlo en un iPhone real

1. Confirma que el deploy en producción ya tiene este código (`git push` +
   Vercel build verde).
2. Desde Safari en el iPhone: `https://www.d-stellar.co/fidelidad` → llenar
   el formulario → se abre directo el diálogo "Add to Apple Wallet".
3. Agrégala. Si pide permiso de Localización para Wallet, dáselo
   ("Mientras se usa") — si no, el geofence no va a avisar.
4. Para ver el geofence sin ir a la tienda: en el iPhone/Simulador, cambia
   la ubicación simulada a `19.4111, -99.1732` (Ajustes → Privacidad →
   Localización → Servicios del sistema, o en Simulador: Features → Location
   → Custom Location).
5. Para probar que un sello sumado en `/wallet-staff` SÍ actualiza la
   tarjeta ya instalada: escanea el QR de esa misma tarjeta ahí, dale
   "+1 sello", y en unos segundos la tarjeta en el iPhone debería
   refrescarse sola (Wallet no tiene un botón de "refrescar" manual —
   si no se ve de inmediato, abre la app Wallet para forzar que revise).

## Cómo funciona el sistema de actualización en vivo

Tres piezas, todas ya construidas:

1. **Registro de dispositivo** (`app/api/wallet/v1/devices/...`) — cuando
   el cliente agrega el pase, Wallet llama solo a estos endpoints para
   avisar "este dispositivo quiere actualizaciones de este pase", mandando
   un push token de Apple. Se guarda en `loyalty_devices`.
2. **Push silencioso** (`lib/wallet/apns.ts`) — cuando caja suma un sello o
   canjea (`app/api/wallet-staff/scan`), o corre el cron diario de la frase
   (`app/api/cron/wallet-daily-refresh`), el servidor manda un push vacío a
   cada dispositivo registrado vía APNs. El mismo certificado del Pass Type
   ID sirve para autenticar esto — no hace falta un certificado push aparte.
3. **Descarga de la versión nueva** (`app/api/wallet/v1/passes/...`) — al
   recibir el push, Wallet le pide al servidor el pase actualizado
   (re-genera el `.pkpass` con el conteo/frase más reciente) y lo
   reinstala solo, sin que el cliente haga nada.

## Pantalla de staff (`/wallet-staff`)

Protegida con `WALLET_STAFF_PASSWORD` (mismo patrón que `/analytics`).
Abre la cámara, lee el QR de la tarjeta, muestra nombre + sellos actuales,
y dos botones: **+1 sello** y **Canjear / reiniciar** (pone el contador en
0 — para cuando el cliente ya cobró su sorpresa). Funciona en cualquier
celular/tablet con cámara y navegador — no necesita instalar nada.

## La frase del día (geofence)

`lib/wallet/relevant-phrases.ts` tiene un banco de frases en español e
inglés (las que pidió Carlos: "¿Ya te diste un gusto hoy?", "Nunca es un
mal momento para una cookie", etc.) que rota una vez al día — todos los
clientes ven la misma frase ese día, y cambia al día siguiente. El cron
`wallet-daily-refresh` (6am CDMX, ver `vercel.json`) empuja esa rotación a
las tarjetas ya instaladas. Para agregar/editar frases, solo edita el
arreglo en ese archivo.

## Si hay que regenerar el certificado desde cero

Por si el certificado actual se revoca o expira — los pasos completos
(crear Pass Type ID, generar CSR en Keychain Access, exportar `.p12`,
convertir a PEM, cargar en Vercel) quedaron documentados en el historial de
esta conversación con Claude; si hace falta repetirlos, pide que te los
vuelva a escribir aquí.

## Pendiente / decisiones abiertas

- **Google Wallet**: fuera de este beta a propósito — se puede agregar
  después si hace falta cubrir Android.
- **Qué pasa si falla un push** (token inválido, dispositivo desinstaló la
  tarjeta): por ahora solo se loguea el error, no se limpia
  `loyalty_devices` automáticamente — aceptable para el volumen de un beta,
  revisar si crece.
- **Ubicación de Instagram**: dirección ya cargada (ver arriba), pendiente
  de que Meta la procese y aparezca "d-stellar" como lugar propio en el
  buscador de ubicaciones.
