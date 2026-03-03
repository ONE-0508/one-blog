import { RouterProvider, createBrowserRouter } from 'react-router'

import AppRouteLayout from '../layouts/AppRouteLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppRouteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function AppRouter() {
  return <RouterProvider router={router} />
}

export default AppRouter

