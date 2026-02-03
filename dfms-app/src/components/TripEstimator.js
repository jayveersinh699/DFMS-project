import React from 'react';

export default function TripEstimator({ car }) {
  // If no car data is passed yet, show loading
  if (!car) return null;

  return (
    <div className="bg-input rounded-lg p-4 mb-6 border border-white/5">
      <h4 className="text-sm font-bold text-gray mb-3 uppercase tracking-wider">
        Price Breakdown
      </h4>
      
      <div className="space-y-3">
        {/* Base Price */}
        <div className="flex justify-between items-center">
          <span className="text-white">Daily Rate</span>
          <span className="font-medium text-white">₹{car.price}</span>
        </div>

        {/* Service Fee (Static Example) */}
        <div className="flex justify-between items-center text-sm text-gray">
          <span>Platform Fee (5%)</span>
          <span>+ ₹{Math.floor(car.price * 0.05)}/day</span>
        </div>

        {/* Insurance (Static Example) */}
        <div className="flex justify-between items-center text-sm text-gray">
          <span>Insurance & Support</span>
          <span>Included</span>
        </div>

        <div className="h-px bg-white/10 my-2"></div>

        {/* Total Estimate */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-white">Est. Total per Day</span>
          <span className="font-bold text-xl text-white">
            ₹{car.price + Math.floor(car.price * 0.05)}
          </span>
        </div>
      </div>
    </div>
  );
}