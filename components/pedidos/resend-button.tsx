"use client";

import { useState, useTransition } from "react";
import { resendOrderEmail } from "@/app/pedidos/(dashboard)/actions";

export function ResendButton({ orderId, customerEmail }: { orderId: string; customerEmail: string }) {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(customerEmail);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<"idle" | "ok" | "error">("idle");

  function handleResend() {
    setResult("idle");
    startTransition(async () => {
      const res = await resendOrderEmail(orderId, email !== customerEmail ? email : undefined);
      setResult(res.ok ? "ok" : "error");
      if (res.ok) setEditing(false);
    });
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-line bg-transparent px-2 py-1 text-xs text-stellar-white outline-none focus:border-stellar-pink"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={pending}
            className="text-xs font-bold uppercase tracking-widest text-stellar-pink hover:text-stellar-white disabled:opacity-50"
          >
            {pending ? "Enviando…" : "Confirmar y reenviar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setEmail(customerEmail);
            }}
            className="text-xs uppercase tracking-widest text-stellar-white/50 hover:text-stellar-white"
          >
            Cancelar
          </button>
        </div>
        {result === "error" && <p className="text-xs text-stellar-red">No se pudo enviar.</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={pending}
          className="text-xs font-bold uppercase tracking-widest text-stellar-pink hover:text-stellar-white disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Reenviar correo"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs uppercase tracking-widest text-stellar-white/50 hover:text-stellar-white"
        >
          Corregir correo
        </button>
      </div>
      {result === "ok" && <p className="text-xs text-stellar-white/60">Enviado ✓</p>}
      {result === "error" && <p className="text-xs text-stellar-red">No se pudo enviar.</p>}
    </div>
  );
}
