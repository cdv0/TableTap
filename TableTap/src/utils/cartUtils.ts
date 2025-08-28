import type { MenuItem, CartItem } from "../types/OrderTypes";
import type { Dispatch, SetStateAction } from "react";

export function addItemToCart(_cart: CartItem[], setCart: Dispatch<SetStateAction<CartItem[]>>, item: MenuItem) {
  console.log(`=== Adding Item to Cart ===`);
  console.log('Item to add:', item);
  console.log('Current cart before adding:', _cart);
  
  setCart((prev: CartItem[]) => {
    // Always add a new item with count: 1 and empty modifiers array
    const newItem = { ...item, count: 1, modifiers: [] };
    console.log('New item being added:', newItem);
    const newCart = [...prev, newItem];
    console.log('New cart after adding:', newCart);
    console.log('=== End Adding Item ===');
    return newCart;
  });
}

export function updateCartCount(_cart: CartItem[], setCart: Dispatch<SetStateAction<CartItem[]>>, index: number, delta: number) {
  setCart((prev: CartItem[]) =>
    prev.map((c, i) =>
      i === index ? { ...c, count: Math.max(1, c.count + delta) } : c
    )
  );
}

export function removeFromCart(_cart: CartItem[], setCart: Dispatch<SetStateAction<CartItem[]>>, index: number) {
  setCart((prev: CartItem[]) => prev.filter((_, i) => i !== index));
}