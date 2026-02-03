import React, { useState } from 'react';
import { X } from 'lucide-react'; 

export default function LoginModal({ onClose, onLogin, initialMode }) {
  // USE THE PROP TO SET INITIAL STATE
  const [isRegister, setIsRegister] = useState(initialMode);
  const [role, setRole] = useState('renter'); 
  const [formData, setFormData] = useState({ email: '', password: '', name: '', surname: '', phone: '', license: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ ...formData, role, isRegister }); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-md bg-dark rounded-xl shadow-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray hover:text-white"><X className="h-6 w-6" /></button>
        <div className="p-8">
          <h2 className="text-3xl font-bold text-white mb-2">{isRegister ? 'Sign up' : 'Log in'}</h2>
          
          <div className="grid grid-cols-2 gap-2 bg-input p-1 rounded-lg mb-6">
            <button onClick={() => setRole('renter')} className={`py-2 rounded-md font-bold ${role === 'renter' ? 'bg-white text-black' : 'text-gray'}`}>Rider</button>
            <button onClick={() => setRole('owner')} className={`py-2 rounded-md font-bold ${role === 'owner' ? 'bg-white text-black' : 'text-gray'}`}>Driver</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" required className="w-full bg-input text-white p-3 rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="text" placeholder="Last Name" className="w-full bg-input text-white p-3 rounded-lg" onChange={e => setFormData({...formData, surname: e.target.value})} />
              </div>
            )}
            <input type="email" placeholder="Email" required className="w-full bg-input text-white p-3 rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} />
            {isRegister && <input type="tel" placeholder="Mobile" required className="w-full bg-input text-white p-3 rounded-lg" onChange={e => setFormData({...formData, phone: e.target.value})} />}
            <input type="password" placeholder="Password" required className="w-full bg-input text-white p-3 rounded-lg" onChange={e => setFormData({...formData, password: e.target.value})} />
            
            <button className="w-full bg-white text-black font-bold py-4 rounded-lg mt-4">{isRegister ? 'Create Account' : 'Log in'}</button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button onClick={() => setIsRegister(!isRegister)} className="text-white underline">{isRegister ? 'Login instead' : 'Create an account'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}