import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/features/employee/global/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const Signup = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgId, setOrgId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { session, signUpUser } = useAuth();
  const navigate = useNavigate();
  const navigateLogin = () => {
    navigate("/");
  };
  console.log(session);

  // used to fetch all the orgs from supabase database and import them into "orgs"
  useEffect(() => {
    // load list of organizations
    const fetchOrgs = async () => {
      const { data } = await supabase.from("organization").select("*");
      setOrgs(data || []);
    };
    fetchOrgs();
  }, []);

  // handle signup from input data
  const handleSignup = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signUpUser({ email, password });
      if (result.user) {
        navigate("/admin-dashboard");
      }
    } catch (error) {
      setError("Error signing up");
      return alert("Something went wrong signing up.");
    } finally {
      setLoading(false);
    }
  };

  // insert user into employee table with pending status
  // const { error: insertError } = await supabase.from("employee").insert({
  //   employee_id: user.id,
  //   name: name,
  //   email: email,
  //   password: password,
  //   organization_id: orgId,
  //   status: "pending",
  // });

  // if (insertError) {
  //   console.error("Insert failed:", insertError.message);
  //   return alert("Insert failed: " + insertError.message);
  // };

  return (
    <div>
      <Navbar
        heading="Employee SignUp"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      ></Navbar>
      {/* <div className="container mt-5 d-flex flex-column justify-content-center align-items-center">
        <div
          className="card p-4 shadow"
          style={{ maxWidth: "500px", width: "100%" }}
        >
          <h3 className="mb-4 text-center">Request Access</h3>

          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Choose 6-digit PIN</label>
            <input
              className="form-control"
              type="password"
              inputMode="numeric"
              placeholder="6-digit PIN"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Select Organization</label>
            <select
              className="form-select"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
            >
              <option value="">Select Organization</option>
              {orgs.map((org) => (
                <option key={org.org_id} value={org.org_id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary w-100" onClick={handleSignup}>
            Request Access
          </button>
        </div>
        <button
          onClick={navigateLogin}
          className="btn btn-outline-secondary mt-3"
          style={{
            borderRadius: "20px",
            padding: "8px 24px",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.3s ease",
            textDecoration: "none",
          }}
        >
          ← Back
        </button>
      </div> */}

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label className="form-label">Select Organization</label>
        <select
          className="form-select"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
        >
          <option value="">Select Organization</option>
          {orgs.map((org) => (
            <option key={org.org_id} value={org.org_id}>
              {org.name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={loading}>
          Signup
        </button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default Signup;
