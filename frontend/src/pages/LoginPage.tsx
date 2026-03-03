import { useId, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { login } from '../api/auth'
import { getAccessToken, setAccessToken } from '../api/authStorage'
import { toApiError } from '../api/errors'
import type { LoginRequest } from '../types/auth'

const initialForm: LoginRequest = {
  username: '',
  password: '',
}

function LoginPage() {
  const navigate = useNavigate()
  const usernameId = useId()
  const passwordId = useId()

  const existingToken = getAccessToken()
  if (existingToken) {
    return <Navigate to="/" replace />
  }

  const [form, setForm] = useState<LoginRequest>(initialForm)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!form.username.trim() || !form.password) {
      setError('请输入用户名与密码')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await login({
        username: form.username.trim(),
        password: form.password,
      })
      setAccessToken(data.accessToken)
      navigate('/', { replace: true })
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-elevated p-6 shadow-soft md:p-7">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            AUTHOR ACCESS
          </p>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            登录
          </h1>
          <p className="text-sm text-text-secondary">
            用于进入作者端能力（后续可扩展 /admin）。
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor={usernameId}
              className="text-xs font-medium text-text-secondary"
            >
              用户名
            </label>
            <input
              id={usernameId}
              name="username"
              autoComplete="username"
              className="w-full rounded-[var(--radius-md)] border border-border-subtle bg-bg-elevated-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              placeholder="请输入用户名"
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={passwordId}
              className="text-xs font-medium text-text-secondary"
            >
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
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
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
                (import.meta.env.VITE_AUTH_LOGIN_PATH as string | undefined) ??
                  '/auth/login',
              )}
            </code>
            ，可通过环境变量调整。
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

