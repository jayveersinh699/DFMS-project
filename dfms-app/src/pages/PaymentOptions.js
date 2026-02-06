import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

export default function PaymentOptions() {
    const { state } = useLocation(); // Data passed from Checkout.js
    const [ownerQr, setOwnerQr] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
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
    useEffect(() => {
        // Fetch the owner's details to get their QR code
        const fetchOwnerData = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/auth/user/${state.ownerId}`);
                const data = await res.json();
                setOwnerQr(data.qrCode);
            } catch(e) { console.error("Error fetching owner QR"); }
        };
        fetchOwnerData();
    }, [state.ownerId]);

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
            {method === 'upi' && (
                    <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                        {ownerQr ? (
                            <>
                                <p className="text-sm text-gray-400 mb-4">Pay directly to the driver's verified UPI.</p>
                                <button onClick={() => setShowQrModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Show Driver QR</button>
                            </>
                        ) : (
                            <p className="text-sm text-yellow-500">Driver hasn't uploaded a QR code yet. Please use Card payment.</p>
                        )}
                    </div>
                )}
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
                {showQrModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
                    <div className="bg-white p-4 rounded-2xl max-w-xs w-full text-center">
                        <h3 className="text-black font-bold mb-4">Scan to Pay ₹{state.totalPrice}</h3>
                        <img src={ownerQr} className="w-full aspect-square object-contain mb-4" alt="Driver QR" />
                        <button onClick={() => setShowQrModal(false)} className="w-full bg-black text-white py-3 rounded-xl font-bold">Close</button>
                    </div>
                </div>
        
                )}
            </div>
        </div>      
    );
}