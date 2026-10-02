import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // /analytics y /pedidos excluidos: tienen su propio layout raíz (fuera de
  // [locale]) y no son parte del sitio bilingüe público — ver
  // app/analytics/ y app/pedidos/.
  matcher: ["/((?!api|_next|_vercel|analytics|pedidos|.*\\..*).*)"],
};
