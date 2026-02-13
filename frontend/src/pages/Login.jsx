import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("studentId", data.studentId);
      localStorage.setItem("role", data.role);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ marginBottom: "30px", textAlign: "center", color: "#333" }}>Academic Analytics Login</h2>

        <form onSubmit={handleLogin}>
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

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "10px", background: "#667eea", color: "white", border: "none", borderRadius: "4px", fontSize: "16px", fontWeight: "500", cursor: "pointer", marginBottom: "15px", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: "15px", fontSize: "13px", textAlign: "center", color: "#666" }}>
          Don't have an account? <Link to="/register" style={{ color: "#667eea", textDecoration: "none" }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
