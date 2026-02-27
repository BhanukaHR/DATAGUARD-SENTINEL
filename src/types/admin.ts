export interface DashboardAdmin {
  dashboardAdminId: string;
  username: string;
  email: string;
  role: "dashboard_admin";
  createdAt: Date | string;
  lastLoginAt?: Date | string;
  passwordChangedAt?: Date | string;
}

export interface AgentAdmin {
  adminId: string;
  email: string;
  passwordHash: string;
  role: "administrator";
  createdAt: Date | string;
  lastLoginAt?: Date | string;
  passwordChangedAt?: Date | string;
  organizationId?: string;
  machineName?: string;
}
