import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { applyFieldErrors, parseApiError } from '../api/errors'
import backgroundImage from '../assets/images/login.png'
import { useAuth } from '../contexts/auth'
import { getRoleHome } from '../utils/roles'

export default function Login() {
  const { isAuthenticated, login, user } = useAuth()
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRoleHome(user.role), { replace: true })
    }
  }, [isAuthenticated, navigate, user])

  const onSubmit = async (values) => {
    clearErrors('root')
    try {
      const loggedInUser = await login(values.email, values.password)
      toast.success('Welcome back')
      navigate(getRoleHome(loggedInUser.role), { replace: true })
    } catch (error) {
      const apiError = parseApiError(error, 'Unable to log in')
      applyFieldErrors(setError, apiError.fieldErrors)
      setError('root.server', { message: apiError.message })
    }
  }

  return (
    <section
      className="relative min-h-screen bg-cover bg-center bg-no-repeat text-white pt-[64px]"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 flex min-h-screen items-center justify-start pl-[200px] max-xl:pl-24 max-lg:justify-center max-lg:px-4 max-lg:pl-4">
        <div
          className={`flex h-[700px] w-[600px] max-w-[calc(100vw-32px)] transform flex-col justify-center rounded-2xl border border-white/30 bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-[20px] transition-all duration-700 dark:border-white/10 dark:bg-transparent dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-sm:h-auto max-sm:min-h-[620px] ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}
        >
          <div className="mb-8 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/30">
              <ShieldCheck size={22} />
            </span>
            <h1 className="mt-5 text-[28px] font-bold leading-tight text-[#0F172A] dark:text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-[#475569] dark:text-[#94A3B8]">Sign in to continue to KIT Support Hub</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root?.server && (
              <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100" role="alert">
                {errors.root.server.message}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Email address</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="mt-2 h-12 w-full rounded-lg border border-[#E2E8F0] bg-white/90 px-4 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/[0.15] dark:border-white/[0.12] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-[#64748B] dark:focus:border-[#2563EB] dark:focus:ring-[#2563EB]/[0.25]"
                aria-invalid={Boolean(errors.email)}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                })}
              />
              {errors.email && <small className="mt-1 block text-sm text-red-200">{errors.email.message}</small>}
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Password</span>
              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-white/90 px-4 pr-12 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/[0.15] dark:border-white/[0.12] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-[#64748B] dark:focus:border-[#2563EB] dark:focus:ring-[#2563EB]/[0.25]"
                  aria-invalid={Boolean(errors.password)}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[#64748B] transition hover:bg-white/10 hover:text-[#0F172A] dark:text-[#64748B] dark:hover:text-[#0F172A]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <small className="mt-1 block text-sm text-red-200">{errors.password.message}</small>}
            </label>

            <button
              className="mt-6 h-12 w-full rounded-lg bg-blue-600 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#475569] dark:text-[#94A3B8]">
            New to KIT Support Hub?{' '}
            <Link to="/register" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#2563EB] dark:hover:text-[#1D4ED8]">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
