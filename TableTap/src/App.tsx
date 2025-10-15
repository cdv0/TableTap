import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./shared/contexts/authContext";
import { SharedRoutes } from "./routes/sharedRoutes";
import { CustomerRoutes } from "./routes/customerRoutes";
import { RestaurantRoutes } from "./routes/restaurantRoutes";

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <Routes>
          {/* Customer routes */}
          <Route path="/customer/*" element={<CustomerRoutes />} />
          
          {/* Restaurant routes */}
          <Route path="/restaurant/*" element={<RestaurantRoutes />} />
          
          {/* Shared routes (login, signup) - must be last */}
          <Route path="/*" element={<SharedRoutes />} />
        </Routes>
      </Router>
    </AuthContextProvider>
  );
}

export default App;
