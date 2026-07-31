# Requirements Document

## Introduction

EduPortal is a comprehensive school management platform built on Django. It serves three distinct user roles — Students, Staff (teachers), and Administrators — each with a dedicated portal, authentication flow, and dashboard. The platform manages the full academic lifecycle: enrolment, attendance, courses, exams, tasks, communications, finance, and reporting.

The existing Django project (`protal/`) already has scaffolding for student authentication, student detail pages, and staff dashboard pages. This spec covers the complete feature set for all three portals as one cohesive platform.

---

## Glossary

- **Portal**: One of the three role-specific web interfaces (Student Portal, Staff Portal, Admin Portal).
- **Student**: A registered learner identified by a unique `enroll_id` (e.g., `STU202601`).
- **Staff**: A teacher or educator who manages courses, sessions, assessments, and student activity.
- **Admin**: A school administrator with full platform oversight, user management, and reporting access.
- **Enrollment_ID**: A unique alphanumeric identifier assigned to each student (e.g., `STU202601`).
- **Session**: A scheduled virtual or physical teaching event tied to a course.
- **Ticket**: A support request raised by a student and handled by staff.
- **Leave_Request**: A formal application by a student for authorised absence.
- **Study_Material**: A file (PDF, video, document) uploaded by staff for a course.
- **Task**: An assignment issued to students by staff; students submit responses for staff review.
- **Assessment**: A timed test or exam created by staff for a class.
- **Attendance_Record**: A daily log of presence or absence for a student or staff member.
- **Notification**: A system or manual broadcast message delivered to a user.
- **Course**: An academic subject with associated study materials, sessions, and assessments.
- **Auth_System**: The Django authentication subsystem handling login, password reset, and session management.
- **Student_Portal**: The role-specific interface for students.
- **Staff_Portal**: The role-specific interface for staff members.
- **Admin_Portal**: The role-specific interface for administrators.
- **Fee_Transaction**: A record of a payment made or due by a student.
- **OTP_Token**: A one-time password reset token generated via Django's `default_token_generator`.

---

## Requirements

---

### Requirement 1: Student Authentication

**User Story:** As a student, I want to log in using my Enrollment ID and password, so that I can securely access my personal portal.

#### Acceptance Criteria

1. WHEN a student submits a valid `enroll_id` and matching password, THE `Auth_System` SHALL authenticate the student and redirect them to the Student Dashboard.
2. WHEN a student submits an `enroll_id` that does not exist in the system, THE `Auth_System` SHALL display the message "Invalid Enrollment ID or password" without disclosing which field is incorrect.
3. WHEN a student submits a correct `enroll_id` with an incorrect password, THE `Auth_System` SHALL display the message "Invalid Enrollment ID or password" without disclosing which field is incorrect.
4. WHEN a student's account has been deactivated by an admin, THE `Auth_System` SHALL display the message "Your account is inactive. Please contact administration." and deny access.
5. WHEN an authenticated student navigates to the login page, THE `Auth_System` SHALL redirect the student to the Student Dashboard without displaying the login form.
6. THE `Auth_System` SHALL protect all Student Portal pages by redirecting any unauthenticated request to the student login page; WHEN a redirect mechanism fails, THE `Auth_System` SHALL block the request and display an access-denied error.
7. WHEN a student clicks "Logout", THE `Auth_System` SHALL invalidate the session and redirect to the student login page.

---

### Requirement 2: Student Forgot Password and Reset

**User Story:** As a student, I want to reset my password using my Enrollment ID, so that I can regain access if I forget my credentials.

#### Acceptance Criteria

