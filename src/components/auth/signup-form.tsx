"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { signup } from "@/server/actions/auth";
import { emptyActionResult } from "@/types/actions";

export function SignupForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signup, emptyActionResult);

  return (
    <form action={formAction} className="mt-6 grid gap-3">
      <input type="hidden" name="next" value={next ?? ""} />
      <Input name="fullName" placeholder="Nombre completo" required />
      <Input name="phone" type="tel" placeholder="Telefono / WhatsApp" required />
      <Input name="country" placeholder="Pais donde resides" defaultValue="Estados Unidos" required />
      <Input name="email" type="email" placeholder="Correo" required />
      <Input name="password" type="password" placeholder="Contrasena" required />
      <Input name="confirmPassword" type="password" placeholder="Confirmar contrasena" required />
      <Select name="roleIntent" defaultValue="cliente">
        <option value="cliente">Cliente comprador</option>
        <option value="vendedor_vip">Quiero ser vendedor VIP</option>
      </Select>
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
              <Link href="/vendedores/solicitud" className="underline underline-offset-4">
                Solicitud VIP
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
