import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, MessageCircle, XCircle } from 'lucide-react';
import TripChat from '../components/TripChat'; // Make sure you created this file!

export default function RenterDashboard({ user }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null); // Stores the Booking ID of open chat

  useEffect(() => {
    const fetchTrips = async () => {
      if(!user?._id) return;
      try {
        // Use the Smart Route we made earlier
        const res = await fetch(`http://localhost:5000/api/bookings/${user._id}`);
        const data = await res.json();
        
        // Filter only trips where I am the RENTER
        const myTrips = data.filter(t => t.renterId === user._id);
        setTrips(myTrips);
        setLoading(false);
      } catch (e) { console.error("Error fetching trips"); }
    };
    fetchTrips();
  }, [user]);

  if (loading) return <div className="text-white text-center mt-20 animate-pulse">Loading your journeys...</div>;

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        <h1 className="text-4xl font-bold mb-2">My Journeys</h1>
        <p className="text-gray-400 mb-10">Track your rides and chat with drivers.</p>

        {trips.length === 0 ? (
           <div className="text-center py-20 bg-dark rounded-xl border border-white/10">
              <h3 className="text-xl font-bold text-gray-400">No trips booked yet.</h3>
              <p className="text-gray-500 mt-2">Go to the marketplace to request a ride.</p>
           </div>
        ) : (
          <div className="space-y-6">
            {trips.map(trip => (
              <div key={trip._id} className="bg-dark p-6 rounded-xl border border-white/10 relative overflow-hidden transition hover:border-white/30">
                
                {/* STATUS BADGE */}
                <div className={`absolute top-0 right-0 px-4 py-1.5 text-xs font-bold uppercase tracking-wide
                    ${trip.status === 'confirmed' ? 'bg-green-500 text-black' : 
                      trip.status === 'rejected' ? 'bg-red-500 text-white' : 
                      'bg-yellow-500 text-black'}`}>
                    {trip.status === 'confirmed' ? 'RIDE ACCEPTED' : 
                     trip.status === 'rejected' ? 'DECLINED' : 'WAITING FOR DRIVER'}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                   {/* CAR INFO */}
                   <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-1">{trip.carName}</h2>
                      <p className="text-gray-400 text-sm mb-4">Trip ID: #{trip._id.slice(-6)}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                         <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-blue-400"/> 
                            {trip.dates?.start} <span className="text-gray-600">to</span> {trip.dates?.end}
                         </div>
                         <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-red-400"/> 
                            {trip.distanceKm} km trip
                         </div>
                      </div>

                      {/* CHAT BUTTON (Only shows if Confirmed) */}
                      {trip.status === 'confirmed' && (
                        <button 
                            onClick={() => setActiveChat(trip._id)}
                            className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition"
                        >
                            <MessageCircle size={18} /> Chat with Driver
                        </button>
                      )}
                   </div>

                   {/* PRICE INFO */}
                   <div className="flex flex-col items-end justify-center border-l border-white/10 pl-6 min-w-[150px]">
                      <span className="text-gray-500 text-xs uppercase mb-1">Total Paid</span>
                      <span className="text-3xl font-bold text-white">₹{trip.totalPrice}</span>
                   </div>
                </div>

                {/* REJECTION MESSAGE */}
                {trip.status === 'rejected' && (
                    <div className="mt-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                        <XCircle size={16} /> Driver unavailable. Refund initiated.
                    </div>
                )}

              </div>
            ))}
          </div>
        )}
        
        {/* CHAT MODAL POPUP */}
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