1. WHEN a student submits their `enroll_id` on the Forgot Password page, THE `Auth_System` SHALL generate a password reset token and display a confirmation message regardless of whether the `enroll_id` exists, preventing user enumeration.
2. WHEN a student accesses a valid password reset link containing a UID and OTP_Token, THE `Auth_System` SHALL present the Reset Password form.
3. WHEN a student submits a new password shorter than 8 characters on the Reset Password form, THE `Auth_System` SHALL reject the submission and display a validation error.
4. WHEN a student submits two non-matching passwords on the Reset Password form, THE `Auth_System` SHALL reject the submission and display "Passwords do not match."
5. WHEN a student submits a valid new password and matching confirmation, THE `Auth_System` SHALL update the password only after the update operation succeeds, invalidate the reset token, and redirect the student to the login page with a success message; IF the password update operation fails, THEN THE `Auth_System` SHALL display an error message without redirecting.
6. WHEN a student accesses an expired or invalid reset link, THE `Auth_System` SHALL display "This password reset link is invalid or has expired" and redirect to the Forgot Password page.

---

### Requirement 3: Student Profile

**User Story:** As a student, I want to view and update my personal profile, so that school records about me remain accurate.

#### Acceptance Criteria

1. THE `Student_Portal` SHALL display the student's full name, email, phone number, date of birth, gender, address, guardian name, guardian phone, class, section, roll number, and semester.
2. WHEN a student submits updated profile information, THE `Student_Portal` SHALL validate the input and save changes to the `StudentProfile` model.
3. WHEN profile update succeeds, THE `Student_Portal` SHALL display a success confirmation message on the same page.
4. THE `Student_Portal` SHALL allow a student to upload or replace a profile picture stored in the `media/profile_pics/` directory; either an upload or replace action alone is sufficient to update the profile picture.
5. IF a student does not have an associated `StudentProfile` record, THEN THE `Student_Portal` SHALL display a graceful fallback message instead of raising an unhandled error.

---

### Requirement 4: Student Exam Details

**User Story:** As a student, I want to view the exams scheduled for my class, so that I can prepare effectively.

#### Acceptance Criteria

1. THE `Student_Portal` SHALL display a list of exams relevant to the student's `class_name`, verified by explicit class match, including exam name, subject, date, time, and venue.
2. WHEN no exams are scheduled, THE `Student_Portal` SHALL display both the exam list area and a message indicating no upcoming exams are available.
3. THE `Student_Portal` SHALL present exams in ascending order by scheduled date.

---

### Requirement 5: Student Marks

**User Story:** As a student, I want to view my subject-wise marks, so that I can track my academic performance.

#### Acceptance Criteria

1. THE `Student_Portal` SHALL display each subject's name, maximum marks, marks obtained, and grade for the student; WHEN marks are legitimately zero, THE `Student_Portal` SHALL display zero as a valid value.
2. THE `Student_Portal` SHALL display the student's overall percentage and cumulative grade point average.
3. WHEN no marks have been recorded, THE `Student_Portal` SHALL display subject names with marks fields marked as "Not Available" rather than hiding the subjects.

---

### Requirement 6: Student Attendance

**User Story:** As a student, I want to view my attendance records, so that I know my attendance percentage and identify absent days.

#### Acceptance Criteria

1. THE `Student_Portal` SHALL display the student's overall attendance percentage; WHEN no attendance records exist, THE `Student_Portal` SHALL display 0% as the attendance percentage.
2. THE `Student_Portal` SHALL display a daily attendance log showing date, subject, and status (Present, Absent, or Leave) alongside all other attendance UI elements including the percentage field.
3. WHEN the student's attendance falls below 75%, THE `Student_Portal` SHALL display a warning indicator.
4. WHEN no attendance records exist for the student, THE `Student_Portal` SHALL display a "no data available" message alongside the attendance percentage field and log area.

---

### Requirement 7: Student Sessions

**User Story:** As a student, I want to view scheduled, live, and recorded teaching sessions, so that I can attend or revisit lessons.

#### Acceptance Criteria

