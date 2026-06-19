import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { applyFieldErrors, parseApiError } from '../api/errors'
import { useAuth } from '../contexts/auth'
import { getRoleHome } from '../utils/roles'

export default function Login() {
  const { isAuthenticated, login, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (isAuthenticated) navigate(getRoleHome(user.role), { replace: true })
  }, [isAuthenticated, navigate, user])

  const onSubmit = async (values) => {
    clearErrors('root')

    try {
      const loggedInUser = await login(values.email, values.password)
      toast.success('Welcome back')
      navigate(location.state?.from?.pathname || getRoleHome(loggedInUser.role), { replace: true })
    } catch (error) {
      const apiError = parseApiError(error, 'Unable to log in')
      applyFieldErrors(setError, apiError.fieldErrors)
      setError('root.server', { message: apiError.message })
    }
  }

  return (
    <section className="auth-section">
      <div className="auth-backdrop" aria-hidden="true" />
      <div className="auth-layout">
        <div className="auth-statement">
          <span className="auth-kicker">Autonomous systems support</span>
          <h2>Keep every robot mission moving.</h2>
          <p>One secure workspace for technical requests, product knowledge, and service history.</p>
        </div>

        <div className="auth-panel">
          <div className="auth-panel-header">
            <span className="auth-panel-mark">KIT</span>
            <p className="eyebrow">Secure portal access</p>
            <h1>Welcome back</h1>
            <p className="form-intro">Sign in to continue to KIT Support Hub.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root?.server && <div className="form-alert" role="alert">{errors.root.server.message}</div>}
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={Boolean(errors.email)}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                })}
              />
              {errors.email && <small className="field-error">{errors.email.message}</small>}
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={Boolean(errors.password)}
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <small className="field-error">{errors.password.message}</small>}
            </label>

            <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">New to KIT Support Hub? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </section>
  )
}
