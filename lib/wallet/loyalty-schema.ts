import { z } from "zod";

export const loyaltySignupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20),
  // Obligatorio: es la base de contacto para futuras campañas por correo.
  email: z.string().trim().email(),
  locale: z.enum(["es", "en"]).default("es"),
});

export type LoyaltySignupInput = z.infer<typeof loyaltySignupSchema>;
