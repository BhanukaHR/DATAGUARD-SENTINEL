import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const emailChangeSchema = z.object({
  currentPassword: z.string().min(1, "Password required to confirm"),
  newEmail: z.string().email("Enter a valid email"),
});

export const domainSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Enter a valid domain"),
  category: z.enum(["Trusted", "Known", "Unknown", "Suspicious", "Blacklisted"]),
  trustScore: z.number().min(0).max(100),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type PasswordChangeData = z.infer<typeof passwordChangeSchema>;
export type EmailChangeData = z.infer<typeof emailChangeSchema>;
export type DomainFormData = z.infer<typeof domainSchema>;
