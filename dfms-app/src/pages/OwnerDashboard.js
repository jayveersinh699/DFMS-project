import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react'; 

export default function OwnerDashboard({ user, cars, addCar }) {
  // Added pricePerKm to initial state
  const [form, setForm] = useState({ name: '', brand: '', type: 'Sedan', fuel: 'Petrol', price: '', pricePerKm: '', carNumber: '', driverProvided: 'no', fuelPolicy: 'excluded' });
  const [file, setFile] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if(user?._id) {
      fetch(`http://localhost:5000/api/bookings/owner/${user._id}`)
        .then(res => res.json()).then(data => setRequests(data));
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!file) return alert("Photo required");
    // Send both price (Daily) and pricePerKm (Distance)
    addCar({ ...form, photo: file, ownerId: user._id, ownerName: user.name });
  };

  const handleAction = async (id, status) => {
    await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status })
    });
    setRequests(requests.map(r => r._id === id ? {...r, status} : r));
  };

  const deleteCar = async (carId) => {
    if(!window.confirm("Are you sure you want to remove this car?")) return;
    const res = await fetch(`http://localhost:5000/api/cars/${carId}`, { method: 'DELETE' });
    if(res.ok) { window.location.reload(); }
  };

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT: ADD CAR FORM */}
        <div className="lg:col-span-1">
          <div className="bg-dark p-6 rounded-xl sticky top-24 border border-white/10">
            <h2 className="text-2xl font-bold mb-6">List a Vehicle</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Brand (e.g. Toyota)" className="w-full bg-input p-3 rounded-lg text-white" onChange={e => setForm({...form, brand: e.target.value})} required />
              <input placeholder="Model (e.g. Camry)" className="w-full bg-input p-3 rounded-lg text-white" onChange={e => setForm({...form, name: e.target.value})} required />
              <input placeholder="License Plate" className="w-full bg-input p-3 rounded-lg text-white" onChange={e => setForm({...form, carNumber: e.target.value})} required />
              
              {/* NEW PRICING SECTION */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray uppercase">Driver Daily Rate</label>
                  <input type="number" placeholder="₹ per Day" className="w-full bg-input p-3 rounded-lg text-white mt-1" onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
                <div>
                  <label className="text-xs text-gray uppercase">Company Km Rate</label>
                  <input type="number" placeholder="₹ per Km" className="w-full bg-input p-3 rounded-lg text-white mt-1" onChange={e => setForm({...form, pricePerKm: e.target.value})} required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <select className="bg-input p-3 rounded-lg text-white" onChange={e => setForm({...form, type: e.target.value})}>
                    <option>Sedan</option><option>SUV</option><option>Hatchback</option>
                 </select>
                 <select className="bg-input p-3 rounded-lg text-white" onChange={e => setForm({...form, fuel: e.target.value})}>
                    <option>Petrol</option><option>Diesel</option><option>EV</option>
                 </select>
              </div>

               <div className="grid grid-cols-2 gap-4">
                 <select className="bg-input p-3 rounded-lg text-white" onChange={e => setForm({...form, driverProvided: e.target.value})}>
                    <option value="no">Self Drive</option><option value="yes">Driver Provided</option>
                 </select>
                 <select className="bg-input p-3 rounded-lg text-white" onChange={e => setForm({...form, fuelPolicy: e.target.value})}>
                    <option value="excluded">Renter Pays Fuel</option><option value="included">Free Fuel</option>
                 </select>
              </div>

              <input type="file" className="text-sm text-gray" onChange={e => setFile(e.target.files[0])} required />

              <button className="w-full bg-white text-black font-bold py-3 rounded-lg mt-4 hover:bg-gray-200">
                Submit Listing
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: LISTINGS */}
        <div className="lg:col-span-2 space-y-12">
          {/* Requests Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Ride Requests</h2>
            <div className="space-y-4">
              {requests.length === 0 ? <p className="text-gray">No requests yet.</p> : requests.map(req => (
                <div key={req._id} className="bg-dark p-6 rounded-xl flex justify-between items-center border border-white/5">
                  <div>
                    <h4 className="font-bold text-lg">{req.carName}</h4>
                    <p className="text-gray text-sm">{req.dates.start} to {req.dates.end}</p>
                    <p className="text-white font-bold mt-1">₹{req.totalPrice} Total Earnings</p>
                  </div>
                  {req.status === 'pending' ? (
                    <div className="flex gap-3">
                      <button onClick={() => handleAction(req._id, 'confirmed')} className="bg-white text-black px-4 py-2 rounded-lg font-bold">Accept</button>
                      <button onClick={() => handleAction(req._id, 'rejected')} className="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg font-bold">Reject</button>
                    </div>
                  ) : (
                    <span className="px-4 py-2 rounded-lg font-bold text-sm bg-white/10">{req.status.toUpperCase()}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Cars Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Your Fleet</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {cars.filter(c => c.ownerId === user._id).map(car => (
                <div key={car._id} className="bg-dark rounded-xl overflow-hidden relative group border border-white/5">
                  <div className="h-40 bg-gray-800">
                     <img src={car.photo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold">{car.name}</h4>
                            <p className="text-gray text-sm">{car.carNumber}</p>
                        </div>
                        <button onClick={() => deleteCar(car._id)} className="text-gray hover:text-red-500 transition"><Trash2 className="h-5 w-5" /></button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-sm">
                        <span>Daily: <span className="text-white font-bold">₹{car.price}</span></span>
                        <span>Km: <span className="text-white font-bold">₹{car.pricePerKm || 10}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}