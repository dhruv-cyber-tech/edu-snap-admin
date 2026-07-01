import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  Settings,
  Users,
  Wallet,
  CalendarCheck,
  ClipboardList,
} from "lucide-react";

// Main items shown in the mobile bottom bar and at the top of the sidebar.
export const mainNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resources", label: "Resources", icon: FolderOpen },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/students", label: "Students", icon: Users },
  { to: "/fees", label: "Fees", icon: Wallet },
  { to: "/settings", label: "Settings", icon: Settings },
];

// Future modules — visible on desktop sidebar as "Coming Soon", disabled.
export const comingSoonNav = [
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/scores", label: "Scores", icon: ClipboardList },
];
