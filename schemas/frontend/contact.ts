import z from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Alias required for transmission."),
  email: z.string().email("Valid return address (email) required."),
  message: z.string().min(10, "Payload too small. Provide more context."),
});

export type ContactFormData = z.infer<typeof contactSchema>;
