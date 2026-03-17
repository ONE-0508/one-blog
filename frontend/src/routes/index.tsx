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
        index: true,
        element: <HomePage />,
      },
      {
        path: 'posts/:id',
        element: <PostDetailPage />,
      },
      {
        path: 'notes',
        element: <NotesPage />,
      },
      {
        path: 'works',
        element: <WorksPage />,
      },
      {
        path: 'archive',
        element: <ArchivePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'guestbook',
        element: <GuestbookPage />,
      },
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
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
