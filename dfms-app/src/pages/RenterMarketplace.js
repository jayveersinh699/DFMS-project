import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, Settings, User } from 'lucide-react'; // Icons

export default function RenterMarketplace({ cars, user, onAuthClick, setRedirectPath }) {
  const navigate = useNavigate();

  const handleBookClick = (carId) => {
    if (user) {
      // If logged in, go straight to booking
      navigate(`/checkout/${carId}`);
    } else {
      // If NOT logged in:
      // 1. Remember which car they wanted
      setRedirectPath(`/checkout/${carId}`);
      // 2. Open the Login/Register Modal
      onAuthClick(false); // false = Open Login mode, true = Register
    }
  };

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold mb-4">Choose Your Ride</h2>
          <p className="text-gray text-lg">Select from our premium fleet of vehicles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map(car => (
            <div key={car._id} className="bg-dark rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition duration-300 group">
              
              {/* Image */}
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={car.photo} 
                  alt={car.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                  {car.type}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{car.brand} {car.name}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray">
                      <span className="flex items-center gap-1"><Fuel size={14}/> {car.fuel}</span>
                      <span className="flex items-center gap-1"><Settings size={14}/> Auto</span>
                      <span className="flex items-center gap-1"><User size={14}/> 4 Seats</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹{car.price}</p>
                    <p className="text-xs text-gray">per day</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray mb-6 border-t border-white/10 pt-4">
                   <span>+ ₹{car.pricePerKm || 10} / km</span>
                   <span className="text-green-400">Available Today</span>
                </div>

                {/* THE SMART BUTTON */}
                <button 
                  onClick={() => handleBookClick(car._id)}
                  className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition"
                >
                  Book Now
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}