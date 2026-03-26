import { useId, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { login } from '../api/auth';
import { toApiError } from '../api/errors';
import { useAuth } from '../contexts/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';

const MotionButton = motion.button;

const loginSchema = z.object({
  username: z.string().optional(),
  email: z.string().email('请输入有效的邮箱地址').optional().or(z.literal('')),
  password: z.string().min(1, '请输入密码'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login: authLogin } = useAuth();
  const usernameId = useId();
  const passwordId = useId();

  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'username' | 'email'>('username');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    if (loginType === 'username' && !values.username?.trim()) {
      form.setError('username', { message: '请输入用户名' });
      return;
    }

    if (loginType === 'email' && !values.email?.trim()) {
      form.setError('email', { message: '请输入邮箱地址' });
      return;
    }

    const payload = {
      password: values.password,
      ...(loginType === 'username'
        ? { username: values.username?.trim() }
        : { email: values.email?.trim() }),
    };

    try {
      const response = await login(payload);
      if (response.data?.user) {
        authLogin(response.data.user);
      }

      toast.success('登录成功');
      const from = (location.state as { from?: Location })?.from?.pathname || '/';
      void navigate(from, { replace: true });
    } catch (err) {
      toast.error(toApiError(err).message);
    }
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
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">欢迎回来</h1>
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
            </div>

            <Form {...form}>
              <form
                onSubmit={event => {
                  void form.handleSubmit(onSubmit)(event);
                }}
                className="space-y-5"
              >
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
                    onClick={() => {
                      setLoginType('username');
                      form.clearErrors(['username', 'email']);
                    }}
                    disabled={form.formState.isSubmitting}
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
                    onClick={() => {
                      setLoginType('email');
                      form.clearErrors(['username', 'email']);
                    }}
                    disabled={form.formState.isSubmitting}
                  >
                    邮箱登录
                  </MotionButton>
                </div>

                {loginType === 'username' ? (
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor={usernameId}>用户名</FormLabel>
                        <FormControl>
                          <Input
                            id={usernameId}
                            autoComplete="username"
                            placeholder="请输入用户名"
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor={usernameId}>邮箱地址</FormLabel>
                        <FormControl>
                          <Input
                            id={usernameId}
                            type="email"
                            autoComplete="email"
                            placeholder="请输入邮箱地址"
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={passwordId}>密码</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id={passwordId}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            className="pr-12"
                            placeholder="请输入密码"
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-text-muted hover:text-text-primary"
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
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="h-10 w-full rounded-full"
                >
                  {form.formState.isSubmitting ? (
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
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
