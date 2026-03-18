import { useId, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';

import { login } from '../api/auth';
import { toApiError } from '../api/errors';
import { useAuth } from '../contexts/useAuth';
import type { LoginRequest } from '../types/auth';

const MotionButton = motion.button;

const initialForm: LoginRequest = {
  username: '',
  email: '',
  password: '',
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login: authLogin } = useAuth();
  const usernameId = useId();
  const passwordId = useId();

  const [form, setForm] = useState<LoginRequest>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginType, setLoginType] = useState<'username' | 'email'>('username');

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if ((!form.username && !form.email) || !form.password) {
      setError('请输入用户名/邮箱和密码');
      return;
    }

    setIsSubmitting(true);

    const loginData: LoginRequest = {
      password: form.password,
    };

    if (loginType === 'username' && form.username) {
      loginData.username = form.username.trim();
    } else if (loginType === 'email' && form.email) {
      loginData.email = form.email.trim();
    }

    login(loginData)
      .then(response => {
        if (response.data?.user) {
          authLogin(response.data.user);
        }

        const from = (location.state as { from?: Location })?.from?.pathname || '/';
        void navigate(from, { replace: true });
      })
      .catch(err => {
        setError(toApiError(err).message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pt-6 lg:pt-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch">
        <section className="relative space-y-6 rounded-[1.75rem] border border-border-subtle bg-bg-elevated-soft/70 p-6 md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-12 h-32 w-32 rounded-full bg-accent-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-8 left-6 h-28 w-28 rounded-full bg-accent-underline-to/15 blur-3xl" />
          <div className="relative space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">
                ADMIN ACCESS
              </p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                欢迎回来，
                <br className="hidden sm:block" />
                继续维护你的内容世界。
              </h1>
              <p className="max-w-xl text-sm text-text-secondary md:text-base">
                管理系统用于发布文章、整理项目与维护笔记。统一使用 ONE Blog 的设计语言，
                保持清晰、克制的阅读体验。
              </p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated/80 p-4 text-sm text-text-secondary">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                默认管理员账号
              </p>
              <div className="mt-2 space-y-1">
                <p>
                  用户名：<span className="font-semibold text-text-primary">admin</span>
                </p>
                <p>
                  密码：<span className="font-semibold text-text-primary">admin123</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-[1.75rem] border border-border-subtle bg-bg-elevated/80 p-6 md:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
                LOGIN
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">用户登录</h2>
              <p className="text-sm text-text-secondary">使用用户名或邮箱登录您的账户</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex space-x-2 rounded-full border border-border-subtle bg-bg-elevated-soft p-1">
                <MotionButton
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-all md:text-sm ${
                    loginType === 'username'
                      ? 'bg-accent-primary text-accent-contrast'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  onClick={() => setLoginType('username')}
                  disabled={isSubmitting}
                >
                  用户名登录
                </MotionButton>
                <MotionButton
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-all md:text-sm ${
                    loginType === 'email'
                      ? 'bg-accent-primary text-accent-contrast'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  onClick={() => setLoginType('email')}
                  disabled={isSubmitting}
                >
                  邮箱登录
                </MotionButton>
              </div>

              <div className="space-y-2">
                <label htmlFor={usernameId} className="text-xs font-medium text-text-secondary">
                  {loginType === 'username' ? '用户名' : '邮箱地址'}
                </label>
                <input
                  id={usernameId}
                  name={loginType === 'username' ? 'username' : 'email'}
                  type={loginType === 'email' ? 'email' : 'text'}
                  autoComplete={loginType === 'username' ? 'username' : 'email'}
                  className="w-full rounded-[var(--radius-md)] border border-border-subtle bg-bg-elevated-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  placeholder={loginType === 'username' ? '请输入用户名' : '请输入邮箱地址'}
                  value={loginType === 'username' ? form.username : form.email || ''}
                  onChange={e => {
                    if (loginType === 'username') {
                      setForm(prev => ({ ...prev, username: e.target.value, email: '' }));
                    } else {
                      setForm(prev => ({ ...prev, email: e.target.value, username: '' }));
                    }
                  }}
                  disabled={isSubmitting}
                  required
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
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg border border-border-subtle bg-bg-elevated-soft px-4 py-3 text-sm text-text-secondary">
                  {error}
                </div>
              )}

              <MotionButton
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-full bg-accent-primary px-4 py-2.5 text-sm font-semibold text-accent-contrast shadow-subtle transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    登录中...
                  </span>
                ) : (
                  '登录'
                )}
              </MotionButton>
            </form>

            <div className="text-center text-sm text-text-secondary">
              还没有账户？
              <button
                type="button"
                onClick={() => {
                  void navigate('/register');
                }}
                className="ml-1 font-medium text-accent-primary hover:brightness-110"
              >
                立即注册
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
