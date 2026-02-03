import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast'; 
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import AnimatedRoutes from './AnimatedRoutes'; 

function App() {
  const [user, setUser] = useState(null); 
  const [showLogin, setShowLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false); 
  const [cars, setCars] = useState([]);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('dfms_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchCars(); 
  }, []);

  const fetchCars = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/cars');
      setCars(await res.json());
    } catch (e) { console.error("API Error"); }
  };

  const handleAuthClick = (isRegisterMode) => {
    setOpenRegister(isRegisterMode);
    setShowLogin(true);
  };

  // --- UPDATED SECURE LOGIN FUNCTION ---
  const handleLogin = async (userData) => {
    const toastId = toast.loading('Processing...');

    // We no longer check for 'admin123' here. 
    // We send the data to the backend, and IT tells us if we are admin.
    const endpoint = userData.isRegister ? 'register' : 'login';
    
    try {
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || `Welcome ${data.user.name}`, { id: toastId });
        
        setUser(data.user);
        localStorage.setItem('dfms_user', JSON.stringify(data.user)); 
        setShowLogin(false);
        
        // CHECK ROLE FROM BACKEND RESPONSE
        if (data.user.role === 'admin') {
            window.location.href = '/admin'; // Redirects Admin
        } 
        else if (redirectPath && data.user.role === 'renter') {
           window.location.href = redirectPath; 
           setRedirectPath(null);
        } else {
           window.location.href = data.user.role === 'owner' ? '/owner' : '/renter';
        }

      } else {
        toast.error(data.message, { id: toastId });
      }
    } catch (error) {
      toast.error('Server unavailable', { id: toastId });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('dfms_user');
    window.location.href = '/';
  };

  const addCar = async (carData) => {
    const formData = new FormData();
    formData.append('photo', carData.photo);
    Object.keys(carData).forEach(key => { if(key!=='photo') formData.append(key, carData[key]) });
    const res = await fetch('http://localhost:5000/api/cars', { method: 'POST', body: formData });
    if(res.ok) { fetchCars(); toast.success('Car Listed!'); }
  };

  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ style: { background: '#121212', color: '#fff' } }} />
      <Navbar user={user} onAuthClick={handleAuthClick} onLogout={handleLogout} />
      
      <AnimatedRoutes 
        user={user} 
        cars={cars} 
        addCar={addCar} 
        handleAuthClick={handleAuthClick} 
        setRedirectPath={setRedirectPath}
      />
      
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} initialMode={openRegister} />}
    </Router>
  );
}
export default App;