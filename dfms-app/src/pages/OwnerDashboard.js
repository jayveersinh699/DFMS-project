import React, { useState, useEffect, useCallback } from 'react';
import { Check, X } from 'lucide-react'; 
import { toast } from 'react-hot-toast';

export default function OwnerDashboard({ user, cars, addCar }) {
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet' or 'requests'
  const [requests, setRequests] = useState([]);
  
  // FORM STATE
  const [formData, setFormData] = useState({ 
    brand: '', name: '', type: 'Sedan', price: '', pricePerKm: '', fuel: 'Petrol', carNumber: '', photo: null 
  });

  // FETCH REQUESTS (Wrapped in useCallback to fix warning)
  const fetchRequests = useCallback(async () => {
    if(!user?._id) return;
    try {
        const res = await fetch(`http://localhost:5000/api/bookings/${user._id}`);
        const data = await res.json();
        // Filter only requests for MY cars (where I am owner)
        const myRequests = data.filter(b => b.ownerId === user._id);
        setRequests(myRequests);
    } catch(e) { console.error("Error fetching requests"); }
  }, [user]);

  // USE EFFECT
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
      const toastId = toast.loading("Updating...");
      try {
          const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
          });
          if(res.ok) {
              toast.success(`Ride ${newStatus}`, { id: toastId });
              fetchRequests(); // Refresh list
          }
      } catch(e) { toast.error("Error", { id: toastId }); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addCar({ ...formData, ownerId: user._id, ownerName: user.name });
  };

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-bold">Driver Dashboard</h1>
            <p className="text-gray-400">Manage your fleet and incoming ride requests.</p>
          </div>
          
          {/* TABS */}
          <div className="flex bg-white/10 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('fleet')}
                className={`px-6 py-2 rounded-md font-bold transition ${activeTab === 'fleet' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
              >
                My Fleet
              </button>
              <button 
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-2 rounded-md font-bold transition flex items-center gap-2 ${activeTab === 'requests' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
              >
                Ride Requests 
                {requests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {requests.filter(r => r.status === 'pending').length}
                    </span>
                )}
              </button>
          </div>
        </div>

        {/* --- VIEW 1: MY FLEET (Add Cars) --- */}
        {activeTab === 'fleet' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* ADD CAR FORM */}
            <div className="bg-dark p-8 rounded-xl border border-white/10 h-fit">
                <h2 className="text-2xl font-bold mb-6">List a Vehicle</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Brand (e.g. Toyota)" required className="bg-input p-3 rounded-lg" onChange={e => setFormData({...formData, brand: e.target.value})} />
                    <input placeholder="Model (e.g. Innova)" required className="bg-input p-3 rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <select className="bg-input p-3 rounded-lg text-gray" onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option>Sedan</option><option>SUV</option><option>Luxury</option>
                    </select>
                    <select className="bg-input p-3 rounded-lg text-gray" onChange={e => setFormData({...formData, fuel: e.target.value})}>
                    <option>Petrol</option><option>Diesel</option><option>Electric</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Daily Labor (₹)" required className="bg-input p-3 rounded-lg" onChange={e => setFormData({...formData, price: e.target.value})} />
                    <input type="number" placeholder="Fuel Charge (₹/km)" required className="bg-input p-3 rounded-lg" onChange={e => setFormData({...formData, pricePerKm: e.target.value})} />
                </div>

                <input placeholder="Car Number (GJ-01-XX-1234)" required className="w-full bg-input p-3 rounded-lg" onChange={e => setFormData({...formData, carNumber: e.target.value})} />
                
                <div className="border-2 border-dashed border-white/20 p-6 rounded-lg text-center cursor-pointer hover:border-white transition relative">
                    <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFormData({...formData, photo: e.target.files[0]})} />
                    <p className="text-gray">Click to upload car photo</p>
                </div>

                <button className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition">List Vehicle</button>
                </form>
            </div>

            {/* MY CARS LIST */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Your Active Vehicles</h2>
                {cars.filter(c => c.ownerId === user._id).map(car => (
                <div key={car._id} className="flex gap-4 bg-dark p-4 rounded-xl border border-white/10 items-center">
                    <img src={car.photo} className="w-24 h-24 object-cover rounded-lg" alt="car" />
                    <div>
                    <h3 className="font-bold text-xl">{car.brand} {car.name}</h3>
                    <p className="text-gray text-sm">{car.type} • {car.fuel}</p>
                    <p className="text-green-400 font-bold mt-1">₹{car.price}/day + ₹{car.pricePerKm}/km</p>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* --- VIEW 2: RIDE REQUESTS (Accept/Reject) --- */}
        {activeTab === 'requests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.length === 0 ? (
                    <p className="text-gray text-center col-span-3 mt-10">No ride requests yet.</p>
                ) : (
                    requests.map(req => (
                        <div key={req._id} className="bg-dark p-6 rounded-xl border border-white/10 relative overflow-hidden">
                            {/* STATUS BADGE */}
                            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold uppercase 
                                ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                                  req.status === 'confirmed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                {req.status}
                            </div>

                            <h3 className="font-bold text-lg mb-1">{req.carName}</h3>
                            <p className="text-gray-400 text-sm mb-4">Trip ID: #{req._id.slice(-6)}</p>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray">Distance</span>
                                    <span>{req.distanceKm} km</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray">Dates</span>
                                    <span>{req.dates?.start} to {req.dates?.end}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2 mt-2">
                                    <span>Total Earnings</span>
                                    <span className="text-green-400">₹{req.totalPrice}</span>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            {req.status === 'pending' && (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleStatusUpdate(req._id, 'rejected')}
                                        className="flex-1 bg-red-500/10 text-red-500 border border-red-500/50 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-2"
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(req._id, 'confirmed')}
                                        className="flex-1 bg-green-500 text-black py-2 rounded-lg font-bold hover:bg-green-400 transition flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} /> Accept
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        )}

      </div>
    </div>
  );
}