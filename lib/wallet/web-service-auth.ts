import { timingSafeEqual } from "node:crypto";

/** Header que manda Wallet en cada llamada al web service: `ApplePass <authenticationToken>`. */
export function isValidPassAuth(request: Request, expectedToken: string): boolean {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("ApplePass ")) return false;

  const provided = Buffer.from(header.slice("ApplePass ".length));
  const expected = Buffer.from(expectedToken);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
