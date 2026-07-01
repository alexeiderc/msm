import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/supabase/admin", () => {
  const mockInsert = vi.fn().mockReturnValue(Promise.resolve({ error: null }));
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
  const mockSupabase = { from: mockFrom } as unknown as SupabaseClient;
  return {
    createAdminClient: vi.fn(() => mockSupabase),
  };
});

vi.mock("@/lib/email", () => ({
  sendOrderReceipt: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/whatsapp", () => ({
  queueWhatsAppMessage: vi.fn().mockResolvedValue(undefined),
}));

describe("notifications", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://test.local");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("exports expected notify functions", async () => {
    const mod = await import("../notifications");
    expect(mod.notifyOrderCreated).toBeInstanceOf(Function);
    expect(mod.notifyPaymentProofReceived).toBeInstanceOf(Function);
    expect(mod.notifyPaymentApproved).toBeInstanceOf(Function);
    expect(mod.notifyOrderStatusChange).toBeInstanceOf(Function);
  });

  it("notifyOrderCreated does not throw with valid params", async () => {
    const mod = await import("../notifications");
    await expect(
      mod.notifyOrderCreated({
        orderId: "test-123",
        orderNumber: "MSM-001",
        userId: "user-1",
        customerEmail: "test@example.com",
        customerPhone: "+5355555555",
      }),
    ).resolves.not.toThrow();
  });
});
