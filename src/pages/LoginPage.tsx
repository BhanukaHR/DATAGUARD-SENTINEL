import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../services/auth-service";
import { useAuthStore } from "../store/auth-store";
import type { DashboardAdmin } from "../types/admin";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const result = await authService.login(data.email, data.password);
    setIsLoading(false);

    if (result.success) {
      const profile = await authService.getDashboardAdminProfile();
      setAuth({ isAuthenticated: true, admin: profile as DashboardAdmin | null });
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Shield className="h-10 w-10 text-slate-900" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">DataGuard Sentinel</h1>
          <p className="text-sm text-slate-500 mt-1">Dashboard Admin Login</p>
          <p className="text-xs text-slate-400 mt-1">
            This is the dashboard admin portal. Agent admins use ConfigUI.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700">Email</label>
              <input
                type="email"
                {...form.register("email")}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@dataguard.com"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">Password</label>
              <input
                type="password"
                {...form.register("password")}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors duration-150 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
