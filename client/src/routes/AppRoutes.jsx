import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute.jsx';
import { PublicRoute } from '../components/auth/PublicRoute.jsx';
import { RoleRoute } from '../components/auth/RoleRoute.jsx';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { ROLES } from '../utils/constants.js';

import { LoginPage } from '../pages/LoginPage.jsx';
import { DefaultHomePage } from '../pages/DefaultHomePage.jsx';
import { TeacherHomePage } from '../pages/TeacherHomePage.jsx';
import { StudentHomePage } from '../pages/StudentHomePage.jsx';
import { TeacherStudentsPage } from '../pages/TeacherStudentsPage.jsx';
import { UsersPage } from '../pages/UsersPage.jsx';
import { StudentsPage } from '../pages/StudentsPage.jsx';
import { TeachersPage } from '../pages/TeachersPage.jsx';
import { ClassesPage } from '../pages/ClassesPage.jsx';
import { ClassDetailPage } from '../pages/ClassDetailPage.jsx';
import { AssignmentsPage } from '../pages/AssignmentsPage.jsx';
import { AssignmentDetailPage } from '../pages/AssignmentDetailPage.jsx';
import { AttendancePage } from '../pages/AttendancePage.jsx';
import { NotificationsPage } from '../pages/NotificationsPage.jsx';
import { ReportsPage } from '../pages/ReportsPage.jsx';
import { ProfilePage } from '../pages/ProfilePage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/" element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DefaultHomePage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="classes/:id" element={<ClassDetailPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="assignments/:id" element={<AssignmentDetailPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
            <Route path="users" element={<UsersPage />} />
            <Route path="admin/students" element={<StudentsPage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.TEACHER]} />}>
            <Route path="teacher" element={<TeacherHomePage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="students" element={<TeacherStudentsPage />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.STUDENT]} />}>
            <Route path="student" element={<StudentHomePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
