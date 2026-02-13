#!/usr/bin/env node

/**
 * 🏫 TEACHER ROLE - INTEGRATION TEST
 * 
 * Tests:
 * 1. Teacher can login
 * 2. Teacher can access faculty endpoints (view students)
 * 3. Teacher can add marks
 * 4. Teacher can add attendance
 * 5. Teacher access returns correct role
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

async function runTeacherTests() {
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║  🏫 TEACHER ROLE - INTEGRATION TEST                       ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  let passed = 0;
  let failed = 0;

  let teacherToken = null;
  let students = [];

  // ========== TEACHER LOGIN TEST ==========
  console.log("🏫 TEACHER LOGIN TEST");
  console.log("─".repeat(59));

  if (await test("Teacher can login", async () => {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email: "teacher1@example.com",
      password: "password123"
    });
    if (res.data.role !== "teacher") throw new Error("Role is not teacher");
    if (!res.data.token) throw new Error("No token received");
    teacherToken = res.data.token;
  })) { passed++; } else { failed++; }

  // ========== TEACHER ACCESS TESTS ==========
  console.log("\n📚 TEACHER ACCESS TESTS");
  console.log("─".repeat(59));

  if (await test("Teacher can fetch all students", async () => {
    if (!teacherToken) throw new Error("No teacher token");
    const res = await axios.get(`${API_BASE}/faculty/students`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    if (!Array.isArray(res.data)) throw new Error("Response is not an array");
    if (res.data.length === 0) throw new Error("No students returned");
    students = res.data;
  })) { passed++; } else { failed++; }

  // ========== TEACHER MARKS TESTS ==========
  console.log("\n📊 TEACHER MARKS TESTS");
  console.log("─".repeat(59));

  if (await test("Teacher can add marks to students", async () => {
    if (!teacherToken || students.length === 0) throw new Error("No teacher token or students");
    const res = await axios.post(`${API_BASE}/faculty/marks`, {
      studentId: students[0]._id,
      subject: "Teacher Subject - Marks",
      internal: 35,
      external: 45
    }, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    if (!res.data.message) throw new Error("No response message");
  })) { passed++; } else { failed++; }

  if (await test("Teacher can update marks for a subject", async () => {
    if (!teacherToken || students.length === 0) throw new Error("No teacher token or students");
    const res = await axios.post(`${API_BASE}/faculty/marks`, {
      studentId: students[0]._id,
      subject: "Teacher Subject - Marks",
      internal: 40,
      external: 50
    }, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    if (!res.data.message.includes("updated")) throw new Error("Not an update response");
  })) { passed++; } else { failed++; }

  // ========== TEACHER ATTENDANCE TESTS ==========
  console.log("\n📍 TEACHER ATTENDANCE TESTS");
  console.log("─".repeat(59));

  if (await test("Teacher can add attendance", async () => {
    if (!teacherToken || students.length === 0) throw new Error("No teacher token or students");
    const res = await axios.post(`${API_BASE}/faculty/attendance`, {
      studentId: students[0]._id,
      subject: "Teacher Subject - Attendance",
      attendancePercentage: 92
    }, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    if (!res.data.message) throw new Error("No response message");
  })) { passed++; } else { failed++; }

  if (await test("Teacher can update attendance", async () => {
    if (!teacherToken || students.length === 0) throw new Error("No teacher token or students");
    const res = await axios.post(`${API_BASE}/faculty/attendance`, {
      studentId: students[0]._id,
      subject: "Teacher Subject - Attendance",
      attendancePercentage: 95
    }, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    if (!res.data.message.includes("updated")) throw new Error("Not an update response");
  })) { passed++; } else { failed++; }

  // ========== AUTHORIZATION TEST ==========
  console.log("\n🔒 AUTHORIZATION TESTS");
  console.log("─".repeat(59));

  if (await test("Different teacher can also access faculty endpoints", async () => {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email: "teacher2@example.com",
      password: "password123"
    });
    const token2 = res.data.token;
    const studentsRes = await axios.get(`${API_BASE}/faculty/students`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    if (!Array.isArray(studentsRes.data)) throw new Error("Cannot access faculty endpoints");
  })) { passed++; } else { failed++; }

  // ========== SUMMARY ==========
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log(`║  RESULTS: ${passed} Passed ✅  |  ${failed} Failed ❌${" ".repeat(Math.max(0, 18 - String(passed).length - String(failed).length))}║`);
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  if (failed === 0) {
    console.log("🎉 TEACHER ROLE SUCCESSFULLY IMPLEMENTED!\n");
    console.log("📝 TEACHER CAPABILITIES:");
    console.log("   ✅ Login with teacher credentials");
    console.log("   ✅ View all students");
    console.log("   ✅ Add/Update marks");
    console.log("   ✅ Add/Update attendance");
    console.log("   ✅ Same permissions as faculty role\n");
    console.log("🏫 TEST TEACHER CREDENTIALS:");
    console.log("   Email: teacher1@example.com");
    console.log("   Password: password123\n");
  } else {
    console.log("⚠️ Some tests failed. Please review the errors above.\n");
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTeacherTests().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
