import { describe, expect, it } from "vitest";
import {
  buildWaMeLink,
  buildWhatsAppOrderMessage,
  normalizeWhatsAppDigits,
} from "./whatsapp-order";

describe("normalizeWhatsAppDigits", () => {
  it("strips non-digits", () => {
    expect(normalizeWhatsAppDigits("+53 5 123-4567")).toBe("5351234567");
  });

  it("adds Cuba country code for 8-digit mobile", () => {
    expect(normalizeWhatsAppDigits("51234567")).toBe("5351234567");
  });

  it("keeps full international number", () => {
    expect(normalizeWhatsAppDigits("5351234567")).toBe("5351234567");
  });

  it("removes leading zero", () => {
    expect(normalizeWhatsAppDigits("051234567")).toBe("5351234567");
  });
});

describe("buildWhatsAppOrderMessage", () => {
  it("includes customer, address, products and total", () => {
    const message = buildWhatsAppOrderMessage(
      {
        items: [
          {
            productId: "p1",
            name: "Combo Familiar",
            price: 58,
            currency: "USD",
            quantity: 2,
            store: "MSM MY STORE",
            slug: "combo-familiar",
          },
        ],
        totalAmount: 116,
        customerName: "Juan Pérez",
        customerPhone: "+53 5 1111111",
        deliveryAddress: "Calle 1 #10",
        deliveryProvince: "Santiago de Cuba",
        deliveryMunicipality: "Santiago de Cuba",
      },
      "https://msmmystore.com/dashboard/whatsapp-carts/abc"
    );

    expect(message).toContain("Juan Pérez");
    expect(message).toContain("Combo Familiar x2 = $116.00");
    expect(message).toContain("*Total:* $116.00 USD");
    expect(message).toContain("https://msmmystore.com/dashboard/whatsapp-carts/abc");
    expect(message).toContain("Santiago de Cuba");
  });

  it("omits optional fields when empty", () => {
    const message = buildWhatsAppOrderMessage(
      {
        items: [
          {
            productId: "p1",
            name: "Producto",
            price: 10,
            currency: "USD",
            quantity: 1,
            store: "Store",
            slug: "producto",
          },
        ],
        totalAmount: 10,
        customerName: "Ana",
        customerPhone: "51234567",
        deliveryAddress: "Dir",
        deliveryProvince: "La Habana",
        deliveryMunicipality: "Playa",
      },
      "https://example.com/t"
    );

    expect(message).not.toContain("*Email:*");
    expect(message).not.toContain("*Beneficiario:*");
    expect(message).not.toContain("*Notas:*");
  });
});

describe("buildWaMeLink", () => {
  it("builds a valid wa.me URL with encoded text", () => {
    const link = buildWaMeLink("+53 5 1234567", "Hola mundo");
    expect(link).toBe("https://wa.me/5351234567?text=Hola%20mundo");
  });

  it("encodes special characters in the message", () => {
    const link = buildWaMeLink("5351234567", "Total: $58.00\n*Negrita*");
    expect(link.startsWith("https://wa.me/5351234567?text=")).toBe(true);
    expect(link).toContain(encodeURIComponent("Total: $58.00"));
  });
});
