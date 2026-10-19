"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Member = {
  name: string;
  phone: string;
  email: string;
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
    m.email,
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

export default function WalletStaffClientesPage() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/wallet-staff/members")
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data: { members: Member[] }) => setMembers(data.members))
      .catch(() => setError(true));
  }, []);

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <h1 className="font-demi text-sm font-bold uppercase tracking-widest text-stellar-white">
            d-stellar · Clientes de fidelidad
          </h1>
          <Link href="/wallet-staff" className="text-xs text-stellar-white/60 underline underline-offset-4">
            ← Volver al escáner
          </Link>
        </div>
        <button
          type="button"
          disabled={!members?.length}
          onClick={() => members && downloadCsv(members)}
          className="bg-stellar-pink px-4 py-2 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          Descargar CSV
        </button>
      </header>

      <div className="mx-auto max-w-5xl p-6">
        {error && <p className="text-sm text-stellar-red">No se pudo cargar la lista de clientes.</p>}
        {!error && !members && <p className="text-sm text-stellar-white/60">Cargando...</p>}
        {members && members.length === 0 && (
          <p className="text-sm text-stellar-white/60">Todavía no hay clientes registrados.</p>
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
                  <tr key={m.email + m.phone} className="border-b border-line/50 text-stellar-white">
                    <td className="py-2 pr-4">{m.name}</td>
                    <td className="py-2 pr-4">{m.phone}</td>
                    <td className="py-2 pr-4">{m.email}</td>
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
    </main>
  );
}
