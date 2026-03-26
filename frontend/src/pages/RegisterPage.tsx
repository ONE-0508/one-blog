import { useId, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { register as registerApi } from '../services/auth';
import { getAccessToken } from '../services/authStorage';
import { toApiError } from '../services/errors';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, '请输入用户名')
      .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
    email: z.string().min(1, '请输入邮箱').email('请输入有效的邮箱地址'),
    displayName: z.string().optional(),
    password: z.string().min(8, '密码至少需要8个字符'),
    confirmPassword: z.string().min(1, '请再次输入密码'),
  })
  .refine(values => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: '两次输入的密码不一致',
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterPage() {
  const navigate = useNavigate();
  const usernameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const displayNameId = useId();
  const confirmPasswordId = useId();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      displayName: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onSubmit',
  });

  const existingToken = getAccessToken();
  if (existingToken) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    try {
      await registerApi({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        displayName: values.displayName?.trim() || values.username.trim(),
      });
      toast.success('注册成功');
      void navigate('/', { replace: true });
    } catch (err) {
      toast.error(toApiError(err).message);
    }
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
            </div>

            <form
              className="space-y-4"
              onSubmit={event => {
                void handleSubmit(onSubmit)(event);
              }}
            >
              <div className="space-y-2">
                <label htmlFor={usernameId} className="text-xs font-medium text-text-secondary">
                  用户名 *
                </label>
                <Input
                  id={usernameId}
                  autoComplete="username"
                  placeholder="请输入用户名（3-50个字符）"
                  maxLength={50}
                  disabled={isSubmitting}
                  {...register('username')}
                />
                <p className="text-xs text-text-muted">只能包含字母、数字和下划线</p>
                {errors.username?.message ? (
                  <p className="text-sm font-medium text-red-500">{errors.username.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor={emailId} className="text-xs font-medium text-text-secondary">
                  邮箱 *
                </label>
                <Input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  placeholder="请输入邮箱地址"
                  disabled={isSubmitting}
                  {...register('email')}
                />
                {errors.email?.message ? (
                  <p className="text-sm font-medium text-red-500">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor={displayNameId} className="text-xs font-medium text-text-secondary">
                  显示名称（可选）
                </label>
                <Input
                  id={displayNameId}
                  autoComplete="name"
                  placeholder="请输入显示名称"
                  maxLength={100}
                  disabled={isSubmitting}
                  {...register('displayName')}
                />
                {errors.displayName?.message ? (
                  <p className="text-sm font-medium text-red-500">{errors.displayName.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor={passwordId} className="text-xs font-medium text-text-secondary">
                  密码 *
                </label>
                <div className="relative">
                  <Input
                    id={passwordId}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="pr-12"
                    placeholder="请输入密码（至少8个字符）"
                    disabled={isSubmitting}
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3 text-text-muted hover:text-text-primary"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {showPassword ? (
                        <>
                          <path d="M3 3l18 18" />
                          <path d="M10.58 10.58a2 2 0 102.83 2.83" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </Button>
                </div>
                {errors.password?.message ? (
                  <p className="text-sm font-medium text-red-500">{errors.password.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={confirmPasswordId}
                  className="text-xs font-medium text-text-secondary"
                >
                  确认密码 *
                </label>
                <div className="relative">
                  <Input
                    id={confirmPasswordId}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="pr-12"
                    placeholder="请再次输入密码"
                    disabled={isSubmitting}
                    {...register('confirmPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3 text-text-muted hover:text-text-primary"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    aria-label={showConfirmPassword ? '隐藏确认密码' : '显示确认密码'}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {showConfirmPassword ? (
                        <>
                          <path d="M3 3l18 18" />
                          <path d="M10.58 10.58a2 2 0 102.83 2.83" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </Button>
                </div>
                {errors.confirmPassword?.message ? (
                  <p className="text-sm font-medium text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>

              <Button type="submit" disabled={isSubmitting} className="h-10 w-full rounded-full">
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
                    提交中...
                  </span>
                ) : (
                  '注册'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
