import type { TopProduct } from "@/lib/odoo/sales";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

/** Tabla en vez de gráfica — permite comparar unidades vs. ingreso de un vistazo, ordenada por lo que de verdad importa: cuánto factura cada producto. */
export function TopProductsTable({ products }: { products: TopProduct[] }) {
  if (products.length === 0) return null;
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Productos más vendidos por ingreso</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-widest text-stellar-white/40">
              <th className="py-2 pr-3">Producto</th>
              <th className="py-2 pr-3 text-right">Unidades</th>
              <th className="py-2 pr-3 text-right">Ingreso</th>
              <th className="py-2 pr-3 text-right">% del total</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.name} className="border-b border-line/30">
                <td className="py-2 pr-3 truncate text-stellar-white/80">{p.name}</td>
                <td className="py-2 pr-3 text-right text-stellar-white/70">{p.qty.toFixed(0)}</td>
                <td className="py-2 pr-3 text-right font-bold text-stellar-white">{formatMoney(p.revenue)}</td>
                <td className="py-2 pr-3 text-right text-stellar-white/50">
                  {totalRevenue > 0 ? `${((p.revenue / totalRevenue) * 100).toFixed(1)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
