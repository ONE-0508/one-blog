import { useState } from "react";
import { useNavigate } from "react-router";
import { login } from "../api/auth";
import { setAccessToken, setRefreshToken } from "../api/authStorage";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username && !email) {
      setErrorMessage("请输入用户名或邮箱");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await login({
        username: username || undefined,
        email: email || undefined,
        password,
      });

      if (!response.success) {
        setErrorMessage(response.error?.message ?? "登录失败");
        return;
      }

      setAccessToken(response.data.tokens.accessToken);
      setRefreshToken(response.data.tokens.refreshToken);
      navigate("/articles");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "登录失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>管理员登录</h1>
        <p className="muted">使用已有账号登录后台</p>
        <label className="field">
          <span>用户名</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="用户名"
          />
        </label>
        <label className="field">
          <span>邮箱</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="邮箱"
            type="email"
          />
        </label>
        <label className="field">
          <span>密码</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="密码"
            type="password"
          />
        </label>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button type="submit" className="primary" disabled={isLoading}>
          {isLoading ? "登录中..." : "登录"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