1. THE `Student_Portal` SHALL display upcoming sessions filtered by explicit `class_name` match, showing title, course, date, time, and platform or room.
2. THE `Student_Portal` SHALL separate sessions into "Upcoming", "Live Now", and "Past" categories.
3. WHEN a session recording or join link is available, THE `Student_Portal` SHALL display an actionable link for the student.

---

### Requirement 8: Student My Courses

**User Story:** As a student, I want to access my enrolled courses and their study materials, so that I can review textbooks and PDFs at any time.

#### Acceptance Criteria

1. THE `Student_Portal` SHALL display all courses associated with the student's class, including course code, name, and instructor name.
2. WHEN a course has associated `Study_Material` records, THE `Student_Portal` SHALL list each material with its title, file type, upload date, and a download link; WHEN a material file is inaccessible or deleted, THE `Student_Portal` SHALL hide that material entry from the listing.
3. WHEN a course has no study materials, THE `Student_Portal` SHALL display a message indicating no materials have been uploaded yet.

---

### Requirement 9: Student Progress

**User Story:** As a student, I want to view a visual summary of my academic progress across terms, so that I can understand strengths and areas needing improvement.

#### Acceptance Criteria

1. THE `Student_Portal` SHALL display a graphical or tabular overview of the student's performance across subjects for the current term.
2. THE `Student_Portal` SHALL show comparative data between the student's scores and the class average per subject.
3. THE `Student_Portal` SHALL categorise performance as "Excellent", "Good", "Average", or "At Risk" based on defined score thresholds; WHEN a student has a zero or near-zero score, THE `Student_Portal` SHALL apply special handling to prevent misleading category assignment and display an appropriate low-performance indicator.

---

### Requirement 10: Student Tasks

**User Story:** As a student, I want to view assigned tasks, submit my work, and track status, so that I can meet deadlines and review teacher feedback.

#### Acceptance Criteria

1. THE `Student_Portal` SHALL display all tasks assigned to the student's class, including title, subject, due date, and current submission status.
2. WHEN a student submits work for a task, THE `Student_Portal` SHALL record the submission with a timestamp and update the task status to "Submitted".
3. WHEN a staff member has reviewed a submission, THE `Student_Portal` SHALL display the grade and written feedback to the student.
4. WHEN a task's due date has passed and no submission exists, THE `Student_Portal` SHALL mark the task status as "Overdue".

---

### Requirement 11: Student Leave Request

**User Story:** As a student, I want to submit a leave application and track its approval status, so that my absences are formally recorded.

#### Acceptance Criteria

1. WHEN a student submits a leave request with leave type, from date, to date, and reason, THE `Student_Portal` SHALL save the `Leave_Request` record with status "Pending".
2. IF any required field (leave type, from date, to date, or reason) is missing, THEN THE `Student_Portal` SHALL reject the submission and display a validation error identifying the missing fields.
3. THE `Student_Portal` SHALL display the student's full leave history with the applied date, leave type, duration, and current approval status (Pending, Approved, or Rejected).
4. WHEN a leave request is approved or rejected by staff, THE `Student_Portal` SHALL update the displayed status accordingly.

---

### Requirement 12: Student Payment

**User Story:** As a student, I want to view my fee obligations and payment history, so that I can ensure my account is up to date.

#### Acceptance Criteria

1. THE `Student_Portal` SHALL display the student's total fees due, amount paid, and outstanding balance.
2. THE `Student_Portal` SHALL list all `Fee_Transaction` records for the student, showing date, description, amount, and status (Paid or Pending).
3. WHEN the student has an outstanding balance greater than zero, THE `Student_Portal` SHALL prominently display the outstanding amount with a due date if one is set.

---

### Requirement 13: Student Notifications

**User Story:** As a student, I want to receive and view notifications from staff and administration, so that I stay informed about important updates.

#### Acceptance Criteria

