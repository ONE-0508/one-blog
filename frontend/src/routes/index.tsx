import { RouterProvider, createBrowserRouter } from 'react-router';

import AppRouteLayout from '../layouts/AppRouteLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import PostDetailPage from '../pages/PostDetailPage';
import NotesPage from '../pages/NotesPage';
import WorksPage from '../pages/WorksPage';
import ArchivePage from '../pages/ArchivePage';
import AboutPage from '../pages/AboutPage';
import GuestbookPage from '../pages/GuestbookPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppRouteLayout />,
    children: [
      {
        path: 'login',
        element: (
          <ProtectedRoute requireAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <ProtectedRoute requireAuth={false}>
            <RegisterPage />
          </ProtectedRoute>
        ),
      },
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'posts/:id',
        element: (
          <ProtectedRoute>
            <PostDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'notes',
        element: (
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'works',
        element: (
          <ProtectedRoute>
            <WorksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'archive',
        element: (
          <ProtectedRoute>
            <ArchivePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'about',
        element: (
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'guestbook',
        element: (
          <ProtectedRoute>
            <GuestbookPage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
