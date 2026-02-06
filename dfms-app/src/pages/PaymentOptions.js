import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, CheckCircle, X } from 'lucide-react'; // Added icons for better UI

export default function PaymentOptions() {
    const { state } = useLocation(); // Data passed from Checkout.js
    const navigate = useNavigate();
    
    const [ownerQr, setOwnerQr] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [method, setMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);

    // Redirect if no booking data is found (e.g., page refresh)
    useEffect(() => {
        if (!state) {
            navigate('/renter/marketplace');
        }
    }, [state, navigate]);

    useEffect(() => {
        // Fetch the owner's details to get their verified QR code
        const fetchOwnerData = async () => {
            if (!state?.ownerId) return;
            try {
                const res = await fetch(`http://localhost:5000/api/auth/user/${state.ownerId}`);
                const data = await res.json();
                if (data.qrCode) {
                    setOwnerQr(data.qrCode);
                }
            } catch (e) {
                console.error("Error fetching owner QR:", e);
            }
        };
        fetchOwnerData();
    }, [state?.ownerId]);

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate a slight delay for verification
        setTimeout(async () => {
            try {
                const res = await fetch('http://localhost:5000/api/bookings/request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...state, paymentStatus: 'escrow' })
                });
                if (res.ok) {
                    alert("Payment received by DFMS! Trip request sent to driver.");
                    navigate('/renter/trips');
                } else {
                    alert("Server error. Please try again.");
                }
            } catch (e) {
                alert("Payment Failed: Check your server connection.");
            }
            setIsProcessing(false);
        }, 1500);
    };

    if (!state) return null;

    return (
        <div className="bg-black min-h-screen text-white flex items-center justify-center p-6 relative">
            <div className="max-w-md w-full bg-[#111] p-8 rounded-2xl border border-white/10 shadow-2xl">
                <h2 className="text-3xl font-bold mb-2">Secure Checkout</h2>
                <p className="text-gray-400 text-sm mb-8">Funds are held by DFMS until the trip is completed.</p>

                <div className="space-y-4 mb-8">
                    <button 
                        onClick={() => setMethod('card')} 
                        className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${method === 'card' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/30'}`}
                    >
                        <CreditCard size={20} className={method === 'card' ? 'text-blue-400' : 'text-gray-400'} />
                        <span className="font-semibold text-lg">Credit / Debit Card</span>
                    </button>
                    
                    <button 
                        onClick={() => setMethod('upi')} 
                        className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${method === 'upi' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/30'}`}
                    >
                        <Smartphone size={20} className={method === 'upi' ? 'text-blue-400' : 'text-gray-400'} />
                        <span className="font-semibold text-lg">UPI / QR Payment</span>
                    </button>
                </div>

                {/* UPI UI */}
                {method === 'upi' && (
                    <div className="mb-8 p-5 bg-white/5 border border-white/10 rounded-xl text-center">
                        {ownerQr ? (
                            <>
                                <p className="text-sm text-gray-400 mb-4">You can pay directly to the driver's verified UPI QR code.</p>
                                <button 
                                    onClick={() => setShowQrModal(true)} 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
                                >
                                    Show Driver QR
                                </button>
                            </>
                        ) : (
                            <p className="text-sm text-yellow-500 flex items-center justify-center gap-2">
                                ⚠️ Driver hasn't uploaded a QR code yet. Please use Card.
                            </p>
                        )}
                    </div>
                )}

                {/* Card UI */}
                {method === 'card' && (
                    <div className="space-y-4 mb-8 animate-in fade-in duration-300">
                        <input className="w-full bg-black border border-white/10 p-4 rounded-xl focus:border-blue-500 outline-none transition" placeholder="Card Number" />
                        <div className="flex gap-4">
                            <input className="w-1/2 bg-black border border-white/10 p-4 rounded-xl focus:border-blue-500 outline-none transition" placeholder="MM / YY" />
                            <input className="w-1/2 bg-black border border-white/10 p-4 rounded-xl focus:border-blue-500 outline-none transition" placeholder="CVV" />
                        </div>
                    </div>
                )}

                <div className="border-t border-white/10 pt-6 mb-6">
                    <div className="flex justify-between items-center text-gray-400 mb-2">
                        <span>Trip Amount</span>
                        <span>₹{state.totalPrice}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-xl">
                        <span>Total to Pay</span>
                        <span className="text-green-400">₹{state.totalPrice}</span>
                    </div>
                </div>

                <button 
                    onClick={handlePayment} 
                    disabled={isProcessing} 
                    className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            Verifying...
                        </span>
                    ) : (
                        `Pay ₹${state.totalPrice} to Platform`
                    )}
                </button>
            </div>

            {/* QR MODAL POPUP */}
            {showQrModal && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white p-6 rounded-[2.5rem] max-w-xs w-full text-center relative shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                        <button 
                            onClick={() => setShowQrModal(false)} 
                            className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="mb-4">
                            <h3 className="text-black font-extrabold text-xl">Pay Driver Directly</h3>
                            <p className="text-gray-500 text-sm">Scan to pay ₹{state.totalPrice}</p>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-3xl mb-6">
                            <img 
                                src={ownerQr} 
                                className="w-full aspect-square object-contain rounded-xl" 
                                alt="Driver Payment QR" 
                            />
                        </div>

                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6 px-4">
                            Click 'Pay' on the main screen after completing your mobile payment
                        </p>

                        <button 
                            onClick={() => setShowQrModal(false)} 
                            className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition"
                        >
                            Confirm & Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}