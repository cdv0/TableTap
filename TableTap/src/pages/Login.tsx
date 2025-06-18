import { useNavigate } from "react-router-dom";
import Keypad from "../components/Keypad";
import Navbar from "../components/Navbar";

interface LoginProps {
  onSubmit: (value: string) => void;
}

const Login = ({ onSubmit }: LoginProps) => {
  const navigate = useNavigate();

  const handleLogin = (value: string) => {
    onSubmit(value);
    navigate("/admin-dashboard"); // redirect to dashboard after login. add login to admin or employee logic here
  };

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      <Navbar heading="Table Tap" />

      <div className="flex-grow-1 d-flex justify-content-center bg-light">
        <Keypad initialValue="" onSubmit={handleLogin} />
      </div>
    </div>
  );
};

export default Login;
