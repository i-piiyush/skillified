import {z} from "zod"



  export const signUpValidation = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  domain: z.string().min(1, "Domain is required"),
  stack: z.string().min(1, "Stack is required"),
  role: z.string().min(1, "Role is required"),
});