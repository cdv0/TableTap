import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../shared/components/PrivateRoute";
import AdminDashboard from "../restaurant/pages/AdminDashboard";
import EmployeeDashboard from "../restaurant/pages/EmployeeDashboard";
import AdminRequests from "../restaurant/pages/AdminRequests";
import Assets from "../restaurant/pages/Assets";
import Tables from "../restaurant/pages/Tables/Tables";
import Orders from "../restaurant/pages/Orders/Orders";
import Catalog from "../restaurant/pages/Catalog/Catalog";
import QRCodeGenerator from "../restaurant/pages/QRCodeGenerator";

export function RestaurantRoutes() {
  return (
    <Routes>
      <Route path="admin-dashboard" element={
        <PrivateRoute>
          <AdminDashboard />
        </PrivateRoute>
      } />
      <Route path="employee-dashboard" element={
        <PrivateRoute>
          <EmployeeDashboard />
        </PrivateRoute>
      } />
      <Route path="admin-dashboard/requests" element={
        <PrivateRoute>
          <AdminRequests />
        </PrivateRoute>
      } />
      <Route path="assets" element={
        <PrivateRoute>
          <Assets />
        </PrivateRoute>
      } />
      <Route path="tables" element={
        <PrivateRoute>
          <Tables />
        </PrivateRoute>
      } />
      <Route path="tables/:tableId/orders" element={
        <PrivateRoute>
          <Orders />
        </PrivateRoute>
      } />
      <Route path="catalog" element={
        <PrivateRoute>
          <Catalog />
        </PrivateRoute>
      } />
      <Route path="qr-codes" element={
        <PrivateRoute>
          <QRCodeGenerator />
        </PrivateRoute>
      } />
    </Routes>
  );
}

