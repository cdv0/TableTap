import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const AdminRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  // fetches user data that has a status of pending from supabase
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("employee")
      .select("*")
      .eq("status", "pending");

    if (!error) setRequests(data || []);
  };

  // handle approval button, admin give employee a 4 digit PIN
  const handleApprove = async (id: string) => {
    const pin = prompt("Assign a 4-digit PIN:");
    if (!pin || pin.length !== 4) return alert("Invalid PIN");

    // update status to approved and pin number in supabase
    const { error } = await supabase
      .from("employee")
      .update({ status: "approved", pin })
      .eq("employee_id", id);

    if (!error) fetchRequests();
  };

  // handle reject button, changes status to rejected
  const handleReject = async (id: string) => {
    await supabase
      .from("employee")
      .update({ status: "rejected" })
      .eq("employee_id", id);
    fetchRequests();
  };

  return (
    <div>
        <Navbar heading="Requests" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}></Navbar>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}></Sidebar>
        <div className="container mt-4">
        <h2>Pending Requests</h2>
        {requests.length === 0 && <p>No pending requests.</p>}
        {requests.map((req) => (
            <div key={req.employee_id} className="card p-3 mb-3 shadow-sm">
            <p><strong>{req.name}</strong> — {req.email}</p>
            <div>
                <button
                className="btn btn-success me-2"
                onClick={() => handleApprove(req.employee_id)}
                >
                Approve
                </button>
                <button
                className="btn btn-danger"
                onClick={() => handleReject(req.employee_id)}
                >
                Reject
                </button>
            </div>
            </div>
        ))}
        </div>
    </div>
  );
};

export default AdminRequests;
