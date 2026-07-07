"use server";

import { revalidatePath } from "next/cache";
import { taxRateSchema, shippingRateSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/types/actions";

export async function createTaxRate(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = taxRateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("tax_rates").insert({
      country: parsed.data.country,
      province: parsed.data.province || null,
      rate_percent: parsed.data.ratePercent,
      tax_name: parsed.data.taxName
    });
    if (error) return { ok: false, message: error.message };
    revalidatePath("/dashboard/admin/tax-rates");
    return { ok: true, message: "Tasa de impuesto creada." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error." };
  }
}

export async function toggleTaxRate(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const admin = createAdminClient();
    await admin.from("tax_rates").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id);
    revalidatePath("/dashboard/admin/tax-rates");
    return { ok: true, message: isActive ? "Tasa activada." : "Tasa desactivada." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error." };
  }
}

export async function createShippingRate(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = shippingRateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("shipping_rates").insert({
      country: parsed.data.country,
      province: parsed.data.province || null,
      municipality: parsed.data.municipality || null,
      min_order_amount: parsed.data.minOrderAmount,
      cost: parsed.data.cost,
      estimated_days: parsed.data.estimatedDays
    });
    if (error) return { ok: false, message: error.message };
    revalidatePath("/dashboard/admin/shipping-rates");
    return { ok: true, message: "Tarifa de envio creada." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error." };
  }
}

export async function toggleShippingRate(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const admin = createAdminClient();
    await admin.from("shipping_rates").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id);
    revalidatePath("/dashboard/admin/shipping-rates");
    return { ok: true, message: isActive ? "Tarifa activada." : "Tarifa desactivada." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error." };
  }
}

export async function getTaxForLocation(country: string, province?: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("tax_rates")
      .select("*")
      .eq("is_active", true)
      .eq("country", country)
      .maybeSingle();

    if (!data && province) {
      const { data: provincial } = await admin
        .from("tax_rates")
        .select("*")
        .eq("is_active", true)
        .eq("country", country)
        .eq("province", province)
        .maybeSingle();
      return provincial ? { rate: Number(provincial.rate_percent), name: provincial.tax_name } : null;
    }
    return data ? { rate: Number(data.rate_percent), name: data.tax_name } : null;
  } catch {
    return null;
  }
}

export async function getShippingCost(country: string, province?: string, municipality?: string, subtotal?: number) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("shipping_rates")
      .select("*")
      .eq("is_active", true)
      .eq("country", country);

    if (!data?.length) return null;

    let best = data[0];
    for (const rate of data) {
      const matchesMunicipality = rate.municipality && municipality && rate.municipality === municipality;
      const matchesProvince = rate.province && province && rate.province === province;
      const noRestriction = !rate.municipality && !rate.province;
      if (matchesMunicipality) best = rate;
      else if (matchesProvince && !best.municipality) best = rate;
      else if (noRestriction && best.municipality) continue;
    }

    if (subtotal && Number(best.min_order_amount) > 0 && (subtotal ?? 0) >= Number(best.min_order_amount)) {
      return { cost: 0, estimatedDays: best.estimated_days };
    }

    return { cost: Number(best.cost), estimatedDays: best.estimated_days };
  } catch {
    return null;
  }
}
