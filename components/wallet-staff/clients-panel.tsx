"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { KpiTile } from "@/components/admin/kpi-tile";
import { TierChart } from "@/components/wallet-staff/tier-chart";
import { resolveDateRange, withinRange } from "@/lib/admin/date-range";
import { SECTION_THEME } from "@/lib/admin/section-theme";

const ACCENT = SECTION_THEME.fidelidad.accent;

type Member = {
  name: string;
  phone: string;
  email: string | null;
  locale: "es" | "en";
  stamps: number;
  stamps_required: number;
  lifetime_stamps: number;
  tier: string;
  created_at: string;
};

function toCsv(members: Member[]): string {
  const header = ["Nombre", "Teléfono", "Email", "Nivel", "Sellos", "Sellos totales", "Desde"];
  const rows = members.map((m) => [
    m.name,
    m.phone,
    m.email ?? "",
    m.tier,
    `${m.stamps}/${m.stamps_required}`,
    String(m.lifetime_stamps),
    new Date(m.created_at).toLocaleDateString("es-MX"),
  ]);
  return [header, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCsv(members: Member[]) {
  const blob = new Blob([toCsv(members)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `d-stellar-clientes-fidelidad-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Lista de clientes de fidelidad — visible directo al entrar a /wallet-staff, sin un clic extra. */
export function ClientsPanel() {
  const [allMembers, setAllMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState(false);
  const searchParams = useSearchParams();
  const range = resolveDateRange(
    searchParams.get("range") ?? undefined,
    "all",
    searchParams.get("from") ?? undefined,
    searchParams.get("to") ?? undefined,
  );

  useEffect(() => {
    fetch("/api/wallet-staff/members")
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data: { members: Member[] }) => setAllMembers(data.members))
      .catch(() => setError(true));
  }, []);

  // El rango filtra por fecha de alta (created_at) — "clientes que se registraron en este periodo".
  const members = useMemo(() => allMembers?.filter((m) => withinRange(m.created_at, range)) ?? null, [allMembers, range]);

  const tierData = useMemo(() => {
    if (!members) return [];
    const counts = new Map<string, number>();
    for (const m of members) counts.set(m.tier, (counts.get(m.tier) ?? 0) + 1);
    return [...counts.entries()].map(([tier, count]) => ({ tier, count }));
  }, [members]);

  const totalStamps = members?.reduce((sum, m) => sum + m.lifetime_stamps, 0) ?? 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <p className="font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Clientes</p>
        <button
          type="button"
          disabled={!members?.length}
          onClick={() => members && downloadCsv(members)}
          className="bg-stellar-pink px-4 py-2 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          Descargar CSV
        </button>
      </div>

      <DateRangeFilter basePath="/wallet-staff" current={range.value} accent={ACCENT} />
      <p className="mb-6 -mt-3 text-[11px] text-stellar-white/35">El rango filtra por fecha de alta del cliente.</p>

      {error && <p className="text-sm text-stellar-red">No se pudo cargar la lista de clientes.</p>}
      {!error && !members && <p className="text-sm text-stellar-white/60">Cargando...</p>}

      {members && members.length > 0 && (
        <>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <KpiTile icon="👥" value={String(members.length)} label="clientes en el periodo" accent={ACCENT} />
            <KpiTile icon="⭐" value={String(totalStamps)} label="sus sellos (histórico)" accent={ACCENT} />
            <KpiTile
              icon="📈"
              value={(totalStamps / members.length).toFixed(1)}
              label="sellos promedio por cliente"
              accent={ACCENT}
            />
          </div>

          <div className="mb-10">
            <TierChart data={tierData} />
          </div>
        </>
      )}

      {members && members.length === 0 && (
        <p className="text-sm text-stellar-white/60">No hay clientes registrados en este rango de fechas.</p>
      )}

      {members && members.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-widest text-stellar-white/50">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Teléfono</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Nivel</th>
                <th className="py-2 pr-4">Sellos</th>
                <th className="py-2 pr-4">Desde</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.phone + m.name} className="border-b border-line/50 text-stellar-white">
                  <td className="py-2 pr-4">{m.name}</td>
                  <td className="py-2 pr-4">{m.phone}</td>
                  <td className="py-2 pr-4">{m.email || "—"}</td>
                  <td className="py-2 pr-4">{m.tier}</td>
                  <td className="py-2 pr-4">
                    {m.stamps}/{m.stamps_required}
                  </td>
                  <td className="py-2 pr-4">{new Date(m.created_at).toLocaleDateString("es-MX")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-stellar-white/40">{members.length} cliente(s) en total.</p>
        </div>
      )}
    </div>
  );
}
