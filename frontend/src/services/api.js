import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function login({ email, password }) {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Invalid credentials";
    throw new Error(message);
  }
}

export async function register({ email, password, role = "student", studentId }) {
  try {
    const response = await api.post('/auth/register', {
      email,
      password,
      role,
      studentId
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Registration failed";
    throw new Error(message);
  }
}

export async function fetchStudentDetails(token, studentId) {
  try {
    const response = await api.get(`/students/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch student details");
  }
}

export async function fetchAttendance(token, studentId) {
  try {
    const response = await api.get(`/attendance/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch attendance");
  }
}

export async function fetchMarks(token, studentId) {
  try {
    const response = await api.get(`/marks/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch marks");
  }
}

export async function fetchAssignments(token, studentId) {
  try {
    const response = await api.get(`/assignments/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch assignments");
  }
}

export async function fetchFullAnalytics({ token, studentId }) {
  try {
    const response = await api.get(`/analytics/full/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to load analytics";
    throw new Error(message);
  }
}

// Faculty API Functions
export async function fetchAllStudents(token) {
  try {
    const response = await api.get('/faculty/students', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch students");
  }
}

export async function addMarks(token, { studentId, subject, internal, external }) {
  try {
    const response = await api.post('/faculty/marks', {
      studentId,
      subject,
      internal,
      external
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to add marks";
    throw new Error(message);
  }
}

export async function addAttendance(token, { studentId, subject, attendancePercentage }) {
  try {
    const response = await api.post('/faculty/attendance', {
      studentId,
      subject,
      attendancePercentage
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to add attendance";
    throw new Error(message);
  }
}

// Admin User Management API Functions
export async function fetchUsers(token, role = null) {
  try {
    const url = role ? `/users?role=${role}` : '/users';
    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
}

export async function createUser(token, userData) {
  try {
    const response = await api.post('/users', userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create user");
  }
}

export async function updateUser(token, userId, userData) {
  try {
    const response = await api.put(`/users/${userId}`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update user");
  }
}

export async function deleteUser(token, userId) {
  try {
    const response = await api.delete(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
}
