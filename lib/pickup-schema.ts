import { z } from "zod";

export const pickupOrderLineSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  qty: z.number().min(1).max(20),
  priceMXN: z.number().min(0),
  flavors: z.array(z.string()).optional(),
});

export const pickupOrderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  date: z.string().min(1),
  time: z.string().min(1),
  notes: z.string().max(500).optional(),
  items: z.array(pickupOrderLineSchema).min(1),
});

export type PickupOrderFormValues = z.infer<typeof pickupOrderSchema>;
