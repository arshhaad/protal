// API service client for Django REST API v1
const BASE_URL = '/api/v1';

export function getToken() {
  try {
    return localStorage.getItem('authToken') || '';
  } catch (e) {
    return '';
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem('authToken', token);
    else localStorage.removeItem('authToken');
  } catch (e) {}
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...options.headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const error = new Error(errData.detail || errData.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = errData;
      throw error;
    }
    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Student
  studentLogin: (credentials) => apiRequest('/student/auth/login/', { method: 'POST', body: JSON.stringify(credentials) }),
  studentLogout: () => apiRequest('/student/auth/logout/', { method: 'POST' }),
  getStudentDashboard: () => apiRequest('/student/dashboard/'),
  getStudentProfile: () => apiRequest('/student/profile/'),
  updateStudentProfile: (data) => apiRequest('/student/profile/', { method: 'PATCH', body: JSON.stringify(data) }),
  getStudentCourses: () => apiRequest('/student/courses/'),
  getStudentExams: () => apiRequest('/student/exams/'),
  getStudentMarks: () => apiRequest('/student/marks/'),
  getStudentAttendance: () => apiRequest('/student/attendance/'),
  getStudentSessions: () => apiRequest('/student/sessions/'),
  getStudentTasks: () => apiRequest('/student/tasks/'),
  submitStudentTask: (data) => apiRequest('/student/tasks/submit/', { method: 'POST', body: JSON.stringify(data) }),
  getStudentLeave: () => apiRequest('/student/leave/'),
  applyStudentLeave: (data) => apiRequest('/student/leave/', { method: 'POST', body: JSON.stringify(data) }),
  getStudentPayments: () => apiRequest('/student/payments/'),
  getStudentNotifications: () => apiRequest('/student/notifications/'),
  getStudentTickets: () => apiRequest('/student/tickets/'),
  createStudentTicket: (data) => apiRequest('/student/tickets/', { method: 'POST', body: JSON.stringify(data) }),
  sendStudentContact: (data) => apiRequest('/student/contact/', { method: 'POST', body: JSON.stringify(data) }),

  // Staff
  staffLogin: (credentials) => apiRequest('/staff/auth/login/', { method: 'POST', body: JSON.stringify(credentials) }),
  getStaffDashboard: () => apiRequest('/staff/dashboard/'),
  getStaffCourses: () => apiRequest('/staff/courses/'),
  getStaffStudents: () => apiRequest('/staff/students/'),
  createStaffStudent: (data) => apiRequest('/staff/students/', { method: 'POST', body: JSON.stringify(data) }),
  getStaffTasks: () => apiRequest('/staff/tasks/'),
  createStaffTask: (data) => apiRequest('/staff/tasks/', { method: 'POST', body: JSON.stringify(data) }),
  getStaffSubmissions: (status) => apiRequest(`/staff/submissions/${status ? `?status=${status}` : ''}`),
  gradeStaffSubmission: (id, data) => apiRequest(`/staff/submissions/${id}/grade/`, { method: 'PATCH', body: JSON.stringify(data) }),
  markStudentAttendance: (data) => apiRequest('/staff/attendance/students/', { method: 'POST', body: JSON.stringify(data) }),

  // HM (Head Master)
  hmLogin: (credentials) => apiRequest('/hm/auth/login/', { method: 'POST', body: JSON.stringify(credentials) }),
  hmLogout: () => apiRequest('/hm/auth/logout/', { method: 'POST' }),
  getHMDashboard: () => apiRequest('/hm/dashboard/'),
  getHMStaff: () => apiRequest('/hm/staff/'),
  createHMStaff: (data) => apiRequest('/hm/staff/', { method: 'POST', body: JSON.stringify(data) }),
  updateHMStaff: (id, data) => apiRequest(`/hm/staff/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteHMStaff: (id) => apiRequest(`/hm/staff/${id}/`, { method: 'DELETE' }),
  getHMStudentPerformance: () => apiRequest('/hm/students/performance/'),
  getHMLeaveRequests: () => apiRequest('/hm/leave-requests/'),
  createHMLeave: (data) => apiRequest('/hm/leave-requests/', { method: 'POST', body: JSON.stringify(data) }),
  approveLeave: (id) => apiRequest(`/hm/leave-requests/${id}/approve/`, { method: 'POST' }),
  rejectLeave: (id) => apiRequest(`/hm/leave-requests/${id}/reject/`, { method: 'POST' }),
  getHMClasses: () => apiRequest('/hm/classes/'),
  createHMClass: (data) => apiRequest('/hm/classes/', { method: 'POST', body: JSON.stringify(data) }),
  getHMAnnouncements: () => apiRequest('/hm/announcements/'),
  createHMAnnouncement: (data) => apiRequest('/hm/announcements/', { method: 'POST', body: JSON.stringify(data) }),
  updateHMAnnouncement: (id, data) => apiRequest(`/hm/announcements/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteHMAnnouncement: (id) => apiRequest(`/hm/announcements/${id}/`, { method: 'DELETE' }),
  getHMAcademicReports: () => apiRequest('/hm/academic-reports/'),
  getHMTickets: () => apiRequest('/hm/tickets/'),
  replyHMTicket: (id, data) => apiRequest(`/hm/tickets/${id}/reply/`, { method: 'POST', body: JSON.stringify(data) }),
  closeHMTicket: (id) => apiRequest(`/hm/tickets/${id}/close/`, { method: 'POST' }),

  // Admin
  adminLogin: (credentials) => apiRequest('/admin/auth/login/', { method: 'POST', body: JSON.stringify(credentials) }),
  getAdminDashboard: () => apiRequest('/admin/dashboard/'),
  getAdminCourses: () => apiRequest('/admin/courses/'),
  getAdminStudents: () => apiRequest('/admin/students/'),
  getAdminStaff: () => apiRequest('/admin/staff/'),
};
