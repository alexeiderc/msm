export function sanitizeRedirectPath(next: string | null | undefined, fallback = "/dashboard") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  return next;
}

export const authRouteErrors: Record<string, string> = {
  cuenta_bloqueada: "Esta cuenta esta bloqueada. Contacta soporte MSM.",
  auth_callback: "No se pudo validar el enlace. Solicita uno nuevo o inicia sesion.",
  auth_unavailable: "La conexion segura esta tardando mas de lo normal. Intenta iniciar sesion nuevamente."
};

export function resolvePostAuthPath(next: string | null | undefined, status?: string | null, role?: string | null) {
  let path = sanitizeRedirectPath(next);

  if (!next) {
    if (role === "vendedor_vip") path = "/dashboard/vip";
    else if (role === "administrador") path = "/dashboard/admin";
    else if (role === "administrador_economico") path = "/dashboard/economic";
    else if (role === "superadmin") path = "/dashboard/don-miguel";
  }

  if (status === "pausado" && path.startsWith("/dashboard")) {
    return "/account?status=pausado";
  }

  return path;
}
