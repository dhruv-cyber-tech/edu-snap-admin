import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CalendarCheck, ClipboardList } from "lucide-react";

import { Toaster } from "../components/ui/sonner";
import OfflineBanner from "../components/OfflineBanner";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../components/AppLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Resources from "../pages/Resources";
import Upload from "../pages/Upload";
import Settings from "../pages/Settings";
import Students from "../pages/Students";
import Fees from "../pages/Fees";
import ComingSoon from "../pages/ComingSoon";

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
            <Route path="/students" element={<Students />} />
            <Route path="/fees" element={<Fees />} />

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
