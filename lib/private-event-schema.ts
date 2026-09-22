import { z } from "zod";

export const privateEventInquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  date: z.string().optional(),
  guests: z.string().max(20).optional(),
  message: z.string().min(5).max(1000),
});

export type PrivateEventInquiryValues = z.infer<typeof privateEventInquirySchema>;
