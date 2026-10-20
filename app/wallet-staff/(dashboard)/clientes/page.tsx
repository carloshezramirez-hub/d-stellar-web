import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

/** La lista de clientes ahora vive directo en /wallet-staff (fusionada con el escáner) — esta ruta se queda solo por si alguien tiene el link viejo guardado. */
export default async function WalletStaffClientesRedirect({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => Boolean(e[1]))).toString();
  redirect(query ? `/wallet-staff?${query}` : "/wallet-staff");
}
