"use client";

import Link from "next/link";
import { useActionState, useState, useMemo } from "react";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? colors[strength] : "bg-slate-200"}`} />
        ))}
      </div>
      <p className={`mt-0.5 text-xs font-bold ${textColors[strength]}`}>
        {labels[strength]}
      </p>
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

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <input type="hidden" name="phone" value={phoneValue} />

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Nombre completo</label>
        <Input name="fullName" placeholder="Ej: Juan Perez" required />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Pais</label>
        <div className="relative">
          <select
            name="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="min-h-11 w-full appearance-none rounded-md border border-msm-silver bg-white pl-10 pr-8 text-sm font-semibold text-msm-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition focus:border-msm-blue focus:ring-2 focus:ring-blue-100"
            required
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg">
            {country?.flag ?? ""}
          </span>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Telefono / WhatsApp</label>
        <div className="flex gap-2">
          <span className="flex min-h-11 shrink-0 items-center rounded-md border border-msm-silver bg-slate-50 px-3 text-sm font-bold text-msm-ink">
            {country?.prefix ?? "+1"}
          </span>
          <input
            type="tel"
            value={localPhone}
            onChange={(e) => setLocalPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="5551234567"
            className="min-h-11 w-full rounded-md border border-msm-silver bg-white px-3 text-sm font-semibold text-msm-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition placeholder:text-slate-400 focus:border-msm-blue focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Correo electronico</label>
        <Input name="email" type="email" placeholder="ejemplo@correo.com" required />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Contrasena</label>
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-msm-ink"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <PasswordStrengthBar password={password} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Confirmar contrasena</label>
        <div className="relative">
          <Input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Repite la contrasena"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-msm-ink"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {passwordsMatch && (
          <p className="mt-1 flex items-center gap-1 text-xs font-bold text-green-600">
            <CheckCircle2 size={14} /> Las contrasenas coinciden
          </p>
        )}
        {passwordsMismatch && (
          <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-600">
            <XCircle size={14} /> Las contrasenas no coinciden
          </p>
        )}
      </div>

      <label className="flex items-start gap-2 rounded-md border border-msm-line bg-white p-3 text-xs font-semibold leading-5 text-slate-600">
        <input name="termsAccepted" type="checkbox" className="mt-1 h-4 w-4 accent-msm-blue" required />
        Acepto los terminos de MSM MY STORE y entiendo que mis pagos y ordenes se operan dentro de la plataforma.
      </label>

      {state.message ? (
        <div
          className={
            state.ok
              ? "rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-semibold leading-6 text-msm-blue"
              : "rounded-md border border-red-100 bg-red-50 p-3 text-sm font-semibold leading-6 text-red-700"
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

      <Button type="submit" disabled={pending}>
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm font-semibold text-slate-600">
        Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="text-msm-blue hover:text-msm-electric">
          Iniciar sesion
        </Link>
      </p>
    </form>
  );
}
