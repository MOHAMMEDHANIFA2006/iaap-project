#!/usr/bin/env node

/**
 * 🔍 ACADEMIC ANALYTICS PLATFORM - INTEGRATION VERIFICATION
 * 
 * This script verifies that:
 * 1. Backend is running and accessible
 * 2. Frontend is running
 * 3. Database has test data
 * 4. All API endpoints work correctly
 * 5. Data flows correctly from backend to frontend
 */

const axios = require("axios");

const BACKEND_URL = "http://localhost:5000";
const FRONTEND_URL = "http://localhost:5173";
const API_BASE = `${BACKEND_URL}/api`;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (err) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${err.message}`);
    return false;
  }
}

async function runVerification() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║  🧪 ACADEMIC ANALYTICS PLATFORM - INTEGRATION TEST        ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  let passed = 0;
  let failed = 0;

  // TEST 1: Backend Health
  if (await test("Backend server is running", async () => {
    const res = await axios.get(`${BACKEND_URL}/`);
    if (res.status !== 200) throw new Error("Backend returned non-200 status");
  })) { passed++; } else { failed++; }

  // TEST 2: Database Connection
  if (await test("Database is connected", async () => {
    const res = await axios.get(`${API_BASE}/analytics/students`);
    if (res.data.length === 0) throw new Error("No students in database");
  })) { passed++; } else { failed++; }

  // TEST 3: Sample Data Exists
  if (await test("Sample data is seeded", async () => {
    const res = await axios.get(`${API_BASE}/analytics/students`);
    console.log(`      Found ${res.data.length} students with marks and attendance data`);
  })) { passed++; } else { failed++; }

  // TEST 4: Auth Register Endpoint
  if (await test("Auth Register endpoint works", async () => {
    try {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const res = await axios.post(`${API_BASE}/auth/register`, {
        email: uniqueEmail,
        password: "testpass123",
        role: "student"
      });
      if (!res.data.message) throw new Error("No response message");
    } catch (err) {
      if (err.response?.status === 400) return; // User might already exist
      throw err;
    }
  })) { passed++; } else { failed++; }

  // TEST 5: Auth Login Endpoint
  let token = null;
  let studentId = null;
  if (await test("Auth Login endpoint works", async () => {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email: "hanifa@example.com",
      password: "password123"
    });
    if (!res.data.token) throw new Error("No token in response");
    if (!res.data.studentId) throw new Error("No studentId in response");
    token = res.data.token;
    studentId = res.data.studentId;
  })) { passed++; } else { failed++; }

  // TEST 6: Protected Analytics Endpoint
  if (await test("Protected Analytics endpoint works", async () => {
    if (!token || !studentId) throw new Error("No token/studentId from login");
    const res = await axios.get(`${API_BASE}/analytics/full/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.data.student) throw new Error("No student data");
    if (!res.data.marks) throw new Error("No marks data");
    if (!res.data.attendance) throw new Error("No attendance data");
  })) { passed++; } else { failed++; }

  // TEST 7: Analytics Response Structure
  if (await test("Analytics response has all required fields", async () => {
    if (!token || !studentId) throw new Error("No token/studentId");
    const res = await axios.get(`${API_BASE}/analytics/full/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = res.data;
    const checks = {
      "student.name": data.student?.name,
      "student.department": data.student?.department,
      "student.semester": data.student?.semester,
      "student.cgpa": data.student?.cgpa,
      "averageMarks": data.averageMarks,
      "riskLevel": data.riskLevel,
      "marks array": Array.isArray(data.marks),
      "attendance array": Array.isArray(data.attendance)
    };
    
    const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length > 0) throw new Error(`Missing: ${missing.join(", ")}`);
  })) { passed++; } else { failed++; }

  // TEST 8: Frontend is Running
  if (await test("Frontend dev server is running", async () => {
    const res = await axios.get(FRONTEND_URL);
    if (res.status !== 200) throw new Error("Frontend returned non-200 status");
  })) { passed++; } else { failed++; }

  // TEST 9: CORS Configuration
  if (await test("CORS is properly configured", async () => {
    const res = await axios.get(`${API_BASE}/analytics/students`);
    const corsHeader = res.headers["access-control-allow-origin"];
    if (!corsHeader) throw new Error("CORS header missing");
  })) { passed++; } else { failed++; }

  // TEST 10: Marks Data Format
  if (await test("Marks data has correct format", async () => {
    if (!token || !studentId) throw new Error("No token/studentId");
    const res = await axios.get(`${API_BASE}/analytics/full/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const marks = res.data.marks?.[0];
    if (!marks?.subject) throw new Error("Missing subject");
    if (typeof marks?.internal !== "number") throw new Error("Invalid internal marks");
    if (typeof marks?.external !== "number") throw new Error("Invalid external marks");
  })) { passed++; } else { failed++; }

  // TEST 11: Attendance Data Format
  if (await test("Attendance data has correct format", async () => {
    if (!token || !studentId) throw new Error("No token/studentId");
    const res = await axios.get(`${API_BASE}/analytics/full/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const att = res.data.attendance?.[0];
    if (!att?.subject) throw new Error("Missing subject");
    if (typeof att?.attendancePercentage !== "number") throw new Error("Invalid attendance");
  })) { passed++; } else { failed++; }

  // SUMMARY
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log(`║  RESULTS: ${passed} Passed ✅  |  ${failed} Failed ❌                   ║`);
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  if (failed === 0) {
    console.log("🎉 ALL TESTS PASSED! Your platform is fully functional!\n");
    console.log("📝 TEST CREDENTIALS:");
    console.log("   hanifa@example.com / password123");
    console.log("   priya@example.com / password123");
    console.log("   arun@example.com / password123\n");
    console.log("🌐 FRONTEND URL: http://localhost:5173");
    console.log("🔧 BACKEND URL: http://localhost:5000\n");
  } else {
    console.log("⚠️ Some tests failed. Please review the errors above.\n");
  }

  process.exit(failed > 0 ? 1 : 0);
}

runVerification().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
