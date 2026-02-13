import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

// Component to route to the correct dashboard based on role
function DashboardRouter() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole);
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>;
  }

  if (role === "faculty" || role === "teacher") {
    return <FacultyDashboard />;
  } else if (role === "student") {
    return <Dashboard />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