1. THE `Student_Portal` SHALL display all `Notification` records addressed to the student, sorted by most recent first.
2. THE `Student_Portal` SHALL visually distinguish unread notifications from read notifications.
3. WHEN a student opens a notification, THE `Student_Portal` SHALL mark it as read and update the unread count indicator in the navigation.

---

### Requirement 14: Student Tickets

**User Story:** As a student, I want to raise support tickets and track their resolution, so that my issues receive a formal response.

#### Acceptance Criteria

1. WHEN a student submits a ticket with a category, subject, and description, THE `Student_Portal` SHALL save the ticket with status "Open" and display a confirmation message.
2. IF any required ticket field (category, subject, or description) is missing, THEN THE `Student_Portal` SHALL reject the submission and display a validation error.
3. THE `Student_Portal` SHALL display all of the student's tickets with ticket ID, subject, status, and creation date.
4. WHEN a staff member replies to or resolves a ticket, THE `Student_Portal` SHALL display the staff reply and updated ticket status.

---

### Requirement 15: Student Contact Us

**User Story:** As a student, I want to send a message to a school department, so that I can get direct assistance.

#### Acceptance Criteria

1. WHEN a student submits a contact message with a department, subject, and message body, THE `Student_Portal` SHALL save the message and display a confirmation to the student.
2. IF any required field (department, subject, or message) is missing, THEN THE `Student_Portal` SHALL reject the submission and display a validation error.

---

### Requirement 16: Staff Authentication

**User Story:** As a staff member, I want to log in using my username/email and password, so that I can securely access the Staff Portal.

#### Acceptance Criteria

1. WHEN a staff member submits a valid username and matching password, THE `Auth_System` SHALL authenticate the staff member and redirect them to the Staff Dashboard.
2. WHEN a staff member submits invalid credentials, THE `Auth_System` SHALL display an error message and remain on the login page.
3. WHEN an authenticated staff member navigates to the staff login page, THE `Auth_System` SHALL redirect them to the Staff Dashboard.
4. THE `Auth_System` SHALL protect all Staff Portal pages; unauthenticated requests SHALL be redirected to the staff login page.
5. WHEN a staff member clicks "Logout", THE `Auth_System` SHALL invalidate the session and redirect to the staff login page.

---

### Requirement 17: Staff Forgot Password and Reset

**User Story:** As a staff member, I want to reset my password via a secure link sent to my registered email, so that I can regain access if I forget my credentials.

#### Acceptance Criteria

1. WHEN a staff member submits their registered email on the Staff Forgot Password page, THE `Auth_System` SHALL generate a reset token and display a confirmation message.
2. WHEN a staff member accesses a valid reset link, THE `Auth_System` SHALL present the Reset Password form.
3. WHEN a staff member submits a new password shorter than 8 characters, THE `Auth_System` SHALL reject the submission with a validation error.
4. WHEN a staff member submits two non-matching passwords, THE `Auth_System` SHALL display "Passwords do not match."
5. WHEN a staff member submits a valid new password, THE `Auth_System` SHALL update the password and redirect to the staff login page with a success message.
6. WHEN a staff member accesses an invalid or expired reset link, THE `Auth_System` SHALL display an error and redirect to the Staff Forgot Password page.

---

### Requirement 18: Staff Dashboard

**User Story:** As a staff member, I want an overview dashboard showing key statistics and upcoming sessions, so that I can quickly understand my workload at a glance.

#### Acceptance Criteria

1. THE `Staff_Portal` SHALL display summary statistics including total students managed, active courses count, today's attendance rate, pending task reviews count, and open support tickets count.
2. THE `Staff_Portal` SHALL display a list of recent activities performed by the staff member (attendance marking, material uploads, test creation, submission reviews).
3. THE `Staff_Portal` SHALL display the staff member's upcoming sessions for the current day with time, course, room or platform, and class group.

---

### Requirement 19: Staff View Courses

**User Story:** As a staff member, I want to view all courses I am responsible for, so that I can manage their content and progress.

