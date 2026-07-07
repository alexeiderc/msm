"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function trackEvent(eventType: string, properties?: Record<string, unknown>) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = createAdminClient();
    await admin.from("analytics_events").insert({
      event_type: eventType,
      profile_id: user?.id ?? null,
      properties: properties ?? {},
      session_id: null
    });
  } catch {
    /* analytics non-blocking */
  }
}

export async function getDashboardStats() {
  try {
    const admin = createAdminClient();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [
      { count: totalOrders },
      { count: totalProducts },
      { count: totalUsers },
      { count: totalSellers },
      { count: ordersToday },
      { count: pendingOrders },
      { data: revenueData },
      { data: topProducts },
      { data: recentOrders }
    ] = await Promise.all([
      admin.from("orders").select("id", { count: "exact", head: true }),
      admin.from("products").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id", { count: "exact", head: true }).neq("role", "superadmin"),
      admin.from("sellers").select("id", { count: "exact", head: true }),
      admin.from("orders").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
      admin.from("orders").select("id", { count: "exact", head: true }).in("status", ["pendiente_pago", "incidencia"]),
      admin.from("orders").select("subtotal").in("status", ["entregada", "cerrada", "pago_confirmado"]).gte("created_at", thirtyDaysAgo),
      admin.from("order_items").select("name,quantity,orders!inner(created_at)").gte("orders.created_at", thirtyDaysAgo).order("quantity", { ascending: false }).limit(10),
      admin.from("orders").select("id,order_number,status,subtotal,created_at,profiles!inner(full_name)").order("created_at", { ascending: false }).limit(10)
    ]);

    const totalRevenue = revenueData?.reduce((sum: number, o: { subtotal: number | string }) => sum + Number(o.subtotal ?? 0), 0) ?? 0;

    return {
      totalOrders: totalOrders ?? 0,
      totalProducts: totalProducts ?? 0,
      totalUsers: totalUsers ?? 0,
      totalSellers: totalSellers ?? 0,
      ordersToday: ordersToday ?? 0,
      pendingOrders: pendingOrders ?? 0,
      revenue30d: totalRevenue,
      topProducts: topProducts ?? [],
      recentOrders: recentOrders ?? []
    };
  } catch {
    return {
      totalOrders: 0, totalProducts: 0, totalUsers: 0, totalSellers: 0,
      ordersToday: 0, pendingOrders: 0, revenue30d: 0,
      topProducts: [], recentOrders: []
    };
  }
}

export async function getRevenueByDay(days = 7) {
  try {
    const admin = createAdminClient();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await admin
      .from("orders")
      .select("subtotal,msm_commission,created_at")
      .in("status", ["entregada", "cerrada", "pago_confirmado"])
      .gte("created_at", start)
      .order("created_at", { ascending: true });

    const byDay: Record<string, { revenue: number; commission: number; count: number }> = {};
    for (const o of data ?? []) {
      const day = new Date(o.created_at).toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { revenue: 0, commission: 0, count: 0 };
      byDay[day].revenue += Number(o.subtotal ?? 0);
      byDay[day].commission += Number(o.msm_commission ?? 0);
      byDay[day].count++;
    }
    return Object.entries(byDay).map(([date, v]) => ({ date, ...v }));
  } catch {
    return [];
  }
}
