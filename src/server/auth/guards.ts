import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}

export async function requireUser() {
  const current = await getCurrentProfile();
  if (!current.user) throw new Error("Sesion requerida.");
  return current;
}

export async function requireRole(roles: UserRole[]) {
  const current = await requireUser();
  const role = current.profile?.role as UserRole | undefined;

  if (!role || !roles.includes(role)) {
    throw new Error("No tienes permiso para esta accion.");
  }

  return current;
}

export async function requireAdmin() {
  return requireRole(["administrador", "superadmin"]);
}

export async function requireSuperadmin() {
  return requireRole(["superadmin"]);
}