#### Acceptance Criteria

1. THE `Staff_Portal` SHALL display all courses assigned to the authenticated staff member, showing course code, name, enrolled student count, credit hours, and completion progress percentage.
2. WHEN a course has no enrolled students, THE `Staff_Portal` SHALL display zero for the student count without raising an error.

---

### Requirement 20: Staff Study Materials

**User Story:** As a staff member, I want to upload, view, and manage study materials for my courses, so that students have access to relevant learning resources.

#### Acceptance Criteria

1. THE `Staff_Portal` SHALL display all existing study materials with title, associated course, upload date, file size, and download count.
2. WHEN an admin uploads a new study material with a title, course selection, and file, THE `Staff_Portal` SHALL save the material and add it to the listing with a download count of zero; THE `Staff_Portal` SHALL prevent saving any material when title or course validation fails.
3. IF the title or course selection is missing when uploading a material, THEN THE `Staff_Portal` SHALL reject the submission, save nothing, and display a validation error.

---

### Requirement 21: Staff Session Creation

**User Story:** As a staff member, I want to schedule teaching sessions for my classes, so that students know when and where learning activities will occur.

#### Acceptance Criteria

1. THE `Staff_Portal` SHALL display all scheduled sessions with title, course, date, time, duration, and platform or room.
2. WHEN a staff member submits a new session with a title, course, and date, THE `Staff_Portal` SHALL save the session and display it in the session list without showing validation errors when all required fields are valid.
3. IF the title, course, or date is missing when creating a session, THEN THE `Staff_Portal` SHALL reject the submission, save nothing, and display a validation error.

---

### Requirement 22: Staff Student Details

**User Story:** As a staff member, I want to view details for all students in my classes, so that I can monitor their performance and status.

#### Acceptance Criteria

1. THE `Staff_Portal` SHALL display a list of students including ID, name, email, class, attendance percentage, GPA, and performance status.
2. WHEN a staff member submits a search query, THE `Staff_Portal` SHALL filter the student list to show only records matching the student's name, ID, or class.
3. WHEN the search query returns no results, THE `Staff_Portal` SHALL display a "no matching students found" message.

---

### Requirement 23: Staff Class Creation

**User Story:** As a staff member, I want to create and manage class groups, so that students can be organised into structured learning cohorts.

#### Acceptance Criteria

1. THE `Staff_Portal` SHALL display all existing class groups with class code, name, semester, student strength, and class representative.
2. WHEN a staff member submits a new class with a name and code, THE `Staff_Portal` SHALL save the class group and display it in the listing.
3. IF the class name or class code is missing, THEN THE `Staff_Portal` SHALL reject the submission and display a validation error.

---

### Requirement 24: Staff Test Creation

**User Story:** As a staff member, I want to create assessments for my classes, so that student knowledge can be formally evaluated.

#### Acceptance Criteria

1. THE `Staff_Portal` SHALL display all created assessments with title, course, scheduled date, duration, total marks, and question count.
2. WHEN a staff member submits a new assessment with a title and associated course, THE `Staff_Portal` SHALL save the assessment and add it to the listing.
3. IF the assessment title or course is missing, THEN THE `Staff_Portal` SHALL reject the submission and display a validation error.

---

### Requirement 25: Staff Task Submissions and Reviews

**User Story:** As a staff member, I want to review student task submissions and provide grades and feedback, so that students receive meaningful evaluations.

#### Acceptance Criteria

1. THE `Staff_Portal` SHALL display all task submissions with student name, student ID, task title, submission date, file reference, and current status (Pending or Graded).
2. WHEN a staff member submits a grade and written review for a submission, THE `Staff_Portal` SHALL save the grade and review, update the submission status to "Graded", and display a confirmation message; IF the save operation fails, THEN THE `Staff_Portal` SHALL retain the "Pending" status and display an error message prompting the staff member to retry.
3. THE `Staff_Portal` SHALL distinguish "Pending" submissions from "Graded" submissions visually in the listing.

