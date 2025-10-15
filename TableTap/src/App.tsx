import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./contexts/authContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Assets from "./pages/Assets";
import Signup from "./pages/Signup";
import AdminRequests from "./pages/AdminRequests";
import CreateOrg from "./pages/CreateOrg";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Tables from "./pages/Tables/Tables";
import Orders from "./pages/Orders/Orders";
import Catalog from "./pages/Catalog/Catalog";
import PublicOrderPage from "./pages/OrderPage";
import PrivateRoute from "./components/PrivateRoute";
import CartPage from "./pages/CartPage";
import OrdersHistoryPage from "./pages/OrdersHistoryPage";

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/create-org" element={<CreateOrg />} />
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee-dashboard"
            element={
              <PrivateRoute>
                <EmployeeDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard/requests"
            element={
              <PrivateRoute>
                <AdminRequests />
              </PrivateRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <PrivateRoute>
                <Assets />
              </PrivateRoute>
            }
          />
          <Route
            path="/tables"
            element={
              <PrivateRoute>
                <Tables />
              </PrivateRoute>
            }
          />
          <Route
            path="/tables/:tableId/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog"
            element={
              <PrivateRoute>
                <Catalog />
              </PrivateRoute>
            }
          />
          <Route path="/order/:tableId" element={<PublicOrderPage />} />
          <Route path="/order/:tableId/cart" element={<CartPage />} />
          <Route
            path="/order/:tableId/orders"
            element={<OrdersHistoryPage />}
          />
        </Routes>
      </Router>
    </AuthContextProvider>
  );
}

export default App;
