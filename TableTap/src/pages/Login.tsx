import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import Keypad from "../components/features/employee/login/Keypad";
import Navbar from "../components/features/employee/global/Navbar";
import { supabase } from "../supabaseClient";

const Login = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (pin: string) => {
    if (!/^\d{6}$/.test(pin)) {
      alert("PIN must be exactly 6 digits");
      return;
    }

    // query the employee table for a matching PIN and approved status
    const { data, error } = await supabase
      .from("employee")
      .select("*")
      .eq("status", "approved")
      .eq("pin", pin)
      .single();

    if (error || !data) {
      alert("Invalid PIN or not yet approved.");
      return;
    }

    // signing in with supabase auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: pin,
    });

    if (authError) {
      alert("Login failed: " + authError.message);
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

      <div className="text-center pb-4 bg-light">
        <Link
          to="/signup"
          className="btn btn-outline-primary "
          style={{
            borderRadius: "25px",
            padding: "10px 32px",
            fontSize: "16px",
            fontWeight: "500",
            textDecoration: "none",
            transition: "all 0.3s ease",
            border: "2px solid #0d6efd",
          }}
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
