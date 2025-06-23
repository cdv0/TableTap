import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import Keypad from "../components/Keypad";
import Navbar from "../components/Navbar";
import { supabase } from "../supabaseClient";

const Login = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (pin: string) => {
    // query the employee table for a matching PIN and approved status
    const { data, error } = await supabase
      .from("employee")
      .select("*")
      .eq("pin", pin)
      .eq("status", "approved")
      .single();

    if (error || !data) {
      alert("Invalid PIN or not yet approved.");
      return;
    }

    // redirect based on role
    if (data.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/employee-dashboard");
    }
  };

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      <Navbar
        heading="Table Tap"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-grow-1 d-flex justify-content-center bg-light">
        <Keypad initialValue="" onSubmit={handleLogin} />
      </div>

      <p className="mt-3 text-center">
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
};

export default Login;
