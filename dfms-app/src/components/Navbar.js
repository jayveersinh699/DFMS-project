import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react'; // Import shield icon

export default function Navbar({ user, onAuthClick, onLogout }) {
  return (
    <nav className="bg-black text-white h-16 flex items-center border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="text-2xl font-bold tracking-tight flex items-center gap-2">
          DFMS {user?.role === 'admin' && <span className="text-xs bg-red-600 px-2 py-0.5 rounded text-white font-mono">ADMIN</span>}
        </Link>

        {/* MENU */}
        <div className="flex items-center gap-6">
          {!user ? (
            <div className="flex items-center gap-4">
               <button onClick={() => onAuthClick(false)} className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition">Log in</button>
               <button onClick={() => onAuthClick(true)} className="bg-black text-white px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition">Sign up</button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium hidden md:block text-gray-400">
                {user.role === 'admin' ? 'System Administrator' : user.name}
              </span>
              
              {/* --- ROLE BASED LINKS --- */}
              
              {/* 1. ADMIN MENU */}
              {user.role === 'admin' && (
                 <Link to="/admin" className="text-red-500 hover:text-red-400 font-bold flex items-center gap-2">
                    <ShieldAlert size={18} /> Master Control
                 </Link>
              )}

              {/* 2. OWNER MENU */}
              {user.role === 'owner' && (
                <Link to="/owner" className="hover:text-gray-300 font-medium">Dashboard</Link>
              )}

              {/* 3. RENTER MENU (Only show if NOT admin and NOT owner) */}
              {user.role === 'renter' && (
                <>
                  <Link to="/renter" className="hover:text-gray-300 font-medium">Book</Link>
                  <Link to="/renter/trips" className="hover:text-gray-300 font-medium">My Rides</Link>
                </>
              )}

              <button 
                onClick={onLogout}
                className="bg-white/10 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 hover:text-white transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}