import { useId, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';

import { register } from '../api/auth';
import { getAccessToken } from '../api/authStorage';
import { toApiError } from '../api/errors';
import type { RegisterRequest } from '../types/auth';

const MotionButton = motion.button;

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

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
    <div className="mx-auto w-full max-w-5xl space-y-8 pt-6 lg:pt-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch">
        <section className="space-y-6 rounded-[1.75rem] border border-border-subtle bg-bg-elevated-soft/70 p-6 md:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">
              CREATE ACCOUNT
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              搭建你的内容后台，
              <br className="hidden sm:block" />
              从注册开始。
            </h1>
            <p className="max-w-xl text-sm text-text-secondary md:text-base">
              注册账号后即可管理文章、项目和笔记。每位作者都拥有独立的发布与管理空间。
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated/80 p-4 text-sm text-text-secondary">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
              已有账号？
            </p>
            <p className="mt-2">
              直接返回{' '}
              <Link to="/login" className="text-accent-primary">
                登录
              </Link>{' '}
              页面。
            </p>
          </div>
        </section>

        <div className="rounded-[1.75rem] border border-border-subtle bg-bg-elevated/80 p-6 md:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
                REGISTER
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">注册新账户</h2>
              <p className="text-sm text-text-secondary">创建账户以开始使用博客系统</p>
            </div>

            <form
              className="space-y-4"
              onSubmit={e => {
                void handleSubmit(e);
              }}
            >
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

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-medium text-text-secondary"
                >
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
                className="w-full rounded-full bg-accent-primary px-4 py-2.5 text-sm font-semibold text-black shadow-subtle transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? '提交中...' : '注册'}
              </MotionButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
