import { AppShell } from "@/components/ui/shell";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

export const dynamic = "force-dynamic";

async function getRole(): Promise<UserRole> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "cliente";
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    return (data?.role as UserRole) ?? "cliente";
  } catch {
    return "superadmin";
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = await getRole();

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar role={role} />
        <main className="flex-1 overflow-x-auto">
          {children}
        </main>
      </div>
    </AppShell>
  );
}
