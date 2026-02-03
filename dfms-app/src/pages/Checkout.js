import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';

// Leaflet Icons Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function SearchField() {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider, style: 'bar', showMarker: false, retainZoomLevel: false, animateZoom: true, autoClose: true, searchLabel: 'Search location...',
    });
    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);
  return null;
}

export default function Checkout({ cars, user }) {
  const { carId } = useParams();
  const navigate = useNavigate();
  const car = cars.find(c => c._id === carId);
  
  const [dates, setDates] = useState({ start: '', end: '' });
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [distanceKm, setDistanceKm] = useState(0);
  
  // FAKE PAYMENT STATE
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  function LocationMarker() {
    useMapEvents({
      click(e) {
        if (!pickup) setPickup(e.latlng);
        else if (!dropoff) setDropoff(e.latlng);
        else { setPickup(e.latlng); setDropoff(null); setDistanceKm(0); }
      },
    });
    return null;
  }

  useEffect(() => {
    if (pickup && dropoff) {
      const dist = L.latLng(pickup).distanceTo(dropoff) / 1000; 
      setDistanceKm(Math.round(dist * 10) / 10);
    }
  }, [pickup, dropoff]);

  if(!car) return <div className="text-white text-center mt-20">Car not found.</div>;

  const calculateDays = () => {
    if(!dates.start || !dates.end) return 0;
    const diff = new Date(dates.end) - new Date(dates.start);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1; 
  }

  const days = calculateDays();
  const driverCost = days * car.price;
  const companyCost = distanceKm * (car.pricePerKm || 10);
  const totalCost = driverCost + companyCost;

  const handleConfirm = async () => {
    // 1. VALIDATIONS
    if(!days) return alert("Please select Start and End dates");
    if(!distanceKm) return alert("Please click the map to set Pickup and Dropoff points");
    
    // 2. FAKE PAYMENT VALIDATION
    if(card.number.length < 16 || !card.expiry || !card.cvv) return alert("Please enter valid card details");

    setIsProcessing(true);

    // 3. SIMULATE NETWORK DELAY (2 Seconds)
    setTimeout(async () => {
        const bookingData = {
          carId: car._id, carName: car.name, renterId: user._id, ownerId: car.ownerId,
          dates, distanceKm, totalPrice: totalCost, status: 'pending'
        };

        try {
          const res = await fetch('http://localhost:5000/api/bookings/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
          });
          
          if(res.ok) {
            alert("Payment Successful! Ride Requested.");
            navigate('/renter/trips');
          } else {
            alert("Booking Failed.");
            setIsProcessing(false);
          }
        } catch (err) { alert("Server Error"); setIsProcessing(false); }
    }, 2000);
  };

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT: MAP */}
        <div className="space-y-6">
           <h1 className="text-3xl font-bold">{car.brand} {car.name}</h1>
           <div className="h-[500px] w-full rounded-xl overflow-hidden border border-white/20 relative z-0">
             <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <SearchField />
                <LocationMarker />
                {pickup && <Marker position={pickup} />}
                {dropoff && <Marker position={dropoff} />}
                {pickup && dropoff && <Polyline positions={[pickup, dropoff]} color="blue" />}
             </MapContainer>
             <div className="absolute top-4 right-4 z-[1000] bg-black/80 p-3 rounded-lg text-sm border border-white/20 text-right">
                <p>1. 🔍 Search City</p><p>2. Click <span className="text-blue-400">Pickup</span></p><p>3. Click <span className="text-red-400">Dropoff</span></p>
             </div>
           </div>
        </div>

        {/* RIGHT: BILLING & PAYMENT */}
        <div className="bg-dark p-8 rounded-xl h-fit sticky top-24 border border-white/10">
          <h2 className="text-2xl font-bold mb-6">Trip Summary</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div><label className="text-xs text-gray uppercase">Start</label><input type="date" className="w-full bg-input text-white p-3 rounded-lg mt-1" onChange={e => setDates({...dates, start: e.target.value})} /></div>
            <div><label className="text-xs text-gray uppercase">End</label><input type="date" className="w-full bg-input text-white p-3 rounded-lg mt-1" onChange={e => setDates({...dates, end: e.target.value})} /></div>
          </div>

          <div className="space-y-4 bg-black/30 p-4 rounded-lg mb-6">
             <div className="flex justify-between text-sm"><span className="text-gray">Driver Fee</span><span>₹{driverCost}</span></div>
             <div className="flex justify-between text-sm"><span className="text-gray">Company Fee ({distanceKm} km)</span><span>₹{Math.floor(companyCost)}</span></div>
             <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-xl"><span>Total</span><span>₹{Math.floor(totalCost)}</span></div>
          </div>

          {/* PAYMENT FORM (New Feature) */}
          <div className="bg-white/5 p-4 rounded-lg space-y-3 mb-6 border border-white/10">
            <h3 className="font-bold text-sm text-gray uppercase mb-2">Secure Payment</h3>
            <input 
              placeholder="Card Number" maxLength="16" 
              className="w-full bg-input text-white p-3 rounded-lg border border-white/10 focus:border-white transition"
              onChange={e => setCard({...card, number: e.target.value})}
            />
            <div className="flex gap-4">
                <input placeholder="MM/YY" className="w-full bg-input text-white p-3 rounded-lg border border-white/10" onChange={e => setCard({...card, expiry: e.target.value})} />
                <input placeholder="CVV" maxLength="3" className="w-full bg-input text-white p-3 rounded-lg border border-white/10" onChange={e => setCard({...card, cvv: e.target.value})} />
            </div>
            <input placeholder="Cardholder Name" className="w-full bg-input text-white p-3 rounded-lg border border-white/10" onChange={e => setCard({...card, name: e.target.value})} />
          </div>

          <button 
            onClick={handleConfirm} 
            disabled={isProcessing}
            className={`w-full font-bold py-4 rounded-lg mt-2 transition ${isProcessing ? 'bg-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${Math.floor(totalCost)}`}
          </button>
        </div>

      </div>
    </div>
  );
}