
import React from 'react';
import { Link } from 'react-router-dom';

export default function CarCard({ car }) {
  return (
    <div className="card" style={{padding:0, overflow:'hidden'}}>
      <img src={car.photo} alt={car.name} style={{width:'100%', height:'150px', objectFit:'cover'}} />
      <div style={{padding:'1rem'}}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <h3>{car.name}</h3>
          <span style={{background:'#1e293b', padding:'2px 8px', borderRadius:'10px', fontSize:'0.8rem'}}>{car.type}</span>
        </div>
        <p style={{color:'#94a3b8', fontSize:'0.9rem'}}>{car.brand} • {car.fuel} • {car.seats} Seats</p>
        <p style={{color:'#94a3b8', fontSize:'0.8rem'}}>Owner: {car.ownerName} ({car.ownerCity})</p>
        
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'10px'}}>
          <div style={{fontSize:'1.1rem', fontWeight:'bold', color:'#38bdf8'}}>₹{car.price} <span style={{fontSize:'0.8rem'}}>/day</span></div>
          {car.fuelPolicy === 'included' 
            ? <span style={{fontSize:'0.7rem', color:'#4ade80', background:'rgba(34,197,94,0.1)', padding:'4px 8px', borderRadius:'10px'}}>⛽ Fuel Included</span>
            : <span style={{fontSize:'0.7rem', color:'#f87171', background:'rgba(248,113,113,0.1)', padding:'4px 8px', borderRadius:'10px'}}>⛽ Renter Pays</span>
          }
        </div>
        
        
<Link to={`/checkout/${car._id}`}>  {/* <--- MAKE SURE THIS SAYS _id */}
  <button className="btn btn-primary" style={{width:'100%', marginTop:'15px'}}>Book Now</button>
</Link>

      </div>
    </div>
  );
}