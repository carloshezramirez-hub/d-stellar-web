import { z } from "zod";

export const ticketOrderSchema = z.object({
  eventSlug: z.string().min(1),
  ticketIndex: z.number().int().min(0),
  qty: z.number().int().min(1).max(4),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  notes: z.string().max(500).optional(),
});

export type TicketOrderFormValues = z.infer<typeof ticketOrderSchema>;
