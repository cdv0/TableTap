import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const Signup = () => {
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

    // insert user into employee table with pending status
    await supabase.from("employee").insert({
      name,
      email,
      organization_id: orgId,
      status: "pending",
    });

    alert("Signup submitted. Await approval.");
  };

  return (
    <div className="container mt-4">
      <h2>Request Access</h2>
      <input className="form-control mb-2" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="form-control mb-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="form-control mb-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <select className="form-select mb-3" value={orgId} onChange={(e) => setOrgId(e.target.value)}>
        <option value="">Select Organization</option>
        {orgs.map((org) => (
          <option key={org.organization_id} value={org.organization_id}>{org.name}</option>
        ))}
      </select>
      <button className="btn btn-primary" onClick={handleSignup}>Request Access</button>
    </div>
  );
};

export default Signup;
