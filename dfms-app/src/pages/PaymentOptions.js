import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function PaymentOptions() {
    const { state } = useLocation(); // Data passed from Checkout.js
    const navigate = useNavigate();
    
    // Payment Method State
    const [method, setMethod] = useState('card');
    const [selectedUpiApp, setSelectedUpiApp] = useState(null);
    
    // QR Code State
    const [ownerQr, setOwnerQr] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
    
    const [isProcessing, setIsProcessing] = useState(false);

    // 1. Fetch the Driver's details (QR Code) when page loads
    useEffect(() => {
        const fetchOwnerData = async () => {
            if (state?.ownerId) {
                try {
                    const res = await fetch(`http://localhost:5000/api/auth/user/${state.ownerId}`);
                    const data = await res.json();
                    setOwnerQr(data.qrCode);
                } catch(e) { console.error("Error fetching owner QR"); }
            }
        };
        fetchOwnerData();
    }, [state]);

    const handlePayment = async () => {
        // VALIDATION: Ensure a UPI app is selected if that method is chosen
        if (method === 'upi_apps' && !selectedUpiApp) {
            toast.error("Please select a UPI App (PhonePe, Paytm, etc.)");
            return;
        }

        setIsProcessing(true);
        
        // LOGIC: Determine Payment Status
        // - QR Code: User pays driver directly -> 'paid_to_driver'
        // - Card/UPI Apps: User pays platform -> 'escrow'
        const paymentStatus = method === 'qr_code' ? 'paid_to_driver' : 'escrow';

        setTimeout(async () => {
            try {
                const res = await fetch('http://localhost:5000/api/bookings/request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...state, paymentStatus })
                });

                if(res.ok) {
                    if (method === 'qr_code') {
                        toast.success("Payment Confirmed! Driver has been notified.");
                    } else {
                        toast.success("Payment received by DFMS!");
                    }
                    // Redirect to Renter Dashboard (assuming route exists)
                    navigate('/renter'); 
                } else {
                    toast.error("Booking failed. Please try again.");
                }
            } catch (e) { toast.error("Network Error"); }
            setIsProcessing(false);
        }, 1500);
    };

    return (
        <div className="bg-black min-h-screen text-white flex items-center justify-center p-6 relative">
            <div className="max-w-md w-full bg-[#111] p-8 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-bold mb-6">Secure Checkout</h2>
                
                {/* METHOD SELECTION BUTTONS */}
                <div className="space-y-3 mb-8">
                    <button 
                        onClick={() => { setMethod('card'); setSelectedUpiApp(null); }} 
                        className={`w-full p-4 rounded-lg border text-left transition ${method === 'card' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 text-gray-400 hover:text-white'}`}
                    >
                        💳 Credit / Debit Card
                    </button>
                    
                    <button 
                        onClick={() => { setMethod('upi_apps'); }} 
                        className={`w-full p-4 rounded-lg border text-left transition ${method === 'upi_apps' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 text-gray-400 hover:text-white'}`}
                    >
                        📱 UPI Apps (PhonePe / Paytm)
                    </button>

                    <button 
                        onClick={() => { setMethod('qr_code'); setSelectedUpiApp(null); }} 
                        className={`w-full p-4 rounded-lg border text-left transition ${method === 'qr_code' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 text-gray-400 hover:text-white'}`}
                    >
                        🔳 Scan QR Code
                    </button>
                </div>

                {/* 1. CARD VIEW */}
                {method === 'card' && (
                    <div className="space-y-3 mb-6 animate-fade-in">
                        <input className="w-full bg-black border border-white/10 p-3 rounded-lg" placeholder="Card Number" />
                        <div className="flex gap-2">
                            <input className="w-1/2 bg-black border border-white/10 p-3 rounded-lg" placeholder="MM/YY" />
                            <input className="w-1/2 bg-black border border-white/10 p-3 rounded-lg" placeholder="CVV" />
                        </div>
                    </div>
                )}

                {/* 2. UPI APPS VIEW (Now Selectable) */}
                {method === 'upi_apps' && (
                    <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-in">
                        {['PhonePe', 'Paytm', 'GPay', 'WhatsApp'].map((app) => (
                            <button 
                                key={app}
                                onClick={() => setSelectedUpiApp(app)}
                                className={`p-3 rounded-lg flex items-center justify-center gap-2 border transition ${selectedUpiApp === app ? 'bg-white text-black border-white' : 'bg-[#222] border-white/10 hover:bg-[#333]'}`}
                            >
                                <span className="font-bold">{app}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* 3. QR CODE VIEW */}
                {method === 'qr_code' && (
                    <div className="mb-6 animate-fade-in text-center">
                        {ownerQr ? (
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                <p className="text-gray-400 text-sm mb-4">Pay directly to Driver via UPI QR</p>
                                <button onClick={() => setShowQrModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold w-full transition">
                                    Show Driver QR
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <p className="text-yellow-500 text-sm">This driver hasn't uploaded a QR code yet. Please use another method.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* DYNAMIC PAY BUTTON */}
                <button 
                    onClick={handlePayment} 
                    disabled={isProcessing || (method === 'qr_code' && !ownerQr)} 
                    className={`w-full font-bold py-4 rounded-xl transition ${isProcessing ? 'bg-gray-600 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}
                >
                    {isProcessing ? "Processing..." : 
                     method === 'qr_code' ? "I have Scanned & Paid" : 
                     method === 'upi_apps' && selectedUpiApp ? `Pay via ${selectedUpiApp}` :
                     `Pay ₹${state.totalPrice} to Platform`
                    }
                </button>
            </div>

            {/* QR MODAL POPUP */}
            {showQrModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl max-w-xs w-full text-center relative animate-scale-in">
                        <button onClick={() => setShowQrModal(false)} className="absolute top-2 right-4 text-black text-2xl font-bold hover:text-red-500">&times;</button>
                        <h3 className="text-black font-bold mb-2 text-xl">Scan to Pay</h3>
                        <p className="text-gray-500 text-sm mb-4">Amount: ₹{state.totalPrice}</p>
                        
                        <div className="bg-gray-100 p-2 rounded-lg mb-4">
                            <img src={ownerQr} className="w-full aspect-square object-contain" alt="Driver QR" />
                        </div>
                        
                        <p className="text-xs text-gray-400 mb-4">Scan using any UPI App</p>
                        <button onClick={() => setShowQrModal(false)} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition">Done</button>
                    </div>
                </div>
            )}
        </div>
    );
}