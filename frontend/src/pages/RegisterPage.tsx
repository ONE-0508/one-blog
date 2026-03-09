import { useId, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router';

import { register } from '../api/auth';
import { getAccessToken } from '../api/authStorage';
import { toApiError } from '../api/errors';
import type { RegisterRequest } from '../types/auth';

const initialForm: RegisterRequest = {
  username: '',
  email: '',
  password: '',
  displayName: '',
};

function RegisterPage() {
  const navigate = useNavigate();
  const usernameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const displayNameId = useId();

  const [form, setForm] = useState<RegisterRequest>(initialForm);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingToken = getAccessToken();
  if (existingToken) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // 表单验证
    if (!form.username.trim()) {
      setError('请输入用户名');
      return;
    }

    if (!form.email.trim()) {
      setError('请输入邮箱');
      return;
    }

    if (!form.password) {
      setError('请输入密码');
      return;
    }

    if (form.password.length < 8) {
      setError('密码至少需要8个字符');
      return;
    }

    if (form.password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    // 用户名格式验证（只允许字母、数字、下划线）
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(form.username)) {
      setError('用户名只能包含字母、数字和下划线');
      return;
    }

    setIsSubmitting(true);
    register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      displayName: form.displayName?.trim() || form.username.trim(),
    })
      .then(() => {
        void navigate('/', { replace: true });
      })
      .catch(err => {
        setError(toApiError(err).message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-elevated p-6 shadow-soft md:p-7">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            CREATE ACCOUNT
          </p>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">注册新账户</h1>
          <p className="text-sm text-text-secondary">创建账户以开始使用博客系统</p>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={e => {
            void handleSubmit(e);
          }}
        >
          {/* 用户名 */}
          <div className="space-y-2">
            <label htmlFor={usernameId} className="text-xs font-medium text-text-secondary">
              用户名 *
            </label>
            <input
              id={usernameId}
              name="username"
              type="text"
              autoComplete="username"
              className="w-full rounded-[var(--radius-md)] border border-border-subtle bg-bg-elevated-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              placeholder="请输入用户名（3-50个字符）"
              value={form.username}
              onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
              disabled={isSubmitting}
              maxLength={50}
            />
            <p className="text-xs text-text-muted">只能包含字母、数字和下划线</p>
          </div>

          {/* 邮箱 */}
          <div className="space-y-2">
            <label htmlFor={emailId} className="text-xs font-medium text-text-secondary">
              邮箱 *
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-[var(--radius-md)] border border-border-subtle bg-bg-elevated-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              placeholder="请输入邮箱地址"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          {/* 显示名称（可选） */}
          <div className="space-y-2">
            <label htmlFor={displayNameId} className="text-xs font-medium text-text-secondary">
              显示名称（可选）
            </label>
            <input
              id={displayNameId}
              name="displayName"
              type="text"
              autoComplete="name"
              className="w-full rounded-[var(--radius-md)] border border-border-subtle bg-bg-elevated-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              placeholder="请输入显示名称"
              value={form.displayName}
              onChange={e => setForm(prev => ({ ...prev, displayName: e.target.value }))}
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          {/* 密码 */}
          <div className="space-y-2">
            <label htmlFor={passwordId} className="text-xs font-medium text-text-secondary">
              密码 *
            </label>
            <input
              id={passwordId}
              name="password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-[var(--radius-md)] border border-border-subtle bg-bg-elevated-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              placeholder="请输入密码（至少8个字符）"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          {/* 确认密码 */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-xs font-medium text-text-secondary">
              确认密码 *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-[var(--radius-md)] border border-border-subtle bg-bg-elevated-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* 错误提示 */}
          {error ? (
            <div className="rounded-[var(--radius-md)] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          ) : null}

          {/* 提交按钮 */}
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-black shadow-subtle hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? '注册中…' : '注册'}
          </button>

          {/* 注册协议提示 */}
          <p className="text-xs text-text-muted">
            点击"注册"即表示您同意我们的
            <Link to="/terms" className="text-accent-primary hover:underline ml-1">
              服务条款
            </Link>
            和
            <Link to="/privacy" className="text-accent-primary hover:underline ml-1">
              隐私政策
            </Link>
          </p>

          {/* 登录链接 */}
          <div className="pt-4 border-t border-border-subtle">
            <p className="text-sm text-text-secondary text-center">
              已有账户？
              <Link to="/login" className="text-accent-primary hover:underline ml-1 font-medium">
                立即登录
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