---

### Requirement 26: Staff Attendance — Staff Self

**User Story:** As a staff member, I want to record my own daily check-in and check-out times, so that my attendance is accurately tracked.

#### Acceptance Criteria

1. WHEN a staff member clicks "Check In", THE `Staff_Portal` SHALL record the current timestamp as the check-in time for that day.
2. WHEN a staff member clicks "Check Out", THE `Staff_Portal` SHALL record the current timestamp as the check-out time and calculate total hours worked.
3. THE `Staff_Portal` SHALL display the staff member's attendance history with date, check-in time, check-out time, status, and total hours.
4. WHEN a staff member has already checked in for the current day, THE `Staff_Portal` SHALL disable the "Check In" button and enable the "Check Out" button; WHEN a staff member has not yet checked in, THE `Staff_Portal` SHALL enable the "Check In" button.

---

### Requirement 27: Staff Attendance — Students

**User Story:** As a staff member, I want to mark attendance for students in my class, so that absence records are kept current.

#### Acceptance Criteria

1. THE `Staff_Portal` SHALL display a list of all students in the selected class for the current date, allowing the staff member to mark each student as Present or Absent.
2. WHEN a staff member submits the attendance form, THE `Staff_Portal` SHALL save an `Attendance_Record` for each student for that date and display a success confirmation.
3. IF a student's attendance is submitted a second time for the same date and class, THEN THE `Staff_Portal` SHALL overwrite the previous record and confirm the update; IF the database save operation fails, THEN THE `Staff_Portal` SHALL display an error message instead of a success confirmation.

---

### Requirement 28: Staff Notifications

**User Story:** As a staff member, I want to view notifications from administration and broadcast announcements to students, so that important information is communicated efficiently.

#### Acceptance Criteria

1. THE `Staff_Portal` SHALL display all received notifications sorted by most recent first, showing title, sender, date, body, and importance flag.
2. WHEN a staff member submits a broadcast with a title and body, THE `Staff_Portal` SHALL save the `Notification` and display it at the top of the notification list.
3. IF the notification title or body is missing when broadcasting, THEN THE `Staff_Portal` SHALL reject the submission and display a validation error.

---

### Requirement 29: Staff Tickets Handling

**User Story:** As a staff member, I want to view and respond to student support tickets, so that student issues are resolved in a timely manner.

#### Acceptance Criteria

1. THE `Staff_Portal` SHALL display all student tickets with ticket ID, student name, subject, category, status, creation date, and message thread.
2. WHEN a staff member submits a reply to a ticket, THE `Staff_Portal` SHALL append the reply to the ticket's message thread and display a confirmation.
3. WHEN a staff member marks a ticket as resolved, THE `Staff_Portal` SHALL update the ticket status to "Resolved".
4. THE `Staff_Portal` SHALL visually distinguish "Open" tickets from "Resolved" tickets in the listing.

---

### Requirement 30: Admin Authentication

**User Story:** As an administrator, I want to log in to the Admin Portal with my credentials, so that I can manage the platform securely.

#### Acceptance Criteria

1. WHEN an admin submits valid credentials, THE `Auth_System` SHALL authenticate the admin and redirect to the Admin Dashboard.
2. WHEN an admin submits invalid credentials, THE `Auth_System` SHALL display an error message and remain on the admin login page.
3. THE `Auth_System` SHALL restrict Admin Portal access to users with the `is_staff` or `is_superuser` flag; requests from non-admin users SHALL be rejected with an appropriate error.
4. WHEN an authenticated admin navigates to the admin login page, THE `Auth_System` SHALL redirect them to the Admin Dashboard.
5. WHEN an admin clicks "Logout", THE `Auth_System` SHALL invalidate the session and redirect to the admin login page.

---

### Requirement 31: Admin Forgot Password and Reset

