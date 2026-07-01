import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { applyFieldErrors, parseApiError } from "../api/errors";
import backgroundImage from "../assets/images/login.png";
import { useAuth } from "../contexts/auth";

export default function Register() {
  const { register: createAccount } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const onSubmit = async (values) => {
    clearErrors("root");
    try {
      await createAccount(values);
      toast.success("Account created. You can now log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      const apiError = parseApiError(error, "Unable to create your account");
      applyFieldErrors(setError, apiError.fieldErrors);
      setError("root.server", { message: apiError.message });
    }
  };

  return (
    <section
      className="relative min-h-screen bg-cover bg-center bg-no-repeat text-white pt-[64px]"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 flex min-h-screen items-center justify-start pl-[200px] max-xl:pl-24 max-lg:justify-center max-lg:px-4 max-lg:pl-4">
        <div
          className={`flex h-[800px] w-[600px] max-w-[calc(100vw-32px)] transform flex-col justify-center rounded-2xl border border-white/30 bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-[20px] transition-all duration-700 dark:border-white/10 dark:bg-transparent dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-sm:h-auto max-sm:min-h-[700px] ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
          }`}
        >
          <div className="mb-8 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/30">
              <UserPlus size={22} />
            </span>
            <h1 className="mt-5 text-[28px] font-bold leading-tight text-[#0F172A] dark:text-white">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-[#475569] dark:text-[#94A3B8]">
              Join KIT Support Hub and manage your robots
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root?.server && (
              <div
                className="mb-4 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100"
                role="alert"
              >
                {errors.root.server.message}
              </div>
            )}

            <Field label="Full name" error={errors.name?.message}>
              <input
                placeholder="Your full name"
                autoComplete="name"
                className={inputClass}
                aria-invalid={Boolean(errors.name)}
                {...register("name", {
                  required: "Name is required",
                  maxLength: {
                    value: 255,
                    message: "Name must not exceed 255 characters",
                  },
                })}
              />
            </Field>

            <Field label="Work email" error={errors.email?.message}>
              <input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className={inputClass}
                aria-invalid={Boolean(errors.email)}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
            </Field>

            <Field label="Company name">
              <input
                placeholder="Your company name"
                autoComplete="organization"
                className={inputClass}
                {...register("company_name")}
              />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <PasswordInput
                visible={showPassword}
                onToggle={() => setShowPassword((visible) => !visible)}
                inputProps={{
                  placeholder: "At least 8 characters",
                  autoComplete: "new-password",
                  "aria-invalid": Boolean(errors.password),
                  ...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Use at least 8 characters",
                    },
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                      message:
                        "Use uppercase, lowercase, number, and symbol characters",
                    },
                  }),
                }}
              />
            </Field>

            <Field
              label="Confirm password"
              error={errors.password_confirmation?.message}
            >
              <PasswordInput
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((visible) => !visible)}
                inputProps={{
                  placeholder: "Repeat your password",
                  autoComplete: "new-password",
                  "aria-invalid": Boolean(errors.password_confirmation),
                  ...register("password_confirmation", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === getValues("password") ||
                      "Passwords do not match",
                  }),
                }}
              />
            </Field>

            <button
              className="mt-6 h-12 w-full rounded-lg bg-blue-600 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#475569] dark:text-[#94A3B8]">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#2563EB] dark:hover:text-[#1D4ED8]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="mt-4 block first:mt-0">
      <span className="text-sm font-semibold text-[#1E293B] dark:text-[#E2E8F0]">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {error && (
        <small className="mt-1 block text-sm text-red-200">{error}</small>
      )}
    </label>
  );
}

function PasswordInput({ visible, onToggle, inputProps }) {
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={`${inputClass} pr-12`}
        {...inputProps}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[#64748B] transition hover:bg-white/10 hover:text-[#0F172A] dark:text-[#64748B] dark:hover:text-[#0F172A]"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-lg border border-[#E2E8F0] bg-white/90 px-4 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/[0.15] dark:border-white/[0.12] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-[#64748B] dark:focus:border-[#2563EB] dark:focus:ring-[#2563EB]/[0.25]";
