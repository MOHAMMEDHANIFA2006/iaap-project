const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";

async function testFullFlow() {
  try {
    console.log("\n========================================");
    console.log("🧪 TESTING COMPLETE BACKEND FLOW");
    console.log("========================================\n");

    // Step 1: Login
    console.log("1️⃣ Testing Login...");
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "hanifa@example.com",
      password: "password123"
    });
    
    const { token, studentId } = loginRes.data;
    console.log("✅ Login successful");
    console.log(`   Token: ${token.substring(0, 30)}...`);
    console.log(`   StudentId: ${studentId}\n`);

    // Step 2: Fetch Full Analytics
    console.log("2️⃣ Testing Full Analytics Endpoint...");
    const analyticsRes = await axios.get(`${API_BASE_URL}/analytics/full/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const analyticsData = analyticsRes.data;
    console.log("✅ Analytics endpoint successful");
    console.log(`\n📋 Response Structure:`);
    console.log(`   - Student: ${analyticsData.student ? "✅" : "❌"}`);
    console.log(`   - Student.name: ${analyticsData.student?.name ?? "N/A"}`);
    console.log(`   - Student.department: ${analyticsData.student?.department ?? "N/A"}`);
    console.log(`   - Student.semester: ${analyticsData.student?.semester ?? "N/A"}`);
    console.log(`   - Student.cgpa: ${analyticsData.student?.cgpa ?? "N/A"}`);
    console.log(`   - Average Marks: ${analyticsData.averageMarks ?? "N/A"}`);
    console.log(`   - Risk Level: ${analyticsData.riskLevel ?? "N/A"}`);
    console.log(`   - Marks entries: ${analyticsData.marks?.length ?? 0}`);
    console.log(`   - Attendance entries: ${analyticsData.attendance?.length ?? 0}`);

    // Step 3: Detailed Marks Check
    console.log(`\n3️⃣ Marks Data:`);
    if (analyticsData.marks && analyticsData.marks.length > 0) {
      console.log("✅ Marks data present");
      analyticsData.marks.forEach((mark, i) => {
        console.log(`   ${i + 1}. ${mark.subject}: Internal ${mark.internal}, External ${mark.external}, Total ${mark.internal + mark.external}`);
      });
    } else {
      console.log("❌ No marks data");
    }

    // Step 4: Detailed Attendance Check
    console.log(`\n4️⃣ Attendance Data:`);
    if (analyticsData.attendance && analyticsData.attendance.length > 0) {
      console.log("✅ Attendance data present");
      analyticsData.attendance.forEach((att, i) => {
        console.log(`   ${i + 1}. ${att.subject}: ${att.attendancePercentage}%`);
      });
    } else {
      console.log("❌ No attendance data");
    }

    // Step 5: Verify all required fields for dashboard
    console.log(`\n5️⃣ Dashboard Requirements Check:`);
    const required = {
      "Student Name": analyticsData.student?.name,
      "Department": analyticsData.student?.department,
      "Semester": analyticsData.student?.semester,
      "CGPA": analyticsData.student?.cgpa,
      "Average Marks": analyticsData.averageMarks,
      "Risk Level": analyticsData.riskLevel,
      "Marks Array": analyticsData.marks,
      "Attendance Array": analyticsData.attendance
    };

    let allGood = true;
    Object.entries(required).forEach(([key, value]) => {
      const status = value ? "✅" : "❌";
      console.log(`   ${status} ${key}`);
      if (!value) allGood = false;
    });

    console.log("\n========================================");
    if (allGood) {
      console.log("✅ ALL CHECKS PASSED - BACKEND READY!");
    } else {
      console.log("⚠️ SOME DATA MISSING - CHECK BACKEND");
    }
    console.log("========================================\n");

    process.exit(0);
  } catch (err) {
    console.error("\n❌ Test Failed:");
    console.error(err.response?.data || err.message);
    process.exit(1);
  }
}

testFullFlow();
