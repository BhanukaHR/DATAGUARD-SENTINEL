import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../../services/auth-service";
import { toast } from "sonner";

const passwordSchema = z
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

const emailSchema = z.object({
  currentPassword: z.string().min(1, "Password required to confirm"),
  newEmail: z.string().email("Enter a valid email"),
});

export function DashboardCredentialsForm() {
  const [isLoading, setIsLoading] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  });

  const onChangePassword = async (data: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    const result = await authService.changeDashboardPassword(data.currentPassword, data.newPassword);
    setIsLoading(false);
    if (result.success) {
      toast.success("Dashboard password changed successfully");
      passwordForm.reset();
    } else {
      toast.error(result.error || "Failed to change password");
    }
  };

  const onChangeEmail = async (data: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    const result = await authService.changeDashboardEmail(data.currentPassword, data.newEmail);
    setIsLoading(false);
    if (result.success) {
      toast.success("Dashboard email changed successfully");
      emailForm.reset();
    } else {
      toast.error(result.error || "Failed to change email");
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Dashboard Login Password */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-slate-900 mb-1">Change Dashboard Login Password</h3>
        <p className="text-xs text-slate-500 mb-4">
          This changes YOUR dashboard admin password. It does NOT affect agent admin accounts.
        </p>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-3 max-w-md">
          <div>
            <input
              type="password"
              {...passwordForm.register("currentPassword")}
              placeholder="Current password"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              {...passwordForm.register("newPassword")}
              placeholder="New password"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              {...passwordForm.register("confirmPassword")}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors duration-150 disabled:opacity-50"
          >
            {isLoading ? "Changing..." : "Change Dashboard Password"}
          </button>
        </form>
      </div>

      {/* Change Dashboard Login Email */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-slate-900 mb-1">Change Dashboard Login Email</h3>
        <p className="text-xs text-slate-500 mb-4">
          Update the email address used to sign in to this dashboard.
        </p>
        <form onSubmit={emailForm.handleSubmit(onChangeEmail)} className="space-y-3 max-w-md">
          <div>
            <input
              type="password"
              {...emailForm.register("currentPassword")}
              placeholder="Current password to confirm"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {emailForm.formState.errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{emailForm.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <input
              type="email"
              {...emailForm.register("newEmail")}
              placeholder="New email address"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {emailForm.formState.errors.newEmail && (
              <p className="text-xs text-red-500 mt-1">{emailForm.formState.errors.newEmail.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors duration-150 disabled:opacity-50"
          >
            {isLoading ? "Changing..." : "Change Dashboard Email"}
          </button>
        </form>
      </div>
    </div>
  );
}