**User Story:** As an administrator, I want to reset my password securely, so that I can regain access without compromising security.

#### Acceptance Criteria

1. WHEN an admin submits their registered email on the Admin Forgot Password page, THE `Auth_System` SHALL generate a reset token and display a confirmation message.
2. WHEN an admin accesses a valid reset link, THE `Auth_System` SHALL present the Reset Password form.
3. WHEN an admin submits a new password shorter than 8 characters, THE `Auth_System` SHALL reject the submission with a validation error.
4. WHEN an admin submits a valid new password with matching confirmation, THE `Auth_System` SHALL update the password and redirect to the admin login page with a success message.
5. WHEN an admin accesses an invalid or expired reset link, THE `Auth_System` SHALL display an error and redirect to the Admin Forgot Password page.

---

### Requirement 32: Admin Dashboard Overview

**User Story:** As an administrator, I want a high-level dashboard showing the health of the platform, so that I can monitor key metrics at a glance.

#### Acceptance Criteria

1. THE `Admin_Portal` SHALL display total registered students, total active staff members, total active courses, and total revenue collected.
2. THE `Admin_Portal` SHALL display a summary of recent platform activity including new registrations, recent payments, and flagged tickets.
3. THE `Admin_Portal` SHALL display at least one chart or graphical representation of student enrolment or fee collection trends.

---

### Requirement 33: Admin Manage Courses

**User Story:** As an administrator, I want to create, edit, and deactivate courses, so that the course catalogue is always accurate.

#### Acceptance Criteria

1. THE `Admin_Portal` SHALL display all courses with code, name, assigned instructor, enrolled student count, and active/inactive status.
2. WHEN an admin creates a new course with a code, name, and assigned instructor, THE `Admin_Portal` SHALL save the course and add it to the listing.
3. WHEN an admin deactivates a course, THE `Admin_Portal` SHALL update the course status to "Inactive" and prevent new enrolments.
4. IF the course code is not unique, THEN THE `Admin_Portal` SHALL reject the creation request and display a validation error.
5. WHEN an admin edits an existing course's name or instructor, THE `Admin_Portal` SHALL save the updated values and confirm the change.

---

### Requirement 34: Admin Manage Users (Students)

**User Story:** As an administrator, I want to create, view, edit, and deactivate student accounts, so that student access is properly controlled.

#### Acceptance Criteria

1. THE `Admin_Portal` SHALL display all student accounts with `enroll_id`, full name, email, class, section, and account status.
2. WHEN an admin creates a new student account with a unique `enroll_id`, full name, email, class, and initial password, THE `Admin_Portal` SHALL create a `User` and linked `StudentProfile` record.
3. WHEN an admin deactivates a student account, THE `Auth_System` SHALL prevent new logins for that student; existing active sessions may continue until they naturally expire; the account status display in the listing may show the prior status until explicitly refreshed.
4. IF the provided `enroll_id` already exists, THEN THE `Admin_Portal` SHALL reject the creation request and display "Enrollment ID already in use."
5. WHEN an admin edits a student's email, class, or section, THE `Admin_Portal` SHALL save the updated values.

---

### Requirement 35: Admin Manage Staff

**User Story:** As an administrator, I want to create, view, edit, and deactivate staff accounts, so that teacher access is properly controlled.

#### Acceptance Criteria

1. THE `Admin_Portal` SHALL display all staff accounts with name, email, assigned courses, department, and account status.
2. WHEN an admin creates a new staff account with a name, email, department, and initial password, THE `Admin_Portal` SHALL create a `User` record with `is_staff=True` and attempt to create a linked staff profile; IF the staff profile creation fails, THEN THE `Admin_Portal` SHALL retain the created `User` record and log the error without rolling back.
3. WHEN an admin deactivates a staff account, THE `Auth_System` SHALL prevent that staff member from logging in.
4. IF the provided email is already in use, THEN THE `Admin_Portal` SHALL reject the creation request and display "Email address already registered."
5. WHEN an admin assigns a course to a staff member, THE `Admin_Portal` SHALL update the course's instructor assignment.

