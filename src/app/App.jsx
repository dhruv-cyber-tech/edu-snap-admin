import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Users, Wallet, CalendarCheck, ClipboardList } from "lucide-react";

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
