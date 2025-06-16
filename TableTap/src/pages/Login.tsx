import { useNavigate } from 'react-router-dom';
import Keypad from '../components/Keypad';

interface LoginProps {
  onSubmit: (value: string) => void;
}

const Login = ({ onSubmit }: LoginProps) => {
    const navigate = useNavigate();

    const handleLogin = (value: string) => {
        onSubmit(value);
        navigate('/dashboard'); // redirect to dashboard after login. add login to admin or employee logic here

    };

    return (
        <div className="d-flex justify-content-center align-items-center">
            <Keypad initialValue="" onSubmit={handleLogin} />
        </div>
    );
};

export default Login;