---

### Requirement 36: Admin Events

**User Story:** As an administrator, I want to create and publish school events, so that students and staff are informed of upcoming activities.

#### Acceptance Criteria

1. THE `Admin_Portal` SHALL display all events with title, date, time, location, and target audience (All / Students / Staff).
2. WHEN an admin saves and publishes a new event with a title, date, and target audience, THE `Admin_Portal` SHALL save the event and make it visible to the specified audience atomically; IF the visibility assignment fails, THEN THE `Admin_Portal` SHALL roll back the entire creation and display an error.
3. WHEN an event date has passed, THE `Admin_Portal` SHALL move it to a "Past Events" section automatically.

---

### Requirement 37: Admin Communicate with Users

**User Story:** As an administrator, I want to send messages to students and staff individually or in bulk, so that important information reaches the right audience.

#### Acceptance Criteria

1. WHEN an admin composes and sends a message to a specific student or staff member, THE `Admin_Portal` SHALL create a `Notification` record addressed to that user.
2. WHEN an admin sends a bulk message to all students or all staff, THE `Admin_Portal` SHALL create a `Notification` record for each member of the target group.
3. THE `Admin_Portal` SHALL display a sent-messages log with recipient, subject, and sent timestamp; THE `Admin_Portal` SHALL display the log area even when no messages have been sent.

---

### Requirement 38: Admin Staff Reports

**User Story:** As an administrator, I want to generate staff performance and attendance reports, so that I can evaluate staff activity.

#### Acceptance Criteria

1. THE `Admin_Portal` SHALL display a staff attendance report for every staff member for a given date range, filtered by explicit date match.
2. THE `Admin_Portal` SHALL display a report of each staff member's course load, sessions conducted, and task reviews completed.
3. WHEN an admin filters a report by date range, THE `Admin_Portal` SHALL return only records falling within the specified start and end dates.

---

### Requirement 39: Admin Student Reports

**User Story:** As an administrator, I want to generate student academic and attendance reports, so that I can identify at-risk students and monitor overall performance.

#### Acceptance Criteria

1. THE `Admin_Portal` SHALL display an attendance report for every student, including those with 0% attendance or no attendance records, for a given date range.
2. THE `Admin_Portal` SHALL display a report of each student's marks, GPA, and performance category.
3. WHEN an admin filters by class or section, THE `Admin_Portal` SHALL show only students belonging to the specified class or section.

---

### Requirement 40: Admin Course Reports

**User Story:** As an administrator, I want to view course-level analytics, so that I can assess course effectiveness and resource utilisation.

#### Acceptance Criteria

1. THE `Admin_Portal` SHALL display a course report for every course including those with zero enrolled students, showing enrolled student count, average marks, average attendance rate, and number of study materials uploaded, with zero values for empty courses.
2. WHEN an admin selects a specific course, THE `Admin_Portal` SHALL display a detailed breakdown of that course's session count, assessment count, and task completion rate.

---

### Requirement 41: Admin Payment Handling

**User Story:** As an administrator, I want to view, record, and manage student fee payments, so that the school's financial records are accurate.

#### Acceptance Criteria

1. THE `Admin_Portal` SHALL display all `Fee_Transaction` records with student name, `enroll_id`, amount, payment date, description, and status (Paid or Pending).
2. WHEN an admin records a new payment for a student, THE `Admin_Portal` SHALL create a `Fee_Transaction` record and update the student's outstanding balance.
3. WHEN an admin filters transactions by student `enroll_id`, the `Admin_Portal` SHALL return only that student's transaction history.
4. THE `Admin_Portal` SHALL display a summary showing total fees collected, total outstanding fees, and count of students with overdue balances.
