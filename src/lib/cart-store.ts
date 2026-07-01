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

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + item.quantity, existing.stock);
  } else {
    cart.push(item);
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
    item.quantity = Math.max(1, Math.min(quantity, item.stock));
    setCart(cart);
  }
}

export function clearCart() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}
