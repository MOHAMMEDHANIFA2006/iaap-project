#!/usr/bin/env node

/**
 * 🔐 ROLE-BASED ACCESS CONTROL (RBAC) - INTEGRATION TEST
 * 
 * Tests:
 * 1. Student login and dashboard access
 * 2. Faculty login and dashboard access
 * 3. Faculty can access protected endpoints
 * 4. Faculty can add marks
 * 5. Faculty can add attendance
 * 6. Student cannot access faculty endpoints
 * 7. Faculty cannot access student endpoints (if protected)
 */

const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

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

async function runRBACTests() {
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║  🔐 ROLE-BASED ACCESS CONTROL (RBAC) - INTEGRATION TEST  ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  let passed = 0;
  let failed = 0;

  // Variables to hold auth data
  let studentToken = null;
  let studentId = null;
  let facultyToken = null;
  let facultyId = null;
  let students = [];

  // ========== STUDENT LOGIN TESTS ==========
  console.log("👤 STUDENT LOGIN TESTS");
  console.log("─".repeat(59));

  if (await test("Student login successful", async () => {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email: "hanifa@example.com",
      password: "password123"
    });
    if (res.data.role !== "student") throw new Error("Role is not student");
    if (!res.data.token) throw new Error("No token received");
    studentToken = res.data.token;
    studentId = res.data.studentId;
  })) { passed++; } else { failed++; }

  if (await test("Student can access analytics endpoint", async () => {
    if (!studentToken || !studentId) throw new Error("No student token/id");
    const res = await axios.get(`${API_BASE}/analytics/full/${studentId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (!res.data.student) throw new Error("No student data");
  })) { passed++; } else { failed++; }

  if (await test("Student CANNOT access faculty endpoints", async () => {
    if (!studentToken) throw new Error("No student token");
    try {
      await axios.get(`${API_BASE}/faculty/students`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      throw new Error("Student was able to access faculty endpoints!");
    } catch (err) {
      if (err.response?.status === 403) {
        return; // Expected - access denied
      }
      throw err;
    }
  })) { passed++; } else { failed++; }

  // ========== FACULTY LOGIN TESTS ==========
  console.log("\n👨‍🏫 FACULTY LOGIN TESTS");
  console.log("─".repeat(59));

  if (await test("Faculty login successful", async () => {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email: "faculty1@example.com",
      password: "password123"
    });
    if (res.data.role !== "faculty") throw new Error("Role is not faculty");
    if (!res.data.token) throw new Error("No token received");
    facultyToken = res.data.token;
    facultyId = res.data.id;
  })) { passed++; } else { failed++; }

  if (await test("Faculty can fetch all students", async () => {
    if (!facultyToken) throw new Error("No faculty token");
    const res = await axios.get(`${API_BASE}/faculty/students`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    if (!Array.isArray(res.data)) throw new Error("Response is not an array");
    if (res.data.length === 0) throw new Error("No students returned");
    students = res.data;
  })) { passed++; } else { failed++; }

  // ========== FACULTY MARKS TESTS ==========
  console.log("\n📊 FACULTY MARKS TESTS");
  console.log("─".repeat(59));

  if (await test("Faculty can add marks", async () => {
    if (!facultyToken || students.length === 0) throw new Error("No faculty token or students");
    const res = await axios.post(`${API_BASE}/faculty/marks`, {
      studentId: students[0]._id,
      subject: "Test Subject",
      internal: 25,
      external: 35
    }, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    if (!res.data.message) throw new Error("No response message");
  })) { passed++; } else { failed++; }

  if (await test("Faculty can update existing marks", async () => {
    if (!facultyToken || students.length === 0) throw new Error("No faculty token or students");
    const res = await axios.post(`${API_BASE}/faculty/marks`, {
      studentId: students[0]._id,
      subject: "Test Subject",
      internal: 30,
      external: 40
    }, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    if (!res.data.message.includes("updated")) throw new Error("Not an update response");
  })) { passed++; } else { failed++; }

  if (await test("Faculty cannot add marks with invalid internal marks", async () => {
    if (!facultyToken || students.length === 0) throw new Error("No faculty token or students");
    try {
      await axios.post(`${API_BASE}/faculty/marks`, {
        studentId: students[0]._id,
        subject: "Invalid Subject",
        internal: "invalid",
        external: 35
      }, {
        headers: { Authorization: `Bearer ${facultyToken}` }
      });
      throw new Error("Should have failed with invalid marks");
    } catch (err) {
      if (err.response?.status !== 400) {
        throw new Error("Expected validation error");
      }
    }
  })) { passed++; } else { failed++; }

  // ========== FACULTY ATTENDANCE TESTS ==========
  console.log("\n📍 FACULTY ATTENDANCE TESTS");
  console.log("─".repeat(59));

  if (await test("Faculty can add attendance", async () => {
    if (!facultyToken || students.length === 0) throw new Error("No faculty token or students");
    const res = await axios.post(`${API_BASE}/faculty/attendance`, {
      studentId: students[0]._id,
      subject: "Test Attendance Subject",
      attendancePercentage: 85
    }, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    if (!res.data.message) throw new Error("No response message");
  })) { passed++; } else { failed++; }

  if (await test("Faculty can update existing attendance", async () => {
    if (!facultyToken || students.length === 0) throw new Error("No faculty token or students");
    const res = await axios.post(`${API_BASE}/faculty/attendance`, {
      studentId: students[0]._id,
      subject: "Test Attendance Subject",
      attendancePercentage: 90
    }, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    if (!res.data.message.includes("updated")) throw new Error("Not an update response");
  })) { passed++; } else { failed++; }

  if (await test("Faculty cannot add invalid attendance", async () => {
    if (!facultyToken || students.length === 0) throw new Error("No faculty token or students");
    try {
      await axios.post(`${API_BASE}/faculty/attendance`, {
        studentId: students[0]._id,
        subject: "Test",
        attendancePercentage: 150 // Invalid - over 100
      }, {
        headers: { Authorization: `Bearer ${facultyToken}` }
      });
      throw new Error("Should have failed with invalid attendance");
    } catch (err) {
      if (err.response?.status !== 400) {
        throw new Error("Expected validation error");
      }
    }
  })) { passed++; } else { failed++; }

  // ========== AUTHORIZATION TESTS ==========
  console.log("\n🔒 AUTHORIZATION TESTS");
  console.log("─".repeat(59));

  if (await test("Student cannot add marks via faculty endpoint", async () => {
    if (!studentToken || students.length === 0) throw new Error("No student token or students");
    try {
      await axios.post(`${API_BASE}/faculty/marks`, {
        studentId: students[0]._id,
        subject: "Should Fail",
        internal: 20,
        external: 30
      }, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      throw new Error("Student was able to add marks!");
    } catch (err) {
      if (err.response?.status !== 403) {
        throw new Error("Expected 403 Forbidden");
      }
    }
  })) { passed++; } else { failed++; }

  if (await test("Unauthenticated requests are rejected", async () => {
    try {
      await axios.get(`${API_BASE}/faculty/students`);
      throw new Error("Unauthenticated request was allowed!");
    } catch (err) {
      if (err.response?.status !== 401) {
        throw new Error("Expected 401 Unauthorized");
      }
    }
  })) { passed++; } else { failed++; }

  // ========== SUMMARY ==========
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log(`║  RESULTS: ${passed} Passed ✅  |  ${failed} Failed ❌${" ".repeat(Math.max(0, 18 - String(passed).length - String(failed).length))}║`);
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  if (failed === 0) {
    console.log("🎉 RBAC IMPLEMENTATION SUCCESSFUL!\n");
    console.log("📝 FEATURES VERIFIED:");
    console.log("   ✅ Student login and dashboard access");
    console.log("   ✅ Faculty login and dashboard access");
    console.log("   ✅ Faculty can fetch students");
    console.log("   ✅ Faculty can add/update marks");
    console.log("   ✅ Faculty can add/update attendance");
    console.log("   ✅ Students cannot access faculty endpoints");
    console.log("   ✅ Proper validation and error handling");
    console.log("   ✅ Unauthenticated requests rejected\n");
  } else {
    console.log("⚠️ Some tests failed. Please review the errors above.\n");
  }

  process.exit(failed > 0 ? 1 : 0);
}

runRBACTests().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
