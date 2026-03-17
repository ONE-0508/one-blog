import { NavLink, Outlet, useNavigate } from "react-router";
import { clearTokens } from "../api/authStorage";

function AppLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearTokens();
    navigate("/login");
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">Blog Admin</div>
        <nav className="nav">
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            to="/articles"
          >
            文章管理
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            to="/articles/new"
          >
            新建文章
          </NavLink>
        </nav>
        <button type="button" className="logout" onClick={handleLogout}>
          退出登录
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
