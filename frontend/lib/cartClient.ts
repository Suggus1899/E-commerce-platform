// Browser-only helpers for resolving the guest cart id and for notifying
// other components (e.g. the header cart badge) that the cart changed.

export const GUEST_CART_STORAGE_KEY = "guest_cart_id";
export const CART_UPDATED_EVENT = "cart:updated";

export function getGuestCartId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(GUEST_CART_STORAGE_KEY, id);
  }
  return id;
}

export function dispatchCartUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}

export function resolveCartId(authenticated: boolean): string {
  return authenticated ? "me" : getGuestCartId();
}
