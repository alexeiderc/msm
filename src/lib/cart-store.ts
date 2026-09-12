export type CartItem = {
  productId: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  store: string;
  storeId: string;
  sellerId: string;
  quantity: number;
  stock: number;
  slug: string;
};

const STORAGE_KEY = "msm-cart";
const MAX_QTY = 20;

function clampQty(quantity: number, stock: number) {
  const max = Number.isFinite(stock) && stock > 0 ? Math.min(stock, MAX_QTY) : MAX_QTY;
  return Math.max(1, Math.min(Math.floor(quantity) || 1, max));
}

function sanitizeItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const productId = String(o.productId ?? "");
  const name = String(o.name ?? "");
  const price = Number(o.price);
  if (!productId || !name || !Number.isFinite(price) || price < 0) return null;

  const stock = Number(o.stock);
  return {
    productId,
    name,
    price,
    currency: String(o.currency ?? "USD"),
    image: String(o.image ?? "/icons/msm-icon.svg"),
    store: String(o.store ?? "Tienda VIP"),
    storeId: String(o.storeId ?? ""),
    sellerId: String(o.sellerId ?? ""),
    quantity: clampQty(Number(o.quantity), stock),
    stock: Number.isFinite(stock) && stock > 0 ? stock : MAX_QTY,
    slug: String(o.slug ?? ""),
  };
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeItem).filter((i): i is CartItem => Boolean(i));
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota / private mode
  }
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find((i) => i.productId === item.productId);
  const stock =
    Number.isFinite(item.stock) && item.stock > 0 ? item.stock : MAX_QTY;

  if (existing) {
    existing.quantity = clampQty(existing.quantity + (item.quantity || 1), stock);
    existing.stock = stock;
    existing.price = item.price;
    existing.name = item.name;
  } else {
    cart.push({
      ...item,
      stock,
      quantity: clampQty(item.quantity || 1, stock),
      currency: item.currency || "USD",
      image: item.image || "/icons/msm-icon.svg",
      store: item.store || "Tienda VIP",
      storeId: item.storeId || "",
      sellerId: item.sellerId || "",
      slug: item.slug || "",
    });
  }
  setCart(cart);
}

export function removeFromCart(productId: string) {
  setCart(getCart().filter((i) => i.productId !== productId));
}

export function updateQuantity(productId: string, quantity: number) {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);
  if (item) {
    item.quantity = clampQty(quantity, item.stock);
    setCart(cart);
  }
}

export function clearCart() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}
