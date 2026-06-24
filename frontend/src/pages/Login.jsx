import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { applyFieldErrors, parseApiError } from '../api/errors'
import { useAuth } from '../contexts/auth'
import { getRoleHome } from '../utils/roles'
import backgroundImage from "../assets/images/login.png";

export default function Login() {
  const { isAuthenticated, login, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated) navigate(getRoleHome(user.role), { replace: true })
  }, [isAuthenticated, navigate, user])

  const onSubmit = async (values) => {
    clearErrors('root')
    try {
      const loggedInUser = await login(values.email, values.password)
      toast.success('Welcome back')
      const requestedLocation = location.state?.from
      navigate(requestedLocation ? `${requestedLocation.pathname}${requestedLocation.search || ''}` : getRoleHome(loggedInUser.role), { replace: true })
    } catch (error) {
      const apiError = parseApiError(error, 'Unable to log in')
      applyFieldErrors(setError, apiError.fieldErrors)
      setError('root.server', { message: apiError.message })
    }
  }

  return (
    <section
      className="relative min-h-screen bg-cover bg-center bg-no-repeat px-6 py-12 lg:px-0"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center lg:justify-start lg:ml-20">
        <div
          className={`w-[700px] max-w-[600px] ml-[100px] h-[650px] transform rounded-2xl bg-white p-8 shadow-xl transition-all duration-700 ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}
        >
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Welcome Back
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Sign in to your account
            </h1>
            <p className="mt-2 text-slate-600">
              Access your KIT Support Hub dashboard and manage your robots.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root?.server && <div className="form-alert" role="alert">{errors.root.server.message}</div>}

            <label className="field">
              <span className="text-sm font-semibold text-slate-700">Email address</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="mt-1 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                aria-invalid={Boolean(errors.email)}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                })}
              />
              {errors.email && <small className="field-error">{errors.email.message}</small>}
            </label>

            <label className="field mt-4">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="mt-1 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                aria-invalid={Boolean(errors.password)}
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <small className="field-error">{errors.password.message}</small>}
            </label>

            <button
              className="mt-6 h-12 w-full rounded-lg bg-blue-600 font-semibold text-white transition hover:bg-blue-700 hover:scale-[1.02] disabled:opacity-50"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            New to KIT Support Hub?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}