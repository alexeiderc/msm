"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/server/actions/auth";
import { emptyActionResult } from "@/types/actions";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPassword, emptyActionResult);

  return (
    <form action={formAction} className="mt-6 grid gap-3">
      <Input name="password" type="password" placeholder="Nueva contrasena" required />
      <Input name="confirmPassword" type="password" placeholder="Confirmar contrasena" required />
      {state.message ? (
        <div className={state.ok ? "rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-msm-blue" : "rounded-md border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700"}>
          {state.message}
          {state.ok ? (
            <Link href="/auth/login" className="mt-2 block underline underline-offset-4">
              Ir a iniciar sesion
            </Link>
          ) : null}
        </div>
      ) : null}
      <Button type="submit" disabled={pending}>{pending ? "Actualizando..." : "Guardar nueva contrasena"}</Button>
    </form>
  );
}
