import { AppShell } from "@/components/ui/shell";
import { DashboardWorkspaceShell } from "@/components/dashboard/dashboard-workspace-shell";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

export const dynamic = "force-dynamic";

async function getRole(): Promise<UserRole> {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return "cliente";

    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    return (data?.role as UserRole) ?? "cliente";
  } catch {
    return "superadmin";
  }
}

export default async function DashboardPage() {
  const role = await getRole();

  return (
    <AppShell>
      <DashboardWorkspaceShell role={role} />
    </AppShell>
  );
}
