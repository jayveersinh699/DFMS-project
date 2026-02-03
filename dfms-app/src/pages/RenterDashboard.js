import React, { useState, useEffect } from 'react';

export default function RenterDashboard({ user }) {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    if(user?._id) fetch(`http://localhost:5000/api/bookings/renter/${user._id}`).then(res => res.json()).then(setTrips);
  }, [user]);

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8">My Trips</h2>
        {trips.length === 0 ? <p className="text-gray">No trips yet.</p> : trips.map(trip => (
          <div key={trip._id} className="bg-dark p-6 rounded-xl border border-white/5 flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold">{trip.carName}</h3>
              <p className="text-gray text-sm">{trip.dates.start} → {trip.dates.end}</p>
            </div>
            <span className="font-bold uppercase">{trip.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}