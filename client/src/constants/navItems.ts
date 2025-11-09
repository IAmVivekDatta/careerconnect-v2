import {
  Award,
  BarChart3,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Users,
  UserPlus
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "../types";

type NavRoles = UserRole[] | undefined;

export interface AppNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: NavRoles;
}

export const appNavItems: AppNavItem[] = [
  { to: "/feed", label: "Feed", icon: Home },
  { to: "/opportunities", label: "Opportunities", icon: BriefcaseBusiness },
  { to: "/alumni", label: "Alumni", icon: GraduationCap },
  { to: "/connections", label: "Connections", icon: UserPlus },
  { to: "/achievements", label: "Achievements", icon: Award },
  { to: "/messages", label: "Messages", icon: MessageCircle }
];

export const adminNavItems: AppNavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { to: "/admin/users", label: "Users", icon: Users, roles: ["admin"] },
  { to: "/admin/posts", label: "Posts", icon: FileText, roles: ["admin"] },
  { to: "/admin/opportunities", label: "Opportunities", icon: BriefcaseBusiness, roles: ["admin"] },
  { to: "/admin/reports", label: "Reports", icon: BarChart3, roles: ["admin"] },
  { to: "/admin/settings", label: "Settings", icon: Settings, roles: ["admin"] }
];
