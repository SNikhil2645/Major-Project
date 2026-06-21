import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { StudentLayout } from '../layouts/StudentLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { DashboardPage } from '../pages/student/DashboardPage';
import { ReadinessPage } from '../pages/student/ReadinessPage';
import { AptitudePage } from '../pages/student/AptitudePage';
import { AptitudeQuizPage } from '../pages/student/AptitudeQuizPage';
import { TechnicalPage } from '../pages/student/TechnicalPage';
import { QuizResultPage } from '../pages/student/QuizResultPage';
import { QuizPerformancePage } from '../pages/student/QuizPerformancePage';
import { CodingPage } from '../pages/student/CodingPage';
import { CodingDetailPage } from '../pages/student/CodingDetailPage';
import { ResumePage } from '../pages/student/ResumePage';
import { InterviewPage } from '../pages/student/InterviewPage';
import { InterviewSessionPage } from '../pages/student/InterviewSessionPage';
import { ResourcesPage } from '../pages/student/ResourcesPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminQuestionsPage } from '../pages/admin/AdminQuestionsPage';
import { AdminCodingPage } from '../pages/admin/AdminCodingPage';
import { AdminResourcesPage } from '../pages/admin/AdminResourcesPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <StudentLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/readiness', element: <ReadinessPage /> },
          { path: '/aptitude', element: <AptitudePage /> },
          { path: '/aptitude/quiz/:quizId', element: <AptitudeQuizPage /> },
          { path: '/technical', element: <TechnicalPage /> },
          { path: '/technical/quiz/:quizId', element: <AptitudeQuizPage /> },
          { path: '/quiz-result/:attemptId', element: <QuizResultPage /> },
          { path: '/quiz-performance', element: <QuizPerformancePage /> },
          { path: '/coding', element: <CodingPage /> },
          { path: '/coding/:challengeId', element: <CodingDetailPage /> },
          { path: '/resume', element: <ResumePage /> },
          { path: '/interview', element: <InterviewPage /> },
          { path: '/interview/:interviewId', element: <InterviewSessionPage /> },
          { path: '/resources', element: <ResourcesPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
          { path: '/admin/users', element: <AdminUsersPage /> },
          { path: '/admin/questions', element: <AdminQuestionsPage /> },
          { path: '/admin/coding', element: <AdminCodingPage /> },
          { path: '/admin/resources', element: <AdminResourcesPage /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
