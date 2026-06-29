"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/server/actions/auth";
import { emptyActionResult } from "@/types/actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, emptyActionResult);

  return (
    <form action={formAction} className="mt-6 grid gap-3">
      <Input name="email" type="email" placeholder="Correo de tu cuenta MSM" required />
      {state.message ? (
        <div
          className={
            state.ok
              ? "rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-semibold leading-6 text-msm-blue"
              : "rounded-md border border-red-100 bg-red-50 p-3 text-sm font-semibold leading-6 text-red-700"
          }
        >
          <span className="inline-flex items-center gap-2">
            {state.ok ? <MailCheck size={16} /> : null}
            {state.message}
          </span>
        </div>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar enlace seguro"}
      </Button>
      <p className="text-center text-sm font-semibold text-slate-600">
        Recordaste tu clave?{" "}
        <Link href="/auth/login" className="text-msm-blue hover:text-msm-electric">
          Iniciar sesion
        </Link>
      </p>
    </form>
  );
}
