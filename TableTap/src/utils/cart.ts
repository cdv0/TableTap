export type CartLine = {
    id: string;        // unique line id 
    title: string;
    unitPrice: number;
    qty: number;
    meta?: any;
  };

  const key = (tableId: string | undefined) => `cart:${tableId ?? "anon"}`;

  export function loadCart(tableId?: string): CartLine[] {
    try {
      const raw = localStorage.getItem(key(tableId));
      return raw ? JSON.parse(raw) as CartLine[] : [];
    } catch {
      return [];
    }
  }

  export function saveCart(tableId: string | undefined, items: CartLine[]) {
    localStorage.setItem(key(tableId), JSON.stringify(items));
  }

  export function clearCart(tableId?: string) {
    localStorage.removeItem(key(tableId));
  }