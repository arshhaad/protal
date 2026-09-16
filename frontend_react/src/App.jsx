import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/index';

// ── Gateway Landing / Role Switcher ──
import GatewayPage from './pages/GatewayPage';

// ── Layouts ──
import StudentLayout from './components/StudentLayout';
import StaffLayout   from './components/StaffLayout';
import HMLayout      from './components/HMLayout';
import AdminLayout   from './components/AdminLayout';

// ── Student Auth ──
import StudentLogin          from './pages/student/StudentLogin';
import StudentForgotPassword from './pages/student/StudentForgotPassword';
import StudentResetPassword  from './pages/student/StudentResetPassword';

// ── Student Pages ──
import StudentDashboard from './pages/student/StudentDashboard';
import {
  StudentProfile, StudentExamDetails, StudentMarks, StudentAttendance,
  StudentSessions, StudentMyCourses, StudentProgress, StudentTasks,
  StudentNotifications, StudentLeaveRequest, StudentPayment,
  StudentTickets, StudentContactUs,
} from './pages/student/StudentPages';

// ── Staff Auth ──
import StaffLogin          from './pages/staff/StaffLogin';
import StaffForgotPassword from './pages/staff/StaffForgotPassword';
import StaffResetPassword  from './pages/staff/StaffResetPassword';

// ── Staff Pages ──
import StaffDashboard from './pages/staff/StaffDashboard';
import {
  StaffViewCourses, StaffStudyMaterials, StaffSessionCreation,
  StaffStudentDetails, StaffClassCreation, StaffTestCreation,
  StaffTaskReviews, StaffAttendanceStaff, StaffAttendanceStudents,
  StaffNotifications, StaffTickets,
} from './pages/staff/StaffPages';

// ── HM (Head Master) Auth ──
import HMLogin          from './pages/hm/HMLogin';
import HMForgotPassword from './pages/hm/HMForgotPassword';
import HMResetPassword  from './pages/hm/HMResetPassword';

// ── HM Pages ──
import {
  HMDashboard, HMStaffOversight, HMStudentPerformance, HMLeaveApprovals,
  HMClassesCurriculum, HMAnnouncements, HMAcademicReports, HMTickets,
} from './pages/hm/HMPages';

// ── Admin Auth ──
import AdminLogin          from './pages/admin/AdminLogin';
import AdminSignUp         from './pages/admin/AdminSignUp';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import AdminResetPassword  from './pages/admin/AdminResetPassword';

// ── Admin Pages ──
import {
  AdminDashboard, AdminManageCourses, AdminManageUsers, AdminManageStaff,
  AdminEvents, AdminMessageUsers, AdminMessageStaff,
  AdminStaffReports, AdminStudentReports, AdminCourseReports, AdminPayments,
} from './pages/admin/AdminPages';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* SaaS Gateway / Role Selector */}
            <Route path="/" element={<GatewayPage />} />

            {/* ── STUDENT AUTH ── */}
            <Route path="/student/login"           element={<StudentLogin />} />
            <Route path="/student/forgot-password" element={<StudentForgotPassword />} />
            <Route path="/student/reset-password"  element={<StudentResetPassword />} />

            {/* ── STUDENT PORTAL ── */}
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"     element={<StudentDashboard />} />
              <Route path="profile"       element={<StudentProfile />} />
              <Route path="exam-details"  element={<StudentExamDetails />} />
              <Route path="marks"         element={<StudentMarks />} />
              <Route path="attendance"    element={<StudentAttendance />} />
              <Route path="sessions"      element={<StudentSessions />} />
              <Route path="my-courses"    element={<StudentMyCourses />} />
              <Route path="progress"      element={<StudentProgress />} />
              <Route path="tasks"         element={<StudentTasks />} />
              <Route path="leave-request" element={<StudentLeaveRequest />} />
              <Route path="payment"       element={<StudentPayment />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="tickets"       element={<StudentTickets />} />
              <Route path="contact-us"    element={<StudentContactUs />} />
            </Route>

            {/* ── STAFF AUTH ── */}
            <Route path="/staff/login"           element={<StaffLogin />} />
            <Route path="/staff/forgot-password" element={<StaffForgotPassword />} />
            <Route path="/staff/reset-password"  element={<StaffResetPassword />} />

            {/* ── STAFF PORTAL ── */}
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"           element={<StaffDashboard />} />
              <Route path="courses"             element={<StaffViewCourses />} />
              <Route path="study-materials"     element={<StaffStudyMaterials />} />
              <Route path="session-creation"    element={<StaffSessionCreation />} />
              <Route path="student-details"     element={<StaffStudentDetails />} />
              <Route path="class-creation"      element={<StaffClassCreation />} />
              <Route path="test-creation"       element={<StaffTestCreation />} />
              <Route path="task-reviews"        element={<StaffTaskReviews />} />
              <Route path="attendance-staff"    element={<StaffAttendanceStaff />} />
              <Route path="attendance-students" element={<StaffAttendanceStudents />} />
              <Route path="notifications"       element={<StaffNotifications />} />
              <Route path="tickets"             element={<StaffTickets />} />
            </Route>

            {/* ── HM (HEAD MASTER) AUTH ── */}
            <Route path="/hm/login"           element={<HMLogin />} />
            <Route path="/hm/forgot-password" element={<HMForgotPassword />} />
            <Route path="/hm/reset-password"  element={<HMResetPassword />} />

            {/* ── HM (HEAD MASTER) PORTAL ── */}
            <Route path="/hm" element={<HMLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"           element={<HMDashboard />} />
              <Route path="staff-oversight"     element={<HMStaffOversight />} />
              <Route path="student-performance" element={<HMStudentPerformance />} />
              <Route path="classes-curriculum"   element={<HMClassesCurriculum />} />
              <Route path="leave-approvals"     element={<HMLeaveApprovals />} />
              <Route path="announcements"       element={<HMAnnouncements />} />
              <Route path="academic-reports"    element={<HMAcademicReports />} />
              <Route path="tickets"             element={<HMTickets />} />
            </Route>

            {/* ── ADMIN AUTH ── */}
            <Route path="/admin/login"           element={<AdminLogin />} />
            <Route path="/admin/signup"          element={<AdminSignUp />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/reset-password"  element={<AdminResetPassword />} />

            {/* ── ADMIN PORTAL ── */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"       element={<AdminDashboard />} />
              <Route path="manage-courses"  element={<AdminManageCourses />} />
              <Route path="manage-users"    element={<AdminManageUsers />} />
              <Route path="manage-staff"    element={<AdminManageStaff />} />
              <Route path="events"          element={<AdminEvents />} />
              <Route path="message-users"   element={<AdminMessageUsers />} />
              <Route path="message-staff"   element={<AdminMessageStaff />} />
              <Route path="staff-reports"   element={<AdminStaffReports />} />
              <Route path="student-reports" element={<AdminStudentReports />} />
              <Route path="course-reports"  element={<AdminCourseReports />} />
              <Route path="payments"        element={<AdminPayments />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
