import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, MapPin } from 'lucide-react';

export default function Home({ onAuthClick }) {
  return (
    <div className="bg-black text-white min-h-screen font-sans">
      
      {/* HERO SECTION */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" 
            alt="Luxury Car" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl px-6 animate-fade-in-up">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6">
            RIDE <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">PREMIUM</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 font-light">
            Experience the future of mobility. Travel in our top-tier vehicles or list your own fleet today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* FIXED: Links to the Renter Marketplace */}
            <Link 
              to="/renter" 
              className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              See Prices <ArrowRight className="h-5 w-5" />
            </Link>
            
            <button 
              onClick={() => onAuthClick(true)} // Opens Register Modal
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition"
            >
              Become a Host
            </button>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8 bg-dark rounded-2xl border border-white/5 hover:border-white/20 transition duration-300">
                <Shield className="h-12 w-12 text-white mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-3">Secure & Insured</h3>
                <p className="text-gray">Every trip is covered by our comprehensive insurance policy for peace of mind.</p>
            </div>
            <div className="p-8 bg-dark rounded-2xl border border-white/5 hover:border-white/20 transition duration-300">
                <Clock className="h-12 w-12 text-white mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-3">Instant Booking</h3>
                <p className="text-gray">No waiting. Verified drivers can book cars instantly with zero paperwork.</p>
            </div>
            <div className="p-8 bg-dark rounded-2xl border border-white/5 hover:border-white/20 transition duration-300">
                <MapPin className="h-12 w-12 text-white mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-3">Anywhere Delivery</h3>
                <p className="text-gray">Get your car delivered to your doorstep, airport, or office location.</p>
            </div>
        </div>
      </div>

    </div>
  );
}