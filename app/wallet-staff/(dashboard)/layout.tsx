import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WALLET_STAFF_SESSION_COOKIE, isValidStaffSessionCookie } from "@/lib/wallet/staff-auth";

export default async function ProtectedWalletStaffLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(WALLET_STAFF_SESSION_COOKIE)?.value;
  if (!isValidStaffSessionCookie(session)) {
    redirect("/wallet-staff/login");
  }
  return <>{children}</>;
}
