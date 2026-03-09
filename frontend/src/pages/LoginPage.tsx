import { useId, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { login } from '../api/auth';
import { getAccessToken } from '../api/authStorage';
import { toApiError } from '../api/errors';
import type { LoginRequest } from '../types/auth';

const initialForm: LoginRequest = {
  username: '',
  email: '',
  password: '',
};

function LoginPage() {
  const navigate = useNavigate();
  const usernameId = useId();
  const passwordId = useId();

  const [form, setForm] = useState<LoginRequest>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginType, setLoginType] = useState<'username' | 'email'>('username');

  const existingToken = getAccessToken();
  if (existingToken) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if ((!form.username && !form.email) || !form.password) {
      setError('请输入用户名/邮箱和密码');
      return;
    }

    setIsSubmitting(true);
    try {
      const loginData: LoginRequest = {
        password: form.password,
      };

      if (loginType === 'username' && form.username) {
        loginData.username = form.username.trim();
      } else if (loginType === 'email' && form.email) {
        loginData.email = form.email.trim();
      }

      await login(loginData);
      void navigate('/', { replace: true });
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-elevated p-6 shadow-soft md:p-7">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            AUTHOR ACCESS
          </p>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">登录</h1>
          <p className="text-sm text-text-secondary">用于进入作者端能力（后续可扩展 /admin）。</p>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={e => {
            void handleSubmit(e);
          }}
        >
          {/* 登录类型切换 */}
          <div className="flex space-x-2">
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                loginType === 'username'
                  ? 'bg-accent-primary text-black'
                  : 'bg-bg-elevated-soft text-text-secondary hover:bg-bg-elevated'
              }`}
              onClick={() => setLoginType('username')}
              disabled={isSubmitting}
            >
              用户名登录
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                loginType === 'email'
                  ? 'bg-accent-primary text-black'
                  : 'bg-bg-elevated-soft text-text-secondary hover:bg-bg-elevated'
              }`}
              onClick={() => setLoginType('email')}
              disabled={isSubmitting}
            >
              邮箱登录
            </button>
          </div>

          {/* 用户名/邮箱输入框 */}
          <div className="space-y-2">
            <label htmlFor={usernameId} className="text-xs font-medium text-text-secondary">
              {loginType === 'username' ? '用户名' : '邮箱'}
            </label>
            <input
              id={usernameId}
              name={loginType === 'username' ? 'username' : 'email'}
              type={loginType === 'email' ? 'email' : 'text'}
              autoComplete={loginType === 'username' ? 'username' : 'email'}
              className="w-full rounded-[var(--radius-md)] border border-border-subtle bg-bg-elevated-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              placeholder={loginType === 'username' ? '请输入用户名' : '请输入邮箱'}
              value={loginType === 'username' ? form.username : form.email || ''}
              onChange={e => {
                if (loginType === 'username') {
                  setForm(prev => ({ ...prev, username: e.target.value, email: '' }));
                } else {
                  setForm(prev => ({ ...prev, email: e.target.value, username: '' }));
                }
              }}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor={passwordId} className="text-xs font-medium text-text-secondary">
              密码
            </label>
            <input
              id={passwordId}
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-[var(--radius-md)] border border-border-subtle bg-bg-elevated-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              placeholder="请输入密码"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          {error ? (
            <div className="rounded-[var(--radius-md)] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-black shadow-subtle hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? '登录中…' : '登录'}
          </button>

          <p className="text-xs text-text-muted">
            接口默认请求{' '}
            <code className="rounded bg-bg-elevated-soft px-1 py-0.5">
              {String(
                (import.meta.env.VITE_AUTH_LOGIN_PATH as string | undefined) ?? '/auth/login'
              )}
            </code>
            ，可通过环境变量调整。
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
