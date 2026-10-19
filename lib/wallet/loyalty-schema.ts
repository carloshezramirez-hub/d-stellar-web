import { z } from "zod";

export const loyaltySignupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20),
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  locale: z.enum(["es", "en"]).default("es"),
});

export type LoyaltySignupInput = z.infer<typeof loyaltySignupSchema>;
