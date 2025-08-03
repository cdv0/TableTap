import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Assets from "./pages/Assets";
import Signup from "./pages/Signup";
import AdminRequests from "./pages/AdminRequests";
import CreateOrg from "./pages/CreateOrg";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Tables from "./pages/Tables";
import Orders from "./pages/Orders/Orders";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create-org" element={<CreateOrg />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/admin-dashboard/requests" element={<AdminRequests />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/tables/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
}

export default App;
