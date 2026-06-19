import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { applyFieldErrors, parseApiError } from '../api/errors'
import { useAuth } from '../contexts/auth'

export default function Register() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, getValues, setError, clearErrors, formState: { errors, isSubmitting } } = useForm()

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
    <section className="auth-section">
      <div className="auth-backdrop" aria-hidden="true" />
      <div className="auth-layout">
        <div className="auth-statement">
          <span className="auth-kicker">KIT Robotics client portal</span>
          <h2>Connect your team to expert support.</h2>
          <p>Create a secure client account for your organization and keep service requests close to every system.</p>
        </div>

        <div className="auth-panel auth-panel-wide">
          <div className="auth-panel-header">
            <span className="auth-panel-mark">KIT</span>
            <p className="eyebrow">Client registration</p>
            <h1>Create your account</h1>
            <p className="form-intro">Use your professional details to get started.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root?.server && <div className="form-alert" role="alert">{errors.root.server.message}</div>}
            <label className="field">
              <span>Full name</span>
              <input placeholder="Your full name" autoComplete="name" {...register('name', { required: 'Name is required', maxLength: 255 })} />
              {errors.name && <small className="field-error">{errors.name.message}</small>}
            </label>

            <label className="field">
              <span>Work email</span>
              <input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
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
                placeholder="At least 8 characters"
                autoComplete="new-password"
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

            <label className="field">
              <span>Confirm password</span>
              <input
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                {...register('password_confirmation', {
                  required: 'Please confirm your password',
                  validate: (value) => value === getValues('password') || 'Passwords do not match',
                })}
              />
              {errors.password_confirmation && <small className="field-error">{errors.password_confirmation.message}</small>}
            </label>

            <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </section>
  )
}
