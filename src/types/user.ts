export interface UserAccount {
  userId: string;
  username: string;
  employeeId: string;
  machineName: string;
  registeredAt: Date | string;
  status: "active" | "inactive" | "uninstalled" | "removed";
  registeredBy: string;
  department?: string;
  email?: string;
  uninstalledAt?: Date | string;
}
