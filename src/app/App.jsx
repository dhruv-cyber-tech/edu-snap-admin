import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Users, Wallet, CalendarCheck, ClipboardList } from "lucide-react";

import { Toaster } from "@/components/ui/sonner";
import OfflineBanner from "@/components/OfflineBanner";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Resources from "@/pages/Resources";
import Upload from "@/pages/Upload";
import Settings from "@/pages/Settings";
import ComingSoon from "@/pages/ComingSoon";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" richColors />
      <OfflineBanner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/students"
              element={
                <ComingSoon
                  title="Students"
                  description="Student portal"
                  icon={Users}
                  message="Student portal coming soon"
                  features={[
                    "Student profiles",
                    "Login access",
                    "Assignment submissions",
                    "Progress tracking",
                  ]}
                />
              }
            />
            <Route
              path="/fees"
              element={
                <ComingSoon
                  title="Fees"
                  description="Fee management"
                  icon={Wallet}
                  message="Fee management coming soon"
                  features={[
                    "Fee records",
                    "Payment tracking",
                    "Due date reminders",
                    "Payment history",
                  ]}
                />
              }
            />
            <Route
              path="/attendance"
              element={
                <ComingSoon
                  title="Attendance"
                  description="Attendance tracking"
                  icon={CalendarCheck}
                  message="Attendance tracking coming soon"
                  features={[
                    "Daily attendance marking",
                    "Attendance reports",
                    "Student-wise summary",
                  ]}
                />
              }
            />
            <Route
              path="/scores"
              element={
                <ComingSoon
                  title="Scores"
                  description="Test score tracking"
                  icon={ClipboardList}
                  message="Test scores coming soon"
                  features={[
                    "Test score entry",
                    "Subject-wise performance",
                    "Progress charts",
                    "Parent reports",
                  ]}
                />
              }
            />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
