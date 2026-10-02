import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ORDERS_SESSION_COOKIE, isValidOrdersSessionCookie } from "@/lib/orders-auth";

export default async function ProtectedPedidosLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ORDERS_SESSION_COOKIE)?.value;
  if (!isValidOrdersSessionCookie(session)) {
    redirect("/pedidos/login");
  }
  return <>{children}</>;
}
