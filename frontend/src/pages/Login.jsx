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
      className="relative min-h-screen bg-cover bg-center bg-no-repeat px-4 py-10 text-white sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center py-10">
        <div
          className={`w-full max-w-[420px] transform rounded-2xl border border-white/10 bg-white/[0.08] p-8 shadow-2xl backdrop-blur-[12px] transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="mb-8 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/30">
              <ShieldCheck size={22} />
            </span>
            <h1 className="mt-5 text-[28px] font-bold leading-tight text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-white/70">Sign in to continue to KIT Support Hub</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root?.server && (
              <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100" role="alert">
                {errors.root.server.message}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-semibold text-white">Email address</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                aria-invalid={Boolean(errors.email)}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                })}
              />
              {errors.email && <small className="mt-1 block text-sm text-red-200">{errors.email.message}</small>}
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-white">Password</span>
              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-lg border border-white/15 bg-white/10 px-4 pr-12 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                  aria-invalid={Boolean(errors.password)}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
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

          <p className="mt-6 text-center text-sm text-white/70">
            New to KIT Support Hub?{' '}
            <Link to="/register" className="font-semibold text-white hover:text-blue-200">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
