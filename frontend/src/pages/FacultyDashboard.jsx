import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAllStudents, addMarks, addAttendance } from "../services/api";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("students");
  const [successMessage, setSuccessMessage] = useState("");

  // Form states for marks
  const [marksForm, setMarksForm] = useState({
    studentId: "",
    subject: "",
    internal: "",
    external: ""
  });

  // Form states for attendance
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: "",
    subject: "",
    attendancePercentage: ""
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentId");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login", { replace: true });

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAllStudents(token);
        setStudents(data);
      } catch (err) {
        setError(err.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const handleMarksChange = (e) => {
    const { name, value } = e.target;
    setMarksForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await addMarks(token, {
        studentId: marksForm.studentId,
        subject: marksForm.subject,
        internal: parseInt(marksForm.internal),
        external: parseInt(marksForm.external)
      });
      setSuccessMessage("✅ Marks added successfully");
      setMarksForm({ studentId: "", subject: "", internal: "", external: "" });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAttendanceChange = (e) => {
    const { name, value } = e.target;
    setAttendanceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await addAttendance(token, {
        studentId: attendanceForm.studentId,
        subject: attendanceForm.subject,
        attendancePercentage: parseInt(attendanceForm.attendancePercentage)
      });
      setSuccessMessage("✅ Attendance added successfully");
      setAttendanceForm({ studentId: "", subject: "", attendancePercentage: "" });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#333", margin: "0" }}>Faculty Dashboard</h1>
          <button
            onClick={handleLogout}
            style={{ padding: "10px 20px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={() => setActiveTab("students")}
            style={{
              padding: "10px 20px",
              background: activeTab === "students" ? "#4f46e5" : "#e5e7eb",
              color: activeTab === "students" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Students List
          </button>
          <button
            onClick={() => setActiveTab("marks")}
            style={{
              padding: "10px 20px",
              background: activeTab === "marks" ? "#4f46e5" : "#e5e7eb",
              color: activeTab === "marks" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Add Marks
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            style={{
              padding: "10px 20px",
              background: activeTab === "attendance" ? "#4f46e5" : "#e5e7eb",
              color: activeTab === "attendance" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Add Attendance
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div style={{ padding: "15px", background: "#fee2e2", borderRadius: "4px", color: "#991b1b", marginBottom: "20px" }}>
            {error}
          </div>
        )}
        {successMessage && (
          <div style={{ padding: "15px", background: "#dcfce7", borderRadius: "4px", color: "#166534", marginBottom: "20px" }}>
            {successMessage}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ padding: "40px", background: "white", borderRadius: "8px", textAlign: "center" }}>Loading...</div>
        ) : (
          <>
            {/* Students List Tab */}
            {activeTab === "students" && (
              <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 15px 0" }}>All Students</h2>
                {students.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "600", color: "#333", background: "#f9f9f9" }}>Name</th>
                        <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "600", color: "#333", background: "#f9f9f9" }}>Department</th>
                        <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "600", color: "#333", background: "#f9f9f9" }}>Semester</th>
                        <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "600", color: "#333", background: "#f9f9f9" }}>CGPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student._id}>
                          <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{student.name}</td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{student.department}</td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{student.semester}</td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #eee", fontWeight: "600", color: "#4f46e5" }}>{student.cgpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: "#999" }}>No students found</p>
                )}
              </div>
            )}

            {/* Add Marks Tab */}
            {activeTab === "marks" && (
              <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", maxWidth: "500px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 20px 0" }}>Add Marks</h2>
                <form onSubmit={handleMarksSubmit}>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "5px" }}>Student</label>
                    <select
                      name="studentId"
                      value={marksForm.studentId}
                      onChange={handleMarksChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontFamily: "inherit"
                      }}
                    >
                      <option value="">Select a student</option>
                      {students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "5px" }}>Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={marksForm.subject}
                      onChange={handleMarksChange}
                      placeholder="e.g., Signals and Systems"
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "5px" }}>Internal</label>
                      <input
                        type="number"
                        name="internal"
                        value={marksForm.internal}
                        onChange={handleMarksChange}
                        placeholder="Max 50"
                        min="0"
                        max="50"
                        required
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "14px",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "5px" }}>External</label>
                      <input
                        type="number"
                        name="external"
                        value={marksForm.external}
                        onChange={handleMarksChange}
                        placeholder="Max 50"
                        min="0"
                        max="50"
                        required
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "14px",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#4f46e5",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    Add Marks
                  </button>
                </form>
              </div>
            )}

            {/* Add Attendance Tab */}
            {activeTab === "attendance" && (
              <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", maxWidth: "500px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", margin: "0 0 20px 0" }}>Add Attendance</h2>
                <form onSubmit={handleAttendanceSubmit}>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "5px" }}>Student</label>
                    <select
                      name="studentId"
                      value={attendanceForm.studentId}
                      onChange={handleAttendanceChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontFamily: "inherit"
                      }}
                    >
                      <option value="">Select a student</option>
                      {students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "5px" }}>Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={attendanceForm.subject}
                      onChange={handleAttendanceChange}
                      placeholder="e.g., Signals and Systems"
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "5px" }}>Attendance %</label>
                    <input
                      type="number"
                      name="attendancePercentage"
                      value={attendanceForm.attendancePercentage}
                      onChange={handleAttendanceChange}
                      placeholder="0-100"
                      min="0"
                      max="100"
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    Add Attendance
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
