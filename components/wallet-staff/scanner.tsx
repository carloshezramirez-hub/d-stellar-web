"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type Member = { name: string; stamps: number; stamps_required: number };
type Status = "idle" | "scanning" | "found" | "error" | "camera_error";

export function WalletStaffScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [serial, setSerial] = useState<string | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleScanned = useCallback(
    async (value: string) => {
      stopCamera();
      setSerial(value);
      try {
        const res = await fetch(`/api/wallet-staff/lookup?serial=${encodeURIComponent(value)}`);
        if (!res.ok) throw new Error("not_found");
        const data = (await res.json()) as Member;
        setMember(data);
        setStatus("found");
      } catch {
        setStatus("error");
      }
    },
    [stopCamera],
  );

  // Ref-based (not useCallback) on purpose: the scan loop calls itself via
  // requestAnimationFrame, and a self-referencing useCallback trips the
  // stricter react-hooks lint rules here. The effect below keeps it closed
  // over the latest `handleScanned` — refs can't be written during render.
  const tickRef = useRef<() => void>(() => {});
  useEffect(() => {
    tickRef.current = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) {
            void handleScanned(code.data);
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(() => tickRef.current());
    };
  }, [handleScanned]);

  const startCamera = useCallback(async () => {
    setStatus("scanning");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      tickRef.current();
    } catch {
      setStatus("camera_error");
    }
  }, []);

  function reset() {
    setSerial(null);
    setMember(null);
    setMessage(null);
    void startCamera();
  }

  async function act(action: "stamp" | "redeem") {
    if (!serial) return;
    setBusy(true);
    try {
      const res = await fetch("/api/wallet-staff/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial, action }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { member: Member };
      setMember(data.member);
      setMessage(action === "redeem" ? "Canjeado — contador reiniciado." : "Visita agregada.");
    } catch {
      setMessage("Algo salió mal. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  // La cámara solo arranca cuando el staff toca "Escanear" — no al cargar
  // la página — así el permiso del navegador no salta de sorpresa y el
  // dashboard es lo primero que se ve.
  useEffect(() => stopCamera, [stopCamera]);

  return (
    <div className="mx-auto grid max-w-md gap-6 p-6">
      {status === "idle" && (
        <div className="grid gap-5 border-2 border-line bg-stellar-black-soft p-6 text-center">
          <div>
            <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/50">d-stellar · Fidelidad</p>
            <p className="mt-2 font-demi text-lg font-bold text-stellar-white">Escanea la tarjeta del cliente</p>
          </div>
          <button
            type="button"
            onClick={() => void startCamera()}
            className="bg-stellar-pink px-6 py-4 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black"
          >
            Escanear código QR
          </button>
        </div>
      )}

      {status === "scanning" && (
        <div className="relative aspect-square w-full overflow-hidden border-2 border-line bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
          <p className="absolute bottom-3 left-0 right-0 text-center font-tag text-xs uppercase tracking-widest text-stellar-white/80">
            Apunta al código QR de la tarjeta
          </p>
        </div>
      )}

      {status === "camera_error" && (
        <p className="text-sm text-stellar-red">
          No se pudo acceder a la cámara. Revisa los permisos del navegador y recarga la página.
        </p>
      )}

      {status === "error" && (
        <div className="grid gap-3">
          <p className="text-sm text-stellar-red">No se encontró ninguna tarjeta con ese código.</p>
          <button
            type="button"
            onClick={reset}
            className="bg-stellar-pink px-6 py-3 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black"
          >
            Escanear otra
          </button>
        </div>
      )}

      {status === "found" && member && (
        <div className="grid gap-5 border-2 border-line bg-stellar-black-soft p-6">
          <div>
            <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/50">Cliente</p>
            <p className="font-demi text-xl font-bold text-stellar-white">{member.name}</p>
          </div>
          <div>
            <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/50">Visitas</p>
            <p className="font-display text-3xl font-black text-stellar-pink">
              {member.stamps}/{member.stamps_required}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled={busy || member.stamps >= member.stamps_required}
              onClick={() => act("stamp")}
              className="bg-stellar-pink px-6 py-3 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              + 1 visita
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => act("redeem")}
              className="border-2 border-stellar-white px-6 py-3 font-tag text-xs font-bold uppercase tracking-widest text-stellar-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Canjear / reiniciar
            </button>
          </div>

          {message && <p className="text-sm text-stellar-green">{message}</p>}

          <button type="button" onClick={reset} className="text-xs text-stellar-white/60 underline underline-offset-4">
            Escanear otra tarjeta
          </button>
        </div>
      )}
    </div>
  );
}
