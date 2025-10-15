import { Routes, Route } from "react-router-dom";
import Login from "../shared/pages/Login";
import Signup from "../shared/pages/Signup";
import CreateOrg from "../restaurant/pages/CreateOrg";

export function SharedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/create-org" element={<CreateOrg />} />
    </Routes>
  );
}

