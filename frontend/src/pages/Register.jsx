import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { applyFieldErrors, parseApiError } from '../api/errors'
import backgroundImage from '../assets/images/image1.png'
import { useAuth } from '../contexts/auth'

export default function Register() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
              <UserPlus size={22} />
            </span>
            <h1 className="mt-5 text-[28px] font-bold leading-tight text-white">Create Account</h1>
            <p className="mt-2 text-sm text-white/70">Join KIT Support Hub and manage your robots</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root?.server && (
              <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100" role="alert">
                {errors.root.server.message}
              </div>
            )}

            <Field label="Full name" error={errors.name?.message}>
              <input
                placeholder="Your full name"
                autoComplete="name"
                className={inputClass}
                aria-invalid={Boolean(errors.name)}
                {...register('name', { required: 'Name is required', maxLength: { value: 255, message: 'Name must not exceed 255 characters' } })}
              />
            </Field>

            <Field label="Work email" error={errors.email?.message}>
              <input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className={inputClass}
                aria-invalid={Boolean(errors.email)}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                })}
              />
            </Field>

            <Field label="Company name">
              <input
                placeholder="Your company name"
                autoComplete="organization"
                className={inputClass}
                {...register('company_name')}
              />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <PasswordInput
                visible={showPassword}
                onToggle={() => setShowPassword((visible) => !visible)}
                inputProps={{
                  placeholder: 'At least 8 characters',
                  autoComplete: 'new-password',
                  'aria-invalid': Boolean(errors.password),
                  ...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Use at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                      message: 'Use uppercase, lowercase, number, and symbol characters',
                    },
                  }),
                }}
              />
            </Field>

            <Field label="Confirm password" error={errors.password_confirmation?.message}>
              <PasswordInput
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((visible) => !visible)}
                inputProps={{
                  placeholder: 'Repeat your password',
                  autoComplete: 'new-password',
                  'aria-invalid': Boolean(errors.password_confirmation),
                  ...register('password_confirmation', {
                    required: 'Please confirm your password',
                    validate: (value) => value === getValues('password') || 'Passwords do not match',
                  }),
                }}
              />
            </Field>

            <button
              className="mt-6 h-12 w-full rounded-lg bg-blue-600 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/70">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-white hover:text-blue-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="mt-4 block first:mt-0">
      <span className="text-sm font-semibold text-white">{label}</span>
      <div className="mt-2">{children}</div>
      {error && <small className="mt-1 block text-sm text-red-200">{error}</small>}
    </label>
  )
}

function PasswordInput({ visible, onToggle, inputProps }) {
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        className={`${inputClass} pr-12`}
        {...inputProps}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

const inputClass = 'h-12 w-full rounded-lg border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30'
