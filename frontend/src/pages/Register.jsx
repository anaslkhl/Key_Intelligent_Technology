import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { applyFieldErrors, parseApiError } from '../api/errors'
import { useAuth } from '../contexts/auth'
import backgroundImage from "../assets/images/login.png";

export default function Register() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const { register, handleSubmit, getValues, setError, clearErrors, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const onSubmit = async (values) => {
    clearErrors('root')
    try {
      await createAccount(values)
      toast.success('Account created. You can now log in.')
      navigate('/login', { replace: true })
    } catch (error) {
      const apiError = parseApiError(error, 'Unable to create your account')
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
          className={`w-[700px] max-w-[700px] ml-[100px] transform rounded-2xl bg-white p-8 shadow-xl transition-all duration-700 ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}
        >
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Get Started
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Create your account
            </h1>
            <p className="mt-2 text-slate-600">
              Join KIT Support Hub and start managing your robots today.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root?.server && <div className="form-alert" role="alert">{errors.root.server.message}</div>}

            <label className="field">
              <span className="text-sm font-semibold text-slate-700">Full name</span>
              <input
                placeholder="Your full name"
                autoComplete="name"
                className="mt-1 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                aria-invalid={Boolean(errors.name)}
                {...register('name', { required: 'Name is required', maxLength: { value: 255, message: 'Name must not exceed 255 characters' } })}
              />
              {errors.name && <small className="field-error">{errors.name.message}</small>}
            </label>

            <label className="field mt-4">
              <span className="text-sm font-semibold text-slate-700">Work email</span>
              <input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
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
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="mt-1 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                aria-invalid={Boolean(errors.password)}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Use at least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                    message: 'Use uppercase, lowercase, number, and symbol characters',
                  },
                })}
              />
              {errors.password && <small className="field-error">{errors.password.message}</small>}
            </label>

            <label className="field mt-4">
              <span className="text-sm font-semibold text-slate-700">Confirm password</span>
              <input
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                className="mt-1 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                aria-invalid={Boolean(errors.password_confirmation)}
                {...register('password_confirmation', {
                  required: 'Please confirm your password',
                  validate: (value) => value === getValues('password') || 'Passwords do not match',
                })}
              />
              {errors.password_confirmation && <small className="field-error">{errors.password_confirmation.message}</small>}
            </label>

            <button
              className="mt-6 h-12 w-full rounded-lg bg-blue-600 font-semibold text-white transition hover:bg-blue-700 hover:scale-[1.02] disabled:opacity-50"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}