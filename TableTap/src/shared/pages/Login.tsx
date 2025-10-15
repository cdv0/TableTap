import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "../../restaurant/components/global/Navbar";
import { useAuth } from "../contexts/authContext";

const Login = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { SignInUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await SignInUser(email, password);
      if (result.user) {
        navigate("/restaurant/admin-dashboard");
      }
    } catch (error: any) {
      setError("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      <Navbar
        heading="Table Tap"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-grow-1 d-flex justify-content-center align-items-center bg-light">
        <div className="card p-4 shadow" style={{ maxWidth: "400px", width: "100%" }}>
          <h3 className="mb-4 text-center">Login</h3>
          
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-3">
            <Link
              to="/signup"
              className="btn btn-outline-primary"
              style={{
                borderRadius: "25px",
                padding: "8px 24px",
                fontSize: "14px",
                fontWeight: "500",
                textDecoration: "none",
                transition: "all 0.3s ease",
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
