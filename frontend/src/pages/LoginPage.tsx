import { useId, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router';

import { login } from '../api/auth';
import { toApiError } from '../api/errors';
import { useAuth } from '../contexts/useAuth';
import type { LoginRequest } from '../types/auth';

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

  // 如果已认证，重定向到首页或来源页
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
        // 更新认证上下文
        if (response.data?.user) {
          authLogin(response.data.user);
        }

        // 重定向到来源页或首页
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md">
          {/* 品牌标识 */}
          <div className="mb-10 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              博客管理系统
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">登录以管理您的博客内容</p>
          </div>

          {/* 登录卡片 */}
          <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800/80">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">用户登录</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  使用用户名或邮箱登录您的账户
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 登录类型切换 */}
                <div className="flex space-x-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                  <button
                    type="button"
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      loginType === 'username'
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                    }`}
                    onClick={() => setLoginType('username')}
                    disabled={isSubmitting}
                  >
                    用户名登录
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      loginType === 'email'
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                    }`}
                    onClick={() => setLoginType('email')}
                    disabled={isSubmitting}
                  >
                    邮箱登录
                  </button>
                </div>

                {/* 用户名/邮箱输入框 */}
                <div className="space-y-2">
                  <label
                    htmlFor={usernameId}
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    {loginType === 'username' ? '用户名' : '邮箱地址'}
                  </label>
                  <input
                    id={usernameId}
                    name={loginType === 'username' ? 'username' : 'email'}
                    type={loginType === 'email' ? 'email' : 'text'}
                    autoComplete={loginType === 'username' ? 'username' : 'email'}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
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

                {/* 密码输入框 */}
                <div className="space-y-2">
                  <label
                    htmlFor={passwordId}
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    密码
                  </label>
                  <input
                    id={passwordId}
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="请输入密码"
                    value={form.password}
                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                    <div className="flex items-center">
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                {/* 登录按钮 */}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmitting}
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
                </button>

                {/* 默认账号提示 */}
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  <div className="flex items-start">
                    <svg
                      className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">默认管理员账号</p>
                      <p className="mt-1">
                        用户名:{' '}
                        <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs dark:bg-blue-800">
                          admin
                        </code>
                      </p>
                      <p>
                        密码:{' '}
                        <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs dark:bg-blue-800">
                          admin123
                        </code>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 注册链接 */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    还没有账户？{' '}
                    <button
                      type="button"
                      onClick={() => {
                        void navigate('/register');
                      }}
                      className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      立即注册
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* 页脚信息 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2026 博客管理系统 · 基于 React + TypeScript 构建
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              安全登录 · 数据加密 · 隐私保护
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
