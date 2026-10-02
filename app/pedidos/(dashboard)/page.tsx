import { listOrders, type EmailDeliveryStatus } from "@/lib/orders-db";
import { LogoutButton } from "@/components/pedidos/logout-button";
import { ResendButton } from "@/components/pedidos/resend-button";
import { SyncButton } from "@/components/pedidos/sync-button";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(amount);
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  }).format(new Date(iso));
}

const STATUS_LABEL: Record<EmailDeliveryStatus, string> = {
  pending: "Pendiente",
  sent: "Enviado",
  bounced: "Rebotó",
  complained: "Marcado spam",
  failed: "Falló",
};

const STATUS_CLASS: Record<EmailDeliveryStatus, string> = {
  pending: "border-stellar-white/30 text-stellar-white/60",
  sent: "border-emerald-500 text-emerald-400",
  bounced: "border-stellar-red text-stellar-red",
  complained: "border-stellar-red text-stellar-red",
  failed: "border-stellar-red text-stellar-red",
};

function StatusBadge({ status }: { status: EmailDeliveryStatus }) {
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

const KIND_LABEL: Record<string, string> = { ticket: "Boleto", pickup: "Pickup" };

export default async function PedidosPage() {
  const orders = await listOrders();
  const needsAttention = orders.filter((o) => o.email_customer_status === "bounced" || o.email_customer_status === "failed" || o.email_customer_status === "complained");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl">d-stellar · Pedidos</h1>
          <p className="mt-1 text-sm text-stellar-white/60">
            Historial de todas las compras web (boletos + pickup) — se registra al momento del pago, pase lo que pase con el correo.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <SyncButton />
          <LogoutButton />
        </div>
      </div>

      {needsAttention.length > 0 && (
        <div className="mb-8 border border-stellar-red/60 bg-stellar-red/10 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-stellar-red">
            {needsAttention.length} pedido{needsAttention.length > 1 ? "s" : ""} con el correo sin confirmar entrega — revisa abajo.
          </p>
        </div>
      )}

      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-widest text-stellar-white/50">
              <th className="px-3 py-3">Fecha</th>
              <th className="px-3 py-3">Tipo</th>
              <th className="px-3 py-3">Código</th>
              <th className="px-3 py-3">Concepto</th>
              <th className="px-3 py-3">Monto</th>
              <th className="px-3 py-3">Cliente</th>
              <th className="px-3 py-3">Correo cliente</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-line/50 align-top">
                <td className="whitespace-nowrap px-3 py-3 text-stellar-white/70">{formatDateTime(order.created_at)}</td>
                <td className="px-3 py-3">{KIND_LABEL[order.kind] ?? order.kind}</td>
                <td className="whitespace-nowrap px-3 py-3 font-mono text-xs">{order.code}</td>
                <td className="px-3 py-3">{order.concept}</td>
                <td className="whitespace-nowrap px-3 py-3">{formatMoney(order.amount_mxn, order.currency)}</td>
                <td className="px-3 py-3">
                  <div>{order.customer_name || "—"}</div>
                  <div className="text-xs text-stellar-white/50">{order.customer_phone || "—"}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="mb-1 break-all text-xs">{order.customer_email}</div>
                  <StatusBadge status={order.email_customer_status} />
                </td>
                <td className="px-3 py-3">
                  <ResendButton orderId={order.id} customerEmail={order.customer_email} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-stellar-white/50">
                  Todavía no hay pedidos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
