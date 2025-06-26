import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";

const Signup = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgId, setOrgId] = useState("");

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
  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return alert(error.message);

    const user = data.user;

    // insert user into employee table with pending status
    const { error: insertError } = await supabase.from("employee").insert({
        employee_id: user.id,
        name,
        email,
        role: "employee",
        organization_id: orgId,
        status: "pending",
    });

    if (insertError) {
        console.error("Insert failed:", insertError.message);
        return alert("Insert failed: " + insertError.message);
    }

    alert("Signup submitted. Await approval.");
  };

  return (
    <div>
        <Navbar heading="Employee SignUp" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}></Navbar>
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '100%' }}>
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
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                className="form-control"
                type="password"
                placeholder="Create a password"
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
        </div>
    </div>
    );

};

export default Signup;
