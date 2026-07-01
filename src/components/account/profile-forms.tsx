"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { Camera, KeyRound, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { changePassword, removeAvatar, updateProfile, uploadAvatar } from "@/server/actions/users";
import { emptyActionResult, type ActionResult } from "@/types/actions";

type Profile = {
  full_name?: string | null;
  phone?: string | null;
  country?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  whatsapp?: string | null;
  preferred_language?: string | null;
  timezone?: string | null;
  notification_email_enabled?: boolean | null;
  notification_whatsapp_enabled?: boolean | null;
};

function Message({ state }: { state: ActionResult }) {
  if (!state.message) return null;
  return (
    <p className={state.ok ? "rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-bold text-msm-blue" : "rounded-md border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700"}>
      {state.message}
    </p>
  );
}

export function AvatarUpload({ profile }: { profile?: Profile | null }) {
  const [state, formAction, pending] = useActionState(uploadAvatar, emptyActionResult);
  const [removeState, removeAction, removePending] = useActionState(removeAvatar, emptyActionResult);
  const [preview, setPreview] = useState<string | null>(profile?.avatar_url ?? null);

  return (
    <section className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <h2 className="flex items-center gap-2 text-lg font-bold text-msm-ink"><Camera size={19} /> Foto de perfil</h2>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-msm-line bg-blue-50">
          {preview ? (
            <Image src={preview} alt="Foto de perfil" fill className="object-cover" sizes="96px" />
          ) : (
            <div className="grid h-full place-items-center text-2xl font-black text-msm-blue">MSM</div>
          )}
        </div>
        <form action={formAction} className="grid flex-1 gap-3">
          <Input
            name="avatarFile"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
          <Message state={state} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>{pending ? "Subiendo..." : "Subir foto"}</Button>
          </div>
        </form>
        <form action={removeAction} className="grid gap-2">
          <Message state={removeState} />
          <button disabled={removePending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-red-100 bg-red-50 px-4 text-sm font-bold text-red-700 disabled:opacity-60">
            <Trash2 size={16} /> {removePending ? "Eliminando..." : "Eliminar foto"}
          </button>
        </form>
      </div>
    </section>
  );
}

export function ProfileForm({ profile }: { profile?: Profile | null }) {
  const [state, formAction, pending] = useActionState(updateProfile, emptyActionResult);

  return (
    <form action={formAction} className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <h2 className="text-lg font-bold text-msm-ink">Datos personales</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Input name="fullName" placeholder="Nombre completo" defaultValue={profile?.full_name ?? ""} required />
        <Input name="phone" placeholder="Telefono" defaultValue={profile?.phone ?? ""} required />
        <Input name="country" placeholder="Pais" defaultValue={profile?.country ?? "Estados Unidos"} required />
        <Input name="whatsapp" placeholder="WhatsApp" defaultValue={profile?.whatsapp ?? ""} />
        <Select name="preferredLanguage" defaultValue={profile?.preferred_language ?? "es"}>
          <option value="es">Espanol</option>
          <option value="en">English</option>
        </Select>
        <Input name="timezone" placeholder="Zona horaria" defaultValue={profile?.timezone ?? "America/New_York"} />
      </div>
      <Textarea name="address" placeholder="Direccion" defaultValue={profile?.address ?? ""} className="mt-3" />
      <Textarea name="bio" placeholder="Bio publica corta" defaultValue={profile?.bio ?? ""} className="mt-3" maxLength={300} />
      <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-md border border-msm-line p-3">
          <input name="notificationEmailEnabled" type="checkbox" defaultChecked={profile?.notification_email_enabled !== false} className="h-5 w-5 accent-msm-blue" />
          Recibir correos MSM
        </label>
        <label className="flex items-center gap-2 rounded-md border border-msm-line p-3">
          <input name="notificationWhatsappEnabled" type="checkbox" defaultChecked={Boolean(profile?.notification_whatsapp_enabled)} className="h-5 w-5 accent-msm-blue" />
          Recibir WhatsApp cuando este activo
        </label>
      </div>
      <div className="mt-4 grid gap-3">
        <Message state={state} />
        <Button type="submit" disabled={pending}><Save size={17} /> {pending ? "Guardando..." : "Guardar perfil"}</Button>
      </div>
    </form>
  );
}

export function SecurityForm() {
  const [state, formAction, pending] = useActionState(changePassword, emptyActionResult);

  return (
    <form action={formAction} className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <h2 className="flex items-center gap-2 text-lg font-bold text-msm-ink"><KeyRound size={19} /> Seguridad</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Input name="password" type="password" placeholder="Nueva contrasena" required />
        <Input name="confirmPassword" type="password" placeholder="Confirmar contrasena" required />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        MFA queda preparado para una fase futura. Para cuentas admin se recomienda activarlo antes del beta publico.
      </p>
      <div className="mt-4 grid gap-3">
        <Message state={state} />
        <Button type="submit" disabled={pending}>{pending ? "Actualizando..." : "Cambiar contrasena"}</Button>
      </div>
    </form>
  );
}
