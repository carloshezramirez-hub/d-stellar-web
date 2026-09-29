"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/analytics/logout", { method: "POST" });
    router.push("/analytics/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-xs uppercase tracking-widest text-stellar-white/60 hover:text-stellar-white"
    >
      Salir
    </button>
  );
}
