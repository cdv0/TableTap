import { Routes, Route } from "react-router-dom";
import OrderPage from "../customer/pages/OrderPage";
import CartPage from "../customer/pages/CartPage";
import OrdersHistoryPage from "../customer/pages/OrdersHistoryPage";

export function CustomerRoutes() {
  return (
    <Routes>
      <Route path="order/:tableId" element={<OrderPage />} />
      <Route path="order/:tableId/cart" element={<CartPage />} />
      <Route path="order/:tableId/orders" element={<OrdersHistoryPage />} />
    </Routes>
  );
}

