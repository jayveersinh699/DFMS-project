import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, MessageCircle, Trash2, Play, Flag, Upload } from 'lucide-react'; 
import { toast } from 'react-hot-toast';
import TripChat from '../components/TripChat';

export default function OwnerDashboard({ user, cars, addCar }) {
  const [activeTab, setActiveTab] = useState('fleet');
  const [requests, setRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [qrCode, setQrCode] = useState(user?.qrCode || null);

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('qrCode', file);

    const toastId = toast.loading("Uploading QR Code...");
    try {
      const res = await fetch(`http://localhost:5000/api/auth/update-qr/${user._id}`, {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.qrCode);
        toast.success("QR Code saved!", { id: toastId });
      }
    } catch (e) { toast.error("Upload failed", { id: toastId }); }
  };
  // NEW: State for image preview
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({ 
    brand: '', name: '', type: 'Sedan', price: '', pricePerKm: '', fuel: 'Petrol', carNumber: '', photo: null 
  });

  const fetchRequests = useCallback(async () => {
    if(!user?._id) return;
    try {
        const res = await fetch(`http://localhost:5000/api/bookings/${user._id}`);
        const data = await res.json();
        const myRequests = data.filter(b => String(b.ownerId) === String(user._id));
        setRequests(myRequests);
    } catch(e) { console.error("Error fetching requests"); }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // NEW: Handle photo selection and preview
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setImagePreview(URL.createObjectURL(file)); // Create local URL for preview
    }
  };

  const handleStartTrip = async (bookingId) => {
    const toastId = toast.loading("Starting trip...");
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/start`, {
        method: 'PUT'
      });
      if(res.ok) {
        toast.success("Trip Started! Ask renter for OTP at the end.", { id: toastId });
        fetchRequests();
      }
    } catch(e) { toast.error("Error starting trip", { id: toastId }); }
  };

  const handleVerifyOTP = async (bookingId) => {
    const otpInput = document.getElementById(`otp-${bookingId}`).value;
    if(!otpInput) return toast.error("Please enter the OTP");

    const toastId = toast.loading("Verifying OTP...");
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpInput })
      });
      const data = await res.json();
      if(res.ok) {
        toast.success("Trip Completed! Payment released to you.", { id: toastId });
        fetchRequests();
      } else {
        toast.error(data.message || "Invalid OTP", { id: toastId });
      }
    } catch(e) { toast.error("Verification failed", { id: toastId }); }
  };

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
              fetchRequests();
          }
      } catch(e) { toast.error("Error", { id: toastId }); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addCar({ ...formData, ownerId: user._id, ownerName: user.name });
    setFormData({ ...formData, brand: '', name: '', carNumber: '', photo: null });
    setImagePreview(null); // Clear preview after submit
    toast.success("Car added successfully!");
  };

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-bold">Driver Dashboard</h1>
            <p className="text-gray-400">Manage your fleet and incoming ride requests.</p>
          </div>
          
          <div className="flex bg-white/10 p-1 rounded-lg">
              <button onClick={() => setActiveTab('fleet')} className={`px-6 py-2 rounded-md font-bold transition ${activeTab === 'fleet' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>My Fleet</button>
              <button onClick={() => setActiveTab('requests')} className={`px-6 py-2 rounded-md font-bold transition flex items-center gap-2 ${activeTab === 'requests' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>
                Ride Requests 
                {requests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.filter(r => r.status === 'pending').length}</span>
                )}
              </button>
          </div>
        </div>

        {activeTab === 'fleet' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-zinc-900 p-8 rounded-xl border border-white/10 h-fit">
                <h2 className="text-2xl font-bold mb-6">List a Vehicle</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <input placeholder="Brand" required className="bg-black border border-white/20 text-white p-3 rounded-lg" onChange={e => setFormData({...formData, brand: e.target.value})} value={formData.brand} />
                      <input placeholder="Model" required className="bg-black border border-white/20 text-white p-3 rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <select className="bg-black border border-white/20 text-white p-3 rounded-lg" onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option>Sedan</option><option>SUV</option><option>Luxury</option>
                      </select>
                      <select className="bg-black border border-white/20 text-white p-3 rounded-lg" onChange={e => setFormData({...formData, fuel: e.target.value})}>
                        <option>Petrol</option><option>Diesel</option><option>Electric</option>
                      </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <input type="number" placeholder="Daily Labor (₹)" required className="bg-black border border-white/20 text-white p-3 rounded-lg" onChange={e => setFormData({...formData, price: e.target.value})} />
                      <input type="number" placeholder="Fuel Charge (₹/km)" required className="bg-black border border-white/20 text-white p-3 rounded-lg" onChange={e => setFormData({...formData, pricePerKm: e.target.value})} />
                  </div>
                  <input placeholder="Car Number" required className="w-full bg-black border border-white/20 text-white p-3 rounded-lg" onChange={e => setFormData({...formData, carNumber: e.target.value})} value={formData.carNumber} />
                  
                  {/* UPDATED: Photo Upload with Preview */}
                  <div className="border-2 border-dashed border-white/20 p-6 rounded-lg text-center cursor-pointer hover:border-white transition relative h-40 flex items-center justify-center overflow-hidden">
                      <input type="file" required={!imagePreview} className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handlePhotoChange} />
                      {imagePreview ? (
                        <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Upload size={24} />
                          <p>Click to upload car photo</p>
                        </div>
                      )}
                  </div>

                  <button className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition">List Vehicle</button>
                </form>
            </div>
<div className="bg-zinc-900 p-8 rounded-xl border border-white/10">
                   <h2 className="text-xl font-bold mb-4">Payment QR Code</h2>
                   <p className="text-gray-400 text-sm mb-4">Upload your UPI QR code so renters can pay you directly via the platform.</p>
                   <div className="flex items-center gap-6">
                      <div className="w-32 h-32 bg-black border border-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                        {qrCode ? <img src={qrCode} className="w-full h-full object-contain" /> : <span className="text-xs text-gray-500">No QR</span>}
                      </div>
                      <input type="file" id="qrInput" hidden onChange={handleQrUpload} />
                      <button onClick={() => document.getElementById('qrInput').click()} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold transition">
                        Change QR
                      </button>
                   </div>
                </div>
        
            <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Your Active Vehicles</h2>
                {cars.filter(c => String(c.ownerId) === String(user._id)).map(car => (
                <div key={car._id} className="flex gap-4 bg-zinc-900 p-4 rounded-xl border border-white/10 items-center">
                    {/* UPDATED: Show car photo from database */}
                    {car.photo ? (
                        <img src={car.photo} className="w-24 h-24 object-cover rounded-lg" alt={car.name} />
                    ) : (
                        <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400">No Photo</div>
                    )}
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-xl">{car.brand} {car.name}</h3>
                            <button className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                        <p className="text-gray-400 text-sm">{car.type} • {car.fuel} • {car.carNumber}</p>
                        <p className="text-green-400 font-bold">₹{car.price}/day</p>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}
        {/* ... Rest of the component (requests tab, etc.) remains same */}
        {activeTab === 'requests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map(req => (
                    <div key={req._id} className="bg-zinc-900 p-6 rounded-xl border border-white/10 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold uppercase ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : req.status === 'ongoing' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>
                            {req.status}
                        </div>

                        <h3 className="font-bold text-lg">{req.carName}</h3>
                        <p className="text-gray-400 text-sm mb-4">Trip ID: #{req._id.slice(-6)}</p>

                        <div className="space-y-2 mb-6 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Dates</span><span>{req.dates?.start} to {req.dates?.end}</span></div>
                            <div className="flex justify-between font-bold border-t border-white/10 pt-2 mt-2"><span>Earnings</span><span className="text-green-400">₹{req.totalPrice}</span></div>
                        </div>

                        <div className="space-y-3">
                          {req.status === 'pending' && (
                              <div className="flex gap-2">
                                  <button onClick={() => handleStatusUpdate(req._id, 'rejected')} className="flex-1 bg-red-500/10 text-red-500 py-2 rounded-lg font-bold">Reject</button>
                                  <button onClick={() => handleStatusUpdate(req._id, 'confirmed')} className="flex-1 bg-green-500 text-black py-2 rounded-lg font-bold">Accept</button>
                              </div>
                          )}

                          {req.status === 'confirmed' && (
                              <>
                                <button onClick={() => handleStartTrip(req._id)} className="w-full bg-green-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2"><Play size={16}/> Start Trip</button>
                                <button onClick={() => setActiveChat(req._id)} className="w-full bg-blue-600/20 text-blue-400 py-2 rounded-lg font-bold flex items-center justify-center gap-2"><MessageCircle size={16}/> Chat</button>
                              </>
                          )}

                          {req.status === 'ongoing' && (
                              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                                  <p className="text-[10px] uppercase text-blue-400 font-bold mb-2 flex items-center gap-1"><Flag size={10}/> End Trip Verification</p>
                                  <div className="flex gap-2">
                                      <input id={`otp-${req._id}`} className="bg-black border border-white/20 p-2 rounded text-sm w-full" placeholder="Enter Renter OTP" />
                                      <button onClick={() => handleVerifyOTP(req._id)} className="bg-white text-black px-4 py-2 rounded font-bold text-sm">Finish</button>
                                  </div>
                              </div>
                          )}
                        </div>
                    </div>
                ))}
            </div>
        )}
        {activeChat && <TripChat bookingId={activeChat} currentUser={user} onClose={() => setActiveChat(null)} />}
      </div>
    </div>
  );
}