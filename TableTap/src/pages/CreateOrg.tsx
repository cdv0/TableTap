import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const CreateOrg = () => {
  const [orgName, setOrgName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  const handleCreateOrg = async () => {
    if (!orgName || !adminName || !adminEmail || !pin) {
      alert("All fields are required");
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      alert("PIN must be exactly 6 digits");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      alert("Invalid email format");
      return;
    }

    // sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: pin,
    });

    // failed message
    if (authError || !authData.user) {
      alert("Signup failed: " + authError?.message);
      return;
    }

    // get the current session of the user and their ID
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    // TODO: need to turn on email confirmation in supabase
    if (!userId) {
      alert("User not yet authenticated. Please confirm your email.");
      return;
    }

    // inserts organization row into supabase with the owner
    const { data: orgData, error: orgError } = await supabase
      .from("organization")
      .insert({
        name: orgName,
        email: adminEmail,
        owner_id: userId,
      })
      .select()
      .single();

    // error message for org creation
    if (orgError || !orgData) {
      alert("Failed to create organization: " + orgError?.message);
      return;
    }

    // inserts admin into employee table with their pin and approved status
    const { error } = await supabase.from("employee").insert({
      employee_id: userId,
      name: adminName,
      email: adminEmail,
      pin: pin,
      role: "admin",
      status: "approved",
      organization_id: orgData.org_id,
    });
    
    // error message for employee creation
    if (error) {
      alert("Failed to create admin account: " + error.message);
      return;
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
        placeholder="Admin Full Name"
        value={adminName}
        onChange={(e) => setAdminName(e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Admin Email"
        type="Email"
        value={adminEmail}
        onChange={(e) => setAdminEmail(e.target.value)}
      />
      <input
        className="form-control mb-3"
        type="password"
        maxLength={6}
        inputMode="numeric"
        placeholder="6-digit PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleCreateOrg}>
        Create Organization
      </button>
    </div>
  );
};

export default CreateOrg;
