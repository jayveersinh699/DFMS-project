import React, { useState, useEffect } from 'react';
import { Trash2, UserX, ShieldAlert, Activity } from 'lucide-react'; 

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: [], cars: [], bookings: [] });
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, carsRes, bookingsRes] = await Promise.all([
           fetch('http://localhost:5000/api/admin/users'), 
           fetch('http://localhost:5000/api/cars'),
           fetch('http://localhost:5000/api/bookings/all') 
        ]);
        
        setStats({
            users: await usersRes.json(),
            cars: await carsRes.json(),
            bookings: await bookingsRes.json()
        });
        setLoading(false);
      } catch (e) { console.error("Admin Load Error"); }
    };
    fetchData();
  }, []);

  // DELETE USER FUNCTION
  const deleteUser = async (id) => {
    if(!window.confirm("⚠️ WARNING: This will permanently BAN this user and remove their access.")) return;
    
    try {
        await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: 'DELETE' });
        // Update UI immediately
        setStats(prev => ({ ...prev, users: prev.users.filter(u => u._id !== id) }));
        alert("User Banned Successfully");
    } catch(err) { alert("Failed to ban user"); }
  };

  // DELETE CAR FUNCTION
  const deleteCar = async (id) => {
    if(!window.confirm("⚠️ WARNING: Remove this vehicle listing from the platform?")) return;

    try {
        await fetch(`http://localhost:5000/api/cars/${id}`, { method: 'DELETE' });
        // Update UI immediately
        setStats(prev => ({ ...prev, cars: prev.cars.filter(c => c._id !== id) }));
        alert("Listing Removed");
    } catch(err) { alert("Failed to delete car"); }
  };

  if (loading) return <div className="text-white text-center mt-20 text-xl font-bold animate-pulse">Loading System Data...</div>;

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-10 border-b border-red-900/30 pb-6">
           <div className="flex items-center gap-4">
               <ShieldAlert className="h-16 w-16 text-red-600" />
               <div>
                 <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">MASTER CONTROL</h1>
                 <p className="text-gray-400 mt-1 flex items-center gap-2"><Activity size={16} className="text-green-500"/> System Online • Administrator Access Granted</p>
               </div>
           </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-white/10 hover:border-red-500/50 transition duration-300">
                <h3 className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">Total Users</h3>
                <p className="text-5xl font-bold text-white">{stats.users.length}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-white/10 hover:border-red-500/50 transition duration-300">
                <h3 className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">Active Fleet</h3>
                <p className="text-5xl font-bold text-white">{stats.cars.length}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-white/10 hover:border-red-500/50 transition duration-300">
                <h3 className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">Total Trips</h3>
                <p className="text-5xl font-bold text-white">{stats.bookings.length}</p>
            </div>
        </div>

        {/* MANAGEMENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* 1. USER MANAGER */}
            <section className="bg-dark p-8 rounded-2xl border border-white/10 h-[600px] flex flex-col">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                    <div className="bg-red-500/20 p-2 rounded-lg"><UserX className="text-red-500" /></div>
                    User Management
                </h2>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {stats.users.map(u => (
                        <div key={u._id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition group">
                            <div>
                                <p className="font-bold text-lg text-white group-hover:text-red-400 transition">{u.name}</p>
                                <p className="text-xs text-gray-400">{u.email}</p>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded mt-1 inline-block ${u.role==='admin' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}>{u.role}</span>
                            </div>
                            {u.email !== 'admin@dfms.com' && (
                                <button 
                                    onClick={() => deleteUser(u._id)} 
                                    className="bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                                >
                                    BAN USER
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. FLEET MANAGER */}
            <section className="bg-dark p-8 rounded-2xl border border-white/10 h-[600px] flex flex-col">
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                    <div className="bg-red-500/20 p-2 rounded-lg"><Trash2 className="text-red-500" /></div>
                    Fleet Control
                </h2>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {stats.cars.map(c => (
                        <div key={c._id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition">
                            <div className="flex items-center gap-4">
                                <img src={c.photo} className="w-16 h-16 rounded-lg object-cover bg-gray-800" alt="car"/>
                                <div>
                                    <p className="font-bold text-lg text-white">{c.brand} {c.name}</p>
                                    <p className="text-xs text-gray-400">Owner: {c.ownerName}</p>
                                    <p className="text-xs text-gray-500">{c.carNumber}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => deleteCar(c._id)} 
                                className="bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                            >
                                DELETE
                            </button>
                        </div>
                    ))}
                </div>
            </section>

        </div>
      </div>
    </div>
  );
}