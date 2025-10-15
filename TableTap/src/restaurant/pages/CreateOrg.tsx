import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../shared/supabaseClient";
import { useAuth } from "../../shared/contexts/authContext";

const CreateOrg = () => {
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { session, signUpUser } = useAuth();
  const navigate = useNavigate();

  const handleCreateOrg = async (e: any) => {
    e.preventDefault();
    if (!orgName || !name || !email || !password) {
      alert("All fields are required");
      return;
    }

    if (!/^\d{6}$/.test(password)) {
      alert("Password must be exactly 6 digits");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Invalid email format");
      return;
    }
    setLoading(true);
    // sign up the user
    try {
      const result = await signUpUser({ email, password });
      if (result.error) {
        throw result.error;
      }

      const { data: orgData, error: orgError } = await supabase
        .from("organization")
        .insert({
          name: orgName,
          email: email,
          owner_id: result.user.id,
        })
        .select()
        .single();
      if (orgError || !orgData) {
        alert("Failed to create organization: " + orgError?.message);
        return;
      }

      if (result.user) {
        const { error } = await supabase.from("employee").insert({
          employee_id: result.user.id,
          email: email,
          name: name,
          role: "admin",
          organization_id: orgData.org_id,
        });
        if (error) {
          alert("Failed to create admin account: " + error.message);
          return;
        }
      }
    } catch (error) {
      setError("Error signing up");
      return alert("Something went wrong signing up.");
    } finally {
      setLoading(false);
    }
    // navigates user when everything goes to plan
    alert("Organization and admin account created!");
    navigate("/admin-dashboard");
  };

  return (
    <div className="container mt-4">
      <h2>Create Organization</h2>
      <input
        className="form-control mb-2"
        placeholder="Organization Name"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Email"
        type="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="form-control mb-3"
        type="password"
        // maxLength={6}
        // inputMode="numeric"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleCreateOrg}>
        Create Organization
      </button>
    </div>
  );
};

export default CreateOrg;
