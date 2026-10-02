"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PedidosLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/pedidos/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("invalid");
      router.push("/pedidos");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-5">
        <h1 className="font-bold text-2xl">d-stellar · Pedidos</h1>
        <label className="flex flex-col gap-2 text-sm text-stellar-white/80">
          Contraseña
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setStatus("idle");
            }}
            className="border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
          />
        </label>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center bg-stellar-pink px-6 py-3 text-xs font-bold uppercase tracking-widest text-stellar-black transition-colors hover:bg-stellar-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Entrando…" : "Entrar"}
        </button>
        {status === "error" && <p className="text-sm text-stellar-red">Contraseña incorrecta.</p>}
      </form>
    </main>
  );
}
