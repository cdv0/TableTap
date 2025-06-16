import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const handleSubmit = (value: string) => {
    console.log('User entered: ', value);

  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login onSubmit={handleSubmit} />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
