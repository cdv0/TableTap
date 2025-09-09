import type { MenuItem, CartItem } from "../types/OrderTypes";
import type { Dispatch, SetStateAction } from "react";

export function addItemToCart(cart: CartItem[], setCart: Dispatch<SetStateAction<CartItem[]>>, item: MenuItem) {
  setCart((prev: CartItem[]) => {
    // Always add a new item with count: 1, ignoring existing items
    return [...prev, { ...item, count: 1 }];
  });
}

export function updateCartCount(cart: CartItem[], setCart: Dispatch<SetStateAction<CartItem[]>>, index: number, delta: number) {
  setCart((prev: CartItem[]) =>
    prev.map((c, i) =>
      i === index ? { ...c, count: Math.max(1, c.count + delta) } : c
    )
  );
}

export function removeFromCart(cart: CartItem[], setCart: Dispatch<SetStateAction<CartItem[]>>, index: number) {
  setCart((prev: CartItem[]) => prev.filter((_, i) => i !== index));
}