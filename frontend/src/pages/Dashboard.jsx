import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchFullAnalytics } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentId");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const studentId = localStorage.getItem("studentId");
    if (!token || !studentId) return navigate("/login", { replace: true });

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchFullAnalytics({ token, studentId });
        setAnalytics(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const student = analytics?.student ?? {};
  const marks = analytics?.marks ?? [];
  const attendance = analytics?.attendance ?? [];
  const avgMarks = Math.round((analytics?.averageMarks ?? 0) * 100) / 100;
  const riskLevel = analytics?.riskLevel ?? "-";
  const arrearCount = typeof analytics?.arrearCount === "number"
    ? analytics.arrearCount
    : marks.length
      ? marks.filter(m => ((m.internal ?? 0) + (m.external ?? 0)) < 40).length
      : 0;

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px"
  };

  const thStyle = {
    padding: "10px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    fontWeight: "600",
    color: "#333",
    background: "#f9f9f9"
  };

  const tdStyle = {
    padding: "10px",
    borderBottom: "1px solid #eee"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#333", margin: "0" }}>Academic Dashboard</h1>
          <button
            onClick={handleLogout}
            style={{ padding: "10px 20px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "40px", background: "white", borderRadius: "8px", textAlign: "center" }}>Loading dashboard...</div>
        ) : error && !analytics ? (
          <div style={{ padding: "20px", background: "#fee2e2", borderRadius: "8px", color: "#991b1b" }}>
            {error}
          </div>
        ) : (
          <>
            {/* 1️⃣ STUDENT PROFILE SECTION */}
            <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 15px 0" }}>Student Profile</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
                <div>
                  <p style={{ color: "#666", fontSize: "13px", margin: "0 0 5px 0" }}>Name</p>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#333", margin: "0" }}>{student.name ?? "-"}</p>
                </div>
                <div>
                  <p style={{ color: "#666", fontSize: "13px", margin: "0 0 5px 0" }}>Department</p>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#333", margin: "0" }}>{student.department ?? "-"}</p>
                </div>
                <div>
                  <p style={{ color: "#666", fontSize: "13px", margin: "0 0 5px 0" }}>Semester</p>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#333", margin: "0" }}>{student.semester ?? "-"}</p>
                </div>
                <div>
                  <p style={{ color: "#666", fontSize: "13px", margin: "0 0 5px 0" }}>CGPA</p>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#4f46e5", margin: "0" }}>{student.cgpa ?? "-"}</p>
                </div>
              </div>
            </div>

            {/* 2️⃣ ACADEMIC PERFORMANCE SUMMARY */}
              <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 15px 0" }}>Academic Performance Summary</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                <div style={{ padding: "15px", background: "#f0f9ff", borderRadius: "6px", borderLeft: "4px solid #3b82f6" }}>
                  <p style={{ color: "#666", fontSize: "13px", margin: "0 0 8px 0" }}>Average Marks</p>
                  <p style={{ fontSize: "28px", fontWeight: "bold", color: "#3b82f6", margin: "0" }}>{avgMarks}</p>
                </div>
                <div style={{ padding: "15px", background: riskLevel === "High" ? "#fef2f2" : riskLevel === "Medium" ? "#fffbeb" : "#f0fdf4", borderRadius: "6px", borderLeft: `4px solid ${riskLevel === "High" ? "#ef4444" : riskLevel === "Medium" ? "#f59e0b" : "#10b981"}` }}>
                  <p style={{ color: "#666", fontSize: "13px", margin: "0 0 8px 0" }}>Risk Level</p>
                  <p style={{ fontSize: "28px", fontWeight: "bold", color: riskLevel === "High" ? "#ef4444" : riskLevel === "Medium" ? "#f59e0b" : "#10b981", margin: "0" }}>{riskLevel}</p>
                </div>
                <div style={{ padding: "15px", background: arrearCount > 0 ? "#fff7f7" : "#f0fdf4", borderRadius: "6px", borderLeft: `4px solid ${arrearCount > 0 ? "#ef4444" : "#10b981"}` }}>
                  <p style={{ color: "#666", fontSize: "13px", margin: "0 0 8px 0" }}>Arrears</p>
                  <p style={{ fontSize: "28px", fontWeight: "bold", color: arrearCount > 0 ? "#ef4444" : "#10b981", margin: "0" }}>{arrearCount}</p>
                </div>
              </div>
            </div>

            {/* 3️⃣ SUBJECT-WISE MARKS */}
            <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 15px 0" }}>Subject-wise Marks</h2>
              {marks.length > 0 ? (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Subject</th>
                      <th style={thStyle}>Internal</th>
                      <th style={thStyle}>External</th>
                      <th style={thStyle}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((mark, index) => (
                      <tr key={index}>
                        <td style={tdStyle}>{mark.subject ?? "-"}</td>
                        <td style={tdStyle}>{mark.internal ?? "-"}</td>
                        <td style={tdStyle}>{mark.external ?? "-"}</td>
                        <td style={{...tdStyle, fontWeight: "600", color: "#4f46e5"}}>{(mark.internal ?? 0) + (mark.external ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>No marks data available</p>
              )}
            </div>

            {/* 4️⃣ ATTENDANCE SECTION */}
            <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 15px 0" }}>Attendance</h2>
              {attendance.length > 0 ? (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Subject</th>
                      <th style={thStyle}>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((att, index) => (
                      <tr key={index}>
                        <td style={tdStyle}>{att.subject ?? "-"}</td>
                        <td style={{...tdStyle, fontWeight: "600", color: att.attendancePercentage >= 75 ? "#10b981" : "#ef4444"}}>
                          {att.attendancePercentage ?? "-"}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>No attendance data available</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
