const API_BASE_URL = "http://localhost:5000/api";

export async function login({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || "Invalid credentials";
    throw new Error(message);
  }
  return data;
}

export async function register({ email, password, role = "student", studentId }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      role,
      studentId
    })
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || "Registration failed";
    throw new Error(message);
  }
  return data;
}

export async function fetchStudentDetails(token, studentId) {
  const res = await fetch(`${API_BASE_URL}/students/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch student details");
  return res.json();
}

export async function fetchAttendance(token, studentId) {
  const res = await fetch(`${API_BASE_URL}/attendance/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch attendance");
  return res.json();
}

export async function fetchMarks(token, studentId) {
  const res = await fetch(`${API_BASE_URL}/marks/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch marks");
  return res.json();
}

export async function fetchAssignments(token, studentId) {
  const res = await fetch(`${API_BASE_URL}/assignments/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json();
}

export async function fetchFullAnalytics({ token, studentId }) {
  const res = await fetch(`${API_BASE_URL}/analytics/full/${studentId}`, {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || "Failed to load analytics";
    throw new Error(message);
  }
  return data;
}

// Faculty API Functions
export async function fetchAllStudents(token) {
  const res = await fetch(`${API_BASE_URL}/faculty/students`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function addMarks(token, { studentId, subject, internal, external }) {
  const res = await fetch(`${API_BASE_URL}/faculty/marks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      studentId,
      subject,
      internal,
      external
    })
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || "Failed to add marks";
    throw new Error(message);
  }
  return data;
}

export async function addAttendance(token, { studentId, subject, attendancePercentage }) {
  const res = await fetch(`${API_BASE_URL}/faculty/attendance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      studentId,
      subject,
      attendancePercentage
    })
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || "Failed to add attendance";
    throw new Error(message);
  }
  return data;
}

// Admin User Management API Functions
export async function fetchUsers(token, role = null) {
  const url = role ? `${API_BASE_URL}/users?role=${role}` : `${API_BASE_URL}/users`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createUser(token, userData) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to create user");
  }
  return data;
}

export async function updateUser(token, userId, userData) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update user");
  }
  return data;
}

export async function deleteUser(token, userId) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to delete user");
  }
  return data;
}
