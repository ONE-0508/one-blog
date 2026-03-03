import axios from 'axios'

import { clearAccessToken, getAccessToken } from './authStorage'

const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

export const httpClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (!token) return config

  config.headers = config.headers ?? {}
  config.headers.Authorization = `Bearer ${token}`
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status: number | undefined = error?.response?.status

    if (status === 401) {
      clearAccessToken()

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

