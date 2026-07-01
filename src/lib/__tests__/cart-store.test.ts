/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, vi } from "vitest";

const STORAGE_KEY = "msm-cart";

describe("cart-store", () => {
  beforeAll(() => {
    const store: Record<string, string> = {};
    const mockStorage: Storage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { for (const k in store) delete store[k]; },
      get length() { return Object.keys(store).length; },
      key: (index: number) => Object.keys(store)[index] ?? null,
    };
    vi.stubGlobal("localStorage", mockStorage);
    vi.stubGlobal("sessionStorage", mockStorage);
  });

  it("getCart returns empty array when no cart", async () => {
    const { getCart } = await import("../cart-store");
    expect(getCart()).toEqual([]);
  });

  it("addToCart adds a new item", async () => {
    const { addToCart, getCart } = await import("../cart-store");
    addToCart({ productId: "p1", name: "Test", price: 10, quantity: 1, image: "", sellerId: "s1", sellerName: "Store", currency: "USD", store: "Store", storeId: "s1", stock: 10, slug: "test" } as any);
    const cart = getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].productId).toBe("p1");
  });

  it("addToCart increments quantity for existing product", async () => {
    const { addToCart, getCart } = await import("../cart-store");
    addToCart({ productId: "p1", name: "Test", price: 10, quantity: 1, image: "", sellerId: "s1", sellerName: "Store", currency: "USD", store: "Store", storeId: "s1", stock: 10, slug: "test" } as any);
    const cart = getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it("removeFromCart removes item", async () => {
    const { removeFromCart, getCart } = await import("../cart-store");
    const cart = getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].productId).toBe("p1");
    removeFromCart("p1");
    const updated = getCart();
    expect(updated).toHaveLength(0);
  });

  it("clearCart removes all items", async () => {
    const { addToCart, clearCart, getCart } = await import("../cart-store");
    addToCart({ productId: "p2", name: "Test2", price: 20, quantity: 1, image: "", sellerId: "s2", sellerName: "Store2", currency: "USD", store: "Store2", storeId: "s2", stock: 10, slug: "test2" } as any);
    expect(getCart()).toHaveLength(1);
    clearCart();
    expect(getCart()).toEqual([]);
  });
});
