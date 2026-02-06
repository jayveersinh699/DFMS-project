import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PaymentOptions() {
    const { state } = useLocation(); // Data passed from Checkout.js
    const navigate = useNavigate();
    const [method, setMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);
        setTimeout(async () => {
            try {
                const res = await fetch('http://localhost:5000/api/bookings/request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...state, paymentStatus: 'escrow' })
                });
                if(res.ok) {
                    alert("Payment received by DFMS! Trip request sent to driver.");
                    navigate('/renter/trips');
                }
            } catch (e) { alert("Payment Failed"); }
            setIsProcessing(false);
        }, 1500);
    };

    return (
        <div className="bg-black min-h-screen text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#111] p-8 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-bold mb-6">Secure Checkout</h2>
                <div className="space-y-4 mb-8">
                    <button onClick={() => setMethod('card')} className={`w-full p-4 rounded-lg border text-left ${method === 'card' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10'}`}>
                        💳 Credit / Debit Card
                    </button>
                    <button onClick={() => setMethod('upi')} className={`w-full p-4 rounded-lg border text-left ${method === 'upi' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10'}`}>
                        📱 UPI (Google Pay / PhonePe)
                    </button>
                </div>

                {method === 'card' && (
                    <div className="space-y-3 mb-6">
                        <input className="w-full bg-black border border-white/10 p-3 rounded-lg" placeholder="Card Number" />
                        <div className="flex gap-2">
                            <input className="w-1/2 bg-black border border-white/10 p-3 rounded-lg" placeholder="MM/YY" />
                            <input className="w-1/2 bg-black border border-white/10 p-3 rounded-lg" placeholder="CVV" />
                        </div>
                    </div>
                )}

                <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition">
                    {isProcessing ? "Verifying..." : `Pay ₹${state.totalPrice} to Platform`}
                </button>
            </div>
        </div>
    );
}