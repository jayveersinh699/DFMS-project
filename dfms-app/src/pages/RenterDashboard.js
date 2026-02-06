import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, MessageCircle, XCircle, ShieldCheck, Key } from 'lucide-react';
import TripChat from '../components/TripChat';

export default function RenterDashboard({ user }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  const fetchTrips = async () => {
    if(!user?._id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${user._id}`);
      const data = await res.json();
      const myTrips = data.filter(t => t.renterId === user._id);
      setTrips(myTrips);
      setLoading(false);
    } catch (e) { console.error("Error fetching trips"); }
  };

  useEffect(() => {
    fetchTrips();
    // Optional: Poll every 10 seconds to catch when driver starts trip/generates OTP
    const interval = setInterval(fetchTrips, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) return <div className="text-white text-center mt-20 animate-pulse">Loading your journeys...</div>;

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        <h1 className="text-4xl font-bold mb-2">My Journeys</h1>
        <p className="text-gray-400 mb-10">Track your rides, view your security OTP, and chat with drivers.</p>

        {trips.length === 0 ? (
           <div className="text-center py-20 bg-zinc-900 rounded-xl border border-white/10">
              <h3 className="text-xl font-bold text-gray-400">No trips booked yet.</h3>
           </div>
        ) : (
          <div className="space-y-6">
            {trips.map(trip => (
              <div key={trip._id} className="bg-zinc-900 p-6 rounded-xl border border-white/10 relative overflow-hidden transition hover:border-white/30 shadow-xl">
                
                {/* STATUS BADGE */}
                <div className={`absolute top-0 right-0 px-4 py-1.5 text-xs font-bold uppercase tracking-wide
                    ${trip.status === 'confirmed' ? 'bg-green-500 text-black' : 
                      trip.status === 'ongoing' ? 'bg-blue-500 text-white' :
                      trip.status === 'completed' ? 'bg-zinc-700 text-white' :
                      trip.status === 'rejected' ? 'bg-red-500 text-white' : 
                      'bg-yellow-500 text-black'}`}>
                    {trip.status === 'ongoing' ? 'Trip in Progress' : 
                     trip.status === 'confirmed' ? 'Ride Accepted' : 
                     trip.status === 'completed' ? 'Finished' :
                     trip.status === 'rejected' ? 'Declined' : 'Awaiting Driver'}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                   <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-1">{trip.carName}</h2>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-gray-400 text-xs">Trip ID: #{trip._id.slice(-6)}</span>
                        {trip.paymentStatus === 'escrow' && (
                            <span className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                                <ShieldCheck size={10}/> Payment Held in Escrow
                            </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                         <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-blue-400"/> 
                            {trip.dates?.start} - {trip.dates?.end}
                         </div>
                         <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-red-400"/> 
                            {trip.distanceKm} km
                         </div>
                      </div>

                      {/* OTP DISPLAY - Shown only when trip is ongoing */}
                      {trip.status === 'ongoing' && trip.otp && (
                        <div className="mt-6 p-4 bg-white/5 border border-dashed border-white/20 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                                    <Key size={12}/> Security Completion OTP
                                </p>
                                <p className="text-2xl font-mono font-bold tracking-[0.2em] text-white">{trip.otp}</p>
                            </div>
                            <p className="text-[10px] text-gray-500 max-w-[150px] text-right">
                                Share this code with the driver only when the ride is finished.
                            </p>
                        </div>
                      )}

                      {/* CHAT BUTTON */}
                      {(trip.status === 'confirmed' || trip.status === 'ongoing') && (
                        <button 
                            onClick={() => setActiveChat(trip._id)}
                            className="mt-6 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition"
                        >
                            <MessageCircle size={18} /> Message Driver
                        </button>
                      )}
                   </div>

                   <div className="flex flex-col items-end justify-center border-l border-white/10 pl-6 min-w-[150px]">
                      <span className="text-gray-500 text-xs uppercase mb-1">Total Paid</span>
                      <span className="text-3xl font-bold text-white">₹{trip.totalPrice}</span>
                   </div>
                </div>

                {trip.status === 'rejected' && (
                    <div className="mt-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                        <XCircle size={16} /> Driver unavailable. Refund initiated to your original payment method.
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {activeChat && (
            <TripChat 
                bookingId={activeChat} 
                currentUser={user} 
                onClose={() => setActiveChat(null)} 
            />
        )}
      </div>
    </div>
  );
}