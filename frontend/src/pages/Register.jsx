import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await register({
        email,
        password,
        role: "student",
        studentId: studentId || undefined
      });

      setMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ marginBottom: "30px", textAlign: "center", color: "#333" }}>Create Account</h2>

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#555", fontWeight: "500" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter email"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#555", fontWeight: "500" }}>Student ID (Optional)</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student ID"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#555", fontWeight: "500" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          {error && <p style={{ color: "red", marginBottom: "15px", fontSize: "13px" }}>{error}</p>}
          {message && <p style={{ color: "green", marginBottom: "15px", fontSize: "13px" }}>{message}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "10px", background: "#667eea", color: "white", border: "none", borderRadius: "4px", fontSize: "16px", fontWeight: "500", cursor: "pointer", marginBottom: "15px", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "15px", fontSize: "13px", textAlign: "center", color: "#666" }}>
          Already have an account? <Link to="/login" style={{ color: "#667eea", textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
