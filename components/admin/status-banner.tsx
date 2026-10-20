export type DataStatus = "empty" | "not_connected" | "error";

const STYLE: Record<DataStatus, string> = {
  empty: "border-line text-stellar-white/60",
  not_connected: "border-stellar-white/15 text-stellar-white/45",
  error: "border-stellar-red/50 bg-stellar-red/5 text-stellar-red",
};

/** Un solo tipo de aviso para los 3 casos que siempre se confunden: no hay datos en el rango, la fuente no está conectada, o algo falló al cargar — nunca mezclados. */
export function StatusBanner({ status, message }: { status: DataStatus; message: string }) {
  return <div className={`mb-6 rounded border p-4 text-sm ${STYLE[status]}`}>{message}</div>;
}
