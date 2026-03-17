import { RouterProvider, createBrowserRouter } from "react-router";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import ArticleListPage from "./pages/ArticleListPage";
import ArticleFormPage from "./pages/ArticleFormPage";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ArticleListPage />,
      },
      {
        path: "articles",
        element: <ArticleListPage />,
      },
      {
        path: "articles/new",
        element: <ArticleFormPage />,
      },
      {
        path: "articles/:id/edit",
        element: <ArticleFormPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
