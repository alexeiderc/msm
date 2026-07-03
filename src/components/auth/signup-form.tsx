"use client";

import Link from "next/link";
import { useActionState, useState, useMemo } from "react";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { signup } from "@/server/actions/auth";
import { emptyActionResult } from "@/types/actions";
import { countries } from "@/lib/countries";

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const labels = ["", "Debil", "Media", "Buena", "Fuerte", "Muy fuerte"];
  const colors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
  const textColors = ["", "text-red-600", "text-orange-600", "text-yellow-700", "text-lime-700", "text-green-700"];

  if (!password) return null;

  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? colors[strength] : "bg-slate-200"}`} />
        ))}
      </div>
      <p className={`mt-1 text-xs font-bold ${textColors[strength]}`}>
        {labels[strength]}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 md:text-xs">
        {label}
      </label>
      {children}
    </div>
  );
}

export function SignupForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signup, emptyActionResult);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [localPhone, setLocalPhone] = useState("");

  const country = countries.find((c) => c.code === selectedCountry);
  const phoneValue = country ? `${country.prefix} ${localPhone}` : localPhone;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const inputBase =
    "block w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-msm-ink outline-none transition placeholder:text-slate-400 focus:border-msm-blue focus:ring-2 focus:ring-blue-100 h-12 md:h-11 md:rounded-lg";

  return (
    <form action={formAction} className="mt-6 grid gap-5 md:gap-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <input type="hidden" name="phone" value={phoneValue} />

      <Field label="Nombre completo">
        <input
          name="fullName"
          placeholder="Ej: Juan Perez"
          className={inputBase}
          required
        />
      </Field>

      <Field label="Pais">
        <div className="relative">
          <select
            name="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className={`${inputBase} appearance-none pl-10 pr-9`}
            required
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg">
            {country?.flag ?? ""}
          </span>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </Field>

      <Field label="Telefono / WhatsApp">
        <div className="flex gap-2">
          <span className="flex h-12 shrink-0 items-center rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-bold text-msm-ink md:h-11 md:rounded-lg">
            {country?.prefix ?? "+1"}
          </span>
          <input
            type="tel"
            value={localPhone}
            onChange={(e) => setLocalPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="5551234567"
            className={inputBase}
            required
          />
        </div>
      </Field>

      <Field label="Correo electronico">
        <input
          name="email"
          type="email"
          placeholder="ejemplo@correo.com"
          className={inputBase}
          required
        />
      </Field>

      <div>
        <Field label="Contrasena">
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputBase}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-msm-ink"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </Field>
        <PasswordStrengthBar password={password} />
      </div>

      <Field label="Confirmar contrasena">
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Repite la contrasena"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputBase}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-msm-ink"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {passwordsMatch && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-bold text-green-600">
            <CheckCircle2 size={14} /> Las contrasenas coinciden
          </p>
        )}
        {passwordsMismatch && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-bold text-red-600">
            <XCircle size={14} /> Las contrasenas no coinciden
          </p>
        )}
      </Field>

      <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold leading-5 text-slate-600 md:rounded-lg">
        <input name="termsAccepted" type="checkbox" className="mt-0.5 h-5 w-5 accent-msm-blue md:h-4 md:w-4" required />
        Acepto los terminos de MSM MY STORE y entiendo que mis pagos y ordenes se operan dentro de la plataforma.
      </label>

      {state.message ? (
        <div
          className={
            state.ok
              ? "rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold leading-6 text-msm-blue md:rounded-lg"
              : "rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700 md:rounded-lg"
          }
        >
          {state.message}
          {state.ok ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href="/account/kyc" className="underline underline-offset-4">
                Validar cuenta
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-msm-blue text-sm font-extrabold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60 md:h-11 md:rounded-lg"
      >
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-center text-sm font-semibold text-slate-500">
        Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="font-bold text-msm-blue hover:text-msm-electric">
          Iniciar sesion
        </Link>
      </p>
    </form>
  );
}
