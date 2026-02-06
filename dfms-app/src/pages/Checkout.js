import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, useMap, Popup } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';

// FIX ICONS
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
      provider, style: 'bar', showMarker: false, retainZoomLevel: false, animateZoom: true, autoClose: true, searchLabel: 'Search city or area...',
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
  
  // MAP STATE
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [routePath, setRoutePath] = useState([]); 
  const [distanceKm, setDistanceKm] = useState(0);
  const [addressNames, setAddressNames] = useState({ pickup: '', dropoff: '' });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const getAddressName = async (lat, lng, type) => {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const name = data.display_name.split(',')[0] + ', ' + data.display_name.split(',')[1];
        setAddressNames(prev => ({ ...prev, [type]: name }));
    } catch(e) { console.error("Address Error"); }
  };

  useEffect(() => {
      if(pickup && dropoff) {
          setIsLoadingRoute(true);
          const fetchRoute = async () => {
              try {
                  const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`;
                  const res = await fetch(url);
                  const data = await res.json();

                  if(data.routes && data.routes.length > 0) {
                      const route = data.routes[0];
                      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                      setRoutePath(coordinates);
                      setDistanceKm((route.distance / 1000).toFixed(1));
                  }
              } catch(e) { console.error("Routing Error"); }
              setIsLoadingRoute(false);
          };
          fetchRoute();
      }
  }, [pickup, dropoff]);
  
  function LocationMarker() {
    useMapEvents({
      click(e) {
        if (!pickup) {
            setPickup(e.latlng);
            getAddressName(e.latlng.lat, e.latlng.lng, 'pickup');
        } else if (!dropoff) {
            setDropoff(e.latlng);
            getAddressName(e.latlng.lat, e.latlng.lng, 'dropoff');
        } else {
            setPickup(e.latlng);
            setDropoff(null);
            setRoutePath([]);
            setDistanceKm(0);
            setAddressNames({ pickup: '', dropoff: '' });
            getAddressName(e.latlng.lat, e.latlng.lng, 'pickup');
        }
      },
    });
    return null;
  }

  if(!car) return <div className="text-white text-center mt-20">Car not found.</div>;

  const calculateDays = () => {
    if(!dates.start || !dates.end) return 0;
    const diff = new Date(dates.end) - new Date(dates.start);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1; 
  }

  // --- UPDATED PRICE CALCULATION WITH DISCOUNTS ---
  const days = calculateDays();
  const baseDriverCost = days * car.price;

  let discountPercentage = 0;
  if (days >= 8) {
    discountPercentage = 0.10; // 10% off for 8+ days
  } else if (days >= 4) {
    discountPercentage = 0.05; // 5% off for 4-7 days
  }

  const discountAmount = Math.floor(baseDriverCost * discountPercentage);
  const driverCost = baseDriverCost - discountAmount;
  const companyCost = distanceKm * (car.pricePerKm || 10);
  const totalCost = driverCost + companyCost;

  const handleConfirm = () => {
    if(!days) return alert("Please select dates");
    if(!distanceKm) return alert("Please select route on map");
    
    const bookingData = {
        carId: car._id, 
        carName: car.brand + " " + car.name, 
        renterId: user._id, 
        ownerId: car.ownerId,
        dates, 
        distanceKm, 
        totalPrice: Math.floor(totalCost)
    };

    navigate('/payment', { state: bookingData });
  };

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT: MAP */}
        <div className="space-y-6">
           <div>
               <h1 className="text-3xl font-bold">{car.brand} {car.name}</h1>
               <p className="text-gray-400 text-sm">Select your route on the map below.</p>
           </div>

           <div className="h-[500px] w-full rounded-xl overflow-hidden border border-white/20 relative z-0">
             <MapContainer center={[23.0225, 72.5714]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <SearchField />
                <LocationMarker />
                {pickup && <Marker position={pickup}><Popup>Pickup: {addressNames.pickup}</Popup></Marker>}
                {dropoff && <Marker position={dropoff}><Popup>Dropoff: {addressNames.dropoff}</Popup></Marker>}
                {routePath.length > 0 && <Polyline positions={routePath} color="#3b82f6" weight={5} opacity={0.8} />}
             </MapContainer>
             
             <div className="absolute top-4 right-4 z-[1000] bg-black/90 p-4 rounded-lg text-sm border border-white/20 text-right shadow-xl">
                <p className="font-bold mb-2 uppercase tracking-widest text-gray-500 text-[10px]">Trip Planner</p>
                <div className="space-y-2">
                    <p className={pickup ? "text-green-400" : "text-gray-400"}>{pickup ? "✅ Pickup Set" : "1. Click Map for Pickup"}</p>
                    <p className={dropoff ? "text-red-400" : "text-gray-400"}>{dropoff ? "✅ Dropoff Set" : "2. Click Map for Dropoff"}</p>
                </div>
                {isLoadingRoute && <p className="text-blue-400 mt-2 text-xs animate-pulse">Calculating...</p>}
             </div>
           </div>

           {(addressNames.pickup || addressNames.dropoff) && (
               <div className="bg-dark p-4 rounded-lg border border-white/10 flex flex-col gap-2 text-sm">
                   {addressNames.pickup && <p><span className="text-green-400 font-bold">FROM:</span> {addressNames.pickup}</p>}
                   {addressNames.dropoff && <p><span className="text-red-400 font-bold">TO:</span> {addressNames.dropoff}</p>}
               </div>
           )}
        </div>

        {/* RIGHT: BILLING */}
        <div className="bg-dark p-8 rounded-xl h-fit sticky top-24 border border-white/10">
          <h2 className="text-2xl font-bold mb-6">Trip Receipt</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div><label className="text-xs text-gray uppercase">Start Date</label><input type="date" className="w-full bg-input text-white p-3 rounded-lg mt-1" onChange={e => setDates({...dates, start: e.target.value})} /></div>
            <div><label className="text-xs text-gray uppercase">End Date</label><input type="date" className="w-full bg-input text-white p-3 rounded-lg mt-1" onChange={e => setDates({...dates, end: e.target.value})} /></div>
          </div>

          <div className="space-y-4 bg-black/30 p-4 rounded-lg mb-6">
             <div className="flex justify-between text-sm">
                <span className="text-gray">Driver Labor ({days} days)</span>
                <span className={discountAmount > 0 ? "line-through text-gray-500" : ""}>₹{baseDriverCost}</span>
             </div>

             {/* UPDATED: DISCOUNT ROW */}
             {discountAmount > 0 && (
               <div className="flex justify-between text-sm text-green-400 font-bold">
                  <span>Multi-day Discount ({discountPercentage * 100}%)</span>
                  <span>- ₹{discountAmount}</span>
               </div>
             )}
             
             <div className="flex justify-between text-sm">
                 <span className="text-gray">Fuel Charge ({distanceKm} km)</span>
                 <span>₹{Math.floor(companyCost)}</span>
             </div>

             <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>₹{Math.floor(totalCost)}</span>
             </div>
          </div>

          <button onClick={handleConfirm} disabled={isProcessing} className="w-full bg-white text-black font-bold py-4 rounded-lg mt-2 hover:bg-gray-200 transition">
            Pay ₹{Math.floor(totalCost)}
          </button>
        </div>

      </div>
    </div>
  );
}