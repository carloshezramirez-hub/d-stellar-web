import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // /analytics excluido: tiene su propio layout raíz (fuera de [locale]) y
  // no es parte del sitio bilingüe público — ver app/analytics/.
  matcher: ["/((?!api|_next|_vercel|analytics|.*\\..*).*)"],
};
