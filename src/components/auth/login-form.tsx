"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/server/actions/auth";
import { authRouteErrors } from "@/lib/auth/routing";
import { emptyActionResult } from "@/types/actions";

export function LoginForm({ next, error }: { next?: string; error?: string }) {
  const [state, formAction, pending] = useActionState(login, emptyActionResult);
  const routeError = error ? authRouteErrors[error] : null;

  return (
    <form action={formAction} className="mt-6 grid gap-3">
      <input type="hidden" name="next" value={next ?? ""} />
      <Input name="email" type="email" placeholder="Correo" required />
      <Input name="password" type="password" placeholder="Contrasena" required />
      <div className="flex justify-end">
        <Link href="/auth/forgot-password" className="text-xs font-bold text-msm-blue hover:text-msm-electric">
          Olvide mi contrasena
        </Link>
      </div>
      {routeError ? (
        <p className="rounded-md border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">{routeError}</p>
      ) : null}
      {state.message ? (
        <p className={state.ok ? "rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-msm-blue" : "rounded-md border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700"}>
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando..." : "Iniciar sesion"}
      </Button>
    </form>
  );
}
