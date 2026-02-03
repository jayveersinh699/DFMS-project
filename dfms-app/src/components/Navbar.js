import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onAuthClick, onLogout }) {
  return (
    <nav className="bg-black text-white h-16 flex items-center border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight">DFMS</Link>
        <div className="flex items-center gap-6">
          {!user ? (
            <div className="flex items-center gap-4">
               {/* Login: Pass FALSE */}
               <button onClick={() => onAuthClick(false)} className="bg-white text-black px-4 py-2 rounded-full font-medium">Log in</button>
               {/* Sign Up: Pass TRUE */}
               <button onClick={() => onAuthClick(true)} className="bg-black text-white px-4 py-2 rounded-full border border-white/20">Sign up</button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <span className="hidden md:block">{user.name}</span>
              {user.role === 'owner' ? (
                <Link to="/owner" className="hover:text-gray-300">Dashboard</Link>
              ) : (
                <>
                  <Link to="/renter" className="hover:text-gray-300">Book</Link>
                  <Link to="/renter/trips" className="hover:text-gray-300">My Rides</Link>
                </>
              )}
              <button onClick={onLogout} className="bg-white/10 px-4 py-2 rounded-full">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}