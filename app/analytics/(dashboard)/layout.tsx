import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ANALYTICS_SESSION_COOKIE, isValidSessionCookie } from "@/lib/social/dashboard-auth";

export default async function ProtectedAnalyticsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ANALYTICS_SESSION_COOKIE)?.value;
  if (!isValidSessionCookie(session)) {
    redirect("/analytics/login");
  }
  return <>{children}</>;
}
