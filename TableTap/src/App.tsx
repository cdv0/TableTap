import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Assets from "./pages/Assets";

function App() {
  const handleSubmit = (value: string) => {
    console.log("User entered: ", value);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onSubmit={handleSubmit} />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/assets" element={<Assets />} />
      </Routes>
    </Router>
  );
}

export default App;
