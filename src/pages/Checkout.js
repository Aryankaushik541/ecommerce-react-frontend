import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// Define Payment Methods
const PAYMENT_METHODS = {
    COD: 'COD',
    CARD: 'CARD', 
    UPI: 'UPI', 
};

const Checkout = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); 
    const [cartTotal, setCartTotal] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderReference, setOrderReference] = useState(null);
    const [validationErrors, setValidationErrors] = useState({}); 
    
    // Payment State
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS.COD);
    
    // Mock Payment Detail State
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        cardExpiry: '',
        cardCVV: '',
        upiId: '',
    });

    // Form State (SHIPPING DETAILS)
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
    });
    
    // NEW: State for setting the address as default
    const [isDefaultAddress, setIsDefaultAddress] = useState(false);

    // Fees (For demonstration purposes)
    const COD_FEE = 5.00;
    const CARD_PROCESSING_FEE_RATE = 0.02; // 2%

    // --- Calculated Values ---
    const calculatedFees = useMemo(() => {
        if (!cartTotal) return 0;
        const total = parseFloat(cartTotal);
        
        if (selectedPaymentMethod === PAYMENT_METHODS.COD) {
            return COD_FEE;
        } else if (selectedPaymentMethod === PAYMENT_METHODS.CARD || selectedPaymentMethod === PAYMENT_METHODS.UPI) {
            return total * CARD_PROCESSING_FEE_RATE; 
        }
        return 0;
    }, [cartTotal, selectedPaymentMethod]);
    
    const finalTotal = useMemo(() => {
        if (!cartTotal) return '0.00';
        return (parseFloat(cartTotal) + calculatedFees).toFixed(2);
    }, [cartTotal, calculatedFees]);


    // --- Validation ---
    const isShippingValid = useMemo(() => {
        return Object.values(formData).every(value => value.trim() !== '');
    }, [formData]);

    const isPaymentValid = useMemo(() => {
        if (selectedPaymentMethod === PAYMENT_METHODS.COD) {
            return true;
        }
        if (selectedPaymentMethod === PAYMENT_METHODS.CARD) {
            return paymentDetails.cardNumber.length === 16 && 
                   paymentDetails.cardExpiry.length === 5 && 
                   paymentDetails.cardCVV.length >= 3;
        }
        if (selectedPaymentMethod === PAYMENT_METHODS.UPI) {
            return paymentDetails.upiId.length > 5 && paymentDetails.upiId.includes('@');
        }
        return false;
    }, [selectedPaymentMethod, paymentDetails]);

    const isFormValid = isShippingValid && isPaymentValid;
    // --------------------

    // --- EFFECT: Fetch Cart Total & Default Address on Load ---
    useEffect(() => {
        const fetchCheckoutData = async () => {
            setLoading(true);
            try {
                const cartResponse = await api.get('/orders/cart/');
                if (cartResponse.data.items.length === 0) {
                    alert("Your vault is empty. Redirecting to collections.");
                    navigate('/products');
                    return;
                }
                setCartTotal(cartResponse.data.total_price);

                try {
                    const addressResponse = await api.get('/orders/profile/default-address/');
                    const addressData = addressResponse.data;
                    
                    if (addressData) {
                        setFormData({
                            fullName: addressData.full_name || '',
                            phone: addressData.phone || '',
                            address: addressData.address || '',
                            city: addressData.city || '',
                            state: addressData.state || '',
                            zipCode: addressData.zip_code || '',
                        });
                        setIsDefaultAddress(addressData.is_default); 
                    }
                } catch (addressError) {
                    console.info("No default shipping address found, starting with empty form.");
                }

            } catch (error) {
                console.error("Failed to load checkout data:", error.response);
                alert("Authentication failed or cart details unavailable. Please log in or check your cart.");
                navigate('/cart');
            } finally {
                setLoading(false);
            }
        };
        fetchCheckoutData();
    }, [navigate]);

    // --- Input Handlers ---
    const handleInputChange = (e) => {
        setValidationErrors(prev => ({ ...prev, [e.target.name]: undefined })); 
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handlePaymentDetailChange = (e) => {
        setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
    };

    // --- Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});
        if (!isFormValid || loading) return;

        setLoading(true);

        let backendPaymentMethod;
        
        if (selectedPaymentMethod === PAYMENT_METHODS.COD) {
            backendPaymentMethod = 'COD';
        } else if (selectedPaymentMethod === PAYMENT_METHODS.CARD) {
            backendPaymentMethod = 'CARD'; 
        } else if (selectedPaymentMethod === PAYMENT_METHODS.UPI) {
            backendPaymentMethod = 'UPI';
        }

        const shippingDetailsPayload = {
            ...formData, 
            isDefault: isDefaultAddress,
        }

        const payload = {
            shipping_details: shippingDetailsPayload, 
            payment_method: backendPaymentMethod, 
            total_amount: finalTotal, 
        };

        try {
            const response = await api.post('/orders/place-order/', payload);
            
            setOrderReference(response.data.order_reference || 'N/A'); 
            setIsSuccess(true);
            
            setTimeout(() => {
                navigate('/orders'); 
            }, 3000);

        } catch (error) {
            console.error('Order failed:', error.response);
            
            const responseData = error.response?.data;

            if (error.response?.status === 400 && responseData?.details) {
                const djangoErrors = responseData.details;
                const frontendErrors = {};
                
                if (djangoErrors.full_name) frontendErrors.fullName = djangoErrors.full_name[0];
                if (djangoErrors.zip_code) frontendErrors.zipCode = djangoErrors.zip_code[0];
                if (djangoErrors.phone) frontendErrors.phone = djangoErrors.phone[0];
                if (djangoErrors.address) frontendErrors.address = djangoErrors.address[0];
                if (djangoErrors.city) frontendErrors.city = djangoErrors.city[0];
                if (djangoErrors.state) frontendErrors.state = djangoErrors.state[0];
                
                setValidationErrors(frontendErrors);
                alert("Validation failed: Please correct the shipping details.");
            } else {
                const errorMessage = responseData?.error || "The acquisition could not be completed. Server failed.";
                alert(errorMessage);
            }

            setLoading(false);
        }
    };

    // Helper function to display error message below the input
    const renderError = (fieldName) => {
        const error = validationErrors[fieldName];
        if (error) {
            return <p style={{ color: '#ff6666', fontSize: '0.75rem', margin: 0, marginTop: '5px' }}>{error}</p>;
        }
        return null;
    };


    // --- JSX RENDER: Loading State / Success State ---

    if (loading || cartTotal === null) {
        return (
            <div className="royal-checkout-page royal-loading">
                <style>{LOADING_STYLES}</style>
                <h1>Loading Acquisition Data...</h1>
            </div>
        );
    }
    
    if (isSuccess) {
        return (
            <div className="royal-checkout-page success-screen">
                <style>{SUCCESS_STYLES}</style>
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="success-message-box"
                >
                    <div className="success-icon">⚜️</div>
                    <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Acquisition Successful</h1>
                    <p>Your decree is acknowledged. Order **#{orderReference}** is being prepared.</p>
                    <p>{selectedPaymentMethod === PAYMENT_METHODS.COD ? "Payment will be collected upon arrival." : `A ${selectedPaymentMethod} transaction for $${finalTotal} has been simulated.`}</p>
                    <p style={{ marginTop: '2rem', color: '#888' }}>Redirecting to your archives...</p>
                </motion.div>
            </div>
          );
    }


    // --- JSX RENDER: Main Checkout Form ---
    return (
        <div className="royal-checkout-page">
            <style>{ROYAL_THEME_STYLES}</style>

            {/* Background Overlay */}
            <div className="royal-bg-overlay"></div> 

            <div className="container">
                <motion.h1 
                    className="page-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Secure Checkout
                </motion.h1>
                
                {/* Divider for aesthetic consistency */}
                <div className="royal-divider">
                    <span className="line"></span>
                    <span className="diamond">♦</span>
                    <span className="line"></span>
                </div>

                <form onSubmit={handleSubmit} className="checkout-layout">
                    
                    {/* LEFT COLUMN: DETAILS & PAYMENT */}
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                        
                        {/* Shipping Info */}
                        <h3 className="section-header">Concierge Details</h3>
                        <div className="form-grid">
                            
                            <div className="input-group full-width">
                                <label>Full Name</label>
                                <input type="text" name="fullName" className={`royal-input ${validationErrors.fullName ? 'error' : ''}`} 
                                    placeholder="e.g., Lord Alexander" required onChange={handleInputChange} value={formData.fullName}
                                />
                                {renderError('fullName')}
                            </div>

                            <div className="input-group full-width">
                                <label>Mobile Number</label>
                                <input type="tel" name="phone" className={`royal-input ${validationErrors.phone ? 'error' : ''}`} 
                                    placeholder="+91 XXXXX XXXXX" required onChange={handleInputChange} value={formData.phone}
                                />
                                {renderError('phone')}
                            </div>

                            <div className="input-group full-width">
                                <label>Street Address</label>
                                <input type="text" name="address" className={`royal-input ${validationErrors.address ? 'error' : ''}`} 
                                    placeholder="House No, Street, Landmark" required onChange={handleInputChange} value={formData.address}
                                />
                                {renderError('address')}
                            </div>

                            <div className="input-group">
                                <label>City</label>
                                <input type="text" name="city" className={`royal-input ${validationErrors.city ? 'error' : ''}`} required 
                                    onChange={handleInputChange} value={formData.city}
                                />
                                {renderError('city')}
                            </div>

                            <div className="input-group">
                                <label>State / Province</label>
                                <select name="state" className={`royal-input ${validationErrors.state ? 'error' : ''}`} required 
                                    onChange={handleInputChange} value={formData.state}>
                                    <option value="" disabled>Select State</option>
                                    <option value="MH">Maharashtra</option>
                                    <option value="DL">Delhi</option>
                                    <option value="KA">Karnataka</option>
                                    <option value="TN">Tamil Nadu</option>
                                    <option value="UP">Uttar Pradesh</option>
                                    <option value="WB">West Bengal</option>
                                    <option value="XX">Other</option>
                                </select>
                                {renderError('state')}
                            </div>

                            <div className="input-group">
                                <label>Postal Code</label>
                                <input type="text" name="zipCode" className={`royal-input ${validationErrors.zipCode ? 'error' : ''}`} required 
                                    onChange={handleInputChange} value={formData.zipCode}
                                />
                                {renderError('zipCode')}
                            </div>
                            
                            {/* Checkbox for Default Address */}
                            <div className="input-group full-width" style={{ flexDirection: 'row', alignItems: 'center', marginTop: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="isDefault" 
                                    checked={isDefaultAddress}
                                    onChange={(e) => setIsDefaultAddress(e.target.checked)}
                                    style={{ width: 'auto', marginRight: '10px' }}
                                />
                                <label htmlFor="isDefault" style={{ color: '#fff' }}>Set as my default acquisition address</label>
                            </div>

                        </div>

                        {/* Payment Method Selector */}
                        <h3 className="section-header" style={{ marginTop: '3rem' }}>Payment Method</h3>
                        <div className="payment-options-grid">
                            
                            {/* Option 1: Cash on Delivery (COD) */}
                            <div 
                                className={`payment-card ${selectedPaymentMethod === PAYMENT_METHODS.COD ? 'selected' : ''}`}
                                onClick={() => setSelectedPaymentMethod(PAYMENT_METHODS.COD)}
                            >
                                <span className="payment-card-icon">📦</span>
                                <strong>Pay on Arrival</strong>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#888' }}>{`Fee: $${COD_FEE.toFixed(2)}`}</p>
                            </div>

                            {/* Option 2: Card / Netbanking */}
                            <div 
                                className={`payment-card ${selectedPaymentMethod === PAYMENT_METHODS.CARD ? 'selected' : ''}`}
                                onClick={() => setSelectedPaymentMethod(PAYMENT_METHODS.CARD)}
                            >
                                <span className="payment-card-icon">💳</span>
                                <strong>Credit/Debit Card</strong>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#888' }}>{`Fee: ${CARD_PROCESSING_FEE_RATE * 100}%`}</p>
                            </div>

                            {/* Option 3: UPI / Wallet */}
                            <div 
                                className={`payment-card ${selectedPaymentMethod === PAYMENT_METHODS.UPI ? 'selected' : ''}`}
                                onClick={() => setSelectedPaymentMethod(PAYMENT_METHODS.UPI)}
                            >
                                <span className="payment-card-icon">📱</span>
                                <strong>UPI / Wallet</strong>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#888' }}>{`Fee: ${CARD_PROCESSING_FEE_RATE * 100}%`}</p>
                            </div>
                        </div>
                        
                        {/* Conditional Payment Inputs */}
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div 
                                key={selectedPaymentMethod} // Key is essential for AnimatePresence to transition
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {selectedPaymentMethod === PAYMENT_METHODS.CARD && (
                                    <div className="form-grid payment-input-details" style={{ border: '1px solid #444', padding: '1.5rem', marginBottom: '2rem' }}>
                                        <div className="input-group full-width">
                                            <label>Card Number</label>
                                            <input 
                                                type="text" name="cardNumber" className="royal-input" placeholder="XXXX XXXX XXXX XXXX" 
                                                required onChange={handlePaymentDetailChange} value={paymentDetails.cardNumber} maxLength={16}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Expiry (MM/YY)</label>
                                            <input 
                                                type="text" name="cardExpiry" className="royal-input" placeholder="MM/YY" 
                                                required onChange={handlePaymentDetailChange} value={paymentDetails.cardExpiry} maxLength={5}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>CVV</label>
                                            <input 
                                                type="text" name="cardCVV" className="royal-input" placeholder="XXX" 
                                                required onChange={handlePaymentDetailChange} value={paymentDetails.cardCVV} maxLength={4}
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedPaymentMethod === PAYMENT_METHODS.UPI && (
                                    <div className="form-grid payment-input-details" style={{ border: '1px solid #444', padding: '1.5rem', marginBottom: '2rem' }}>
                                        <div className="input-group full-width">
                                            <label>UPI ID or VPA</label>
                                            <input 
                                                type="email" name="upiId" className="royal-input" placeholder="name@bankname" 
                                                required onChange={handlePaymentDetailChange} value={paymentDetails.upiId}
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    {/* RIGHT COLUMN: SUMMARY */}
                    <motion.div 
                        className="checkout-summary"
                        initial={{ opacity: 0, x: 30 }} 
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="section-header">Order Review</h3>
                        
                        <div className="summary-row">
                            <span>Cart Subtotal</span>
                            <span>${cartTotal}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping & Handling (Concierge)</span>
                            <span>$0.00</span>
                        </div>
                        
                        <div className="summary-row" style={{ color: selectedPaymentMethod === PAYMENT_METHODS.COD ? '#bf953f' : '#ccc' }}>
                            <span>{selectedPaymentMethod === PAYMENT_METHODS.COD ? 'COD Handling Fee' : 'Payment Processing Fee'}</span>
                            <span>${calculatedFees.toFixed(2)}</span>
                        </div>

                        <div className="summary-row total-row">
                            <span>**Total Payable**</span>
                            <span>**${finalTotal}**</span>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-submit" 
                            disabled={loading || !isFormValid} 
                        >
                            {loading ? "Processing Acquisition..." : "Confirm Order"}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: '#666' }}>
                            By confirming, you agree to our Terms of Service.
                        </div>
                    </motion.div>

                </form>
            </div>
        </div>
    );
};

export default Checkout;

// ===========================================
// CSS Styles (Functional Components)
// ===========================================

const ROYAL_THEME_STYLES = `
    .royal-checkout-page {
        min-height: 100vh; background-color: #050505; color: #e0e0e0;
        font-family: 'Cinzel', serif; padding: 4rem 2rem; position: relative;
        background-image: radial-gradient(circle, #1a1a1a 1px, transparent 1px);
        background-size: 20px 20px;
    }
    .royal-bg-overlay {
        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.4); z-index: 0;
    }
    .container { max-width: 1100px; margin: 0 auto; z-index: 1; position: relative; }
    .page-title { 
        color: #d4af37; text-transform: uppercase; letter-spacing: 3px; 
        text-align: center; margin-bottom: 1rem; font-size: 3rem;
        text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
    }
    
    /* Divider Style from Home.js */
    .royal-divider {
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 3rem auto; max-width: 300px;
    }
    .royal-divider .line {
        flex-grow: 1; height: 1px; background-color: rgba(212, 175, 55, 0.3);
    }
    .royal-divider .diamond {
        color: #d4af37; font-size: 1rem; margin: 0 15px;
        filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.8));
    }

    /* Layout & Section Header */
    .checkout-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 3rem; }
    @media(max-width: 900px) { .checkout-layout { grid-template-columns: 1fr; } }
    .section-header { 
        border-bottom: 1px solid rgba(212, 175, 55, 0.3); padding-bottom: 10px; 
        margin-bottom: 20px; color: #fff; font-size: 1.5rem;
    }
    
    /* Form */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .full-width { grid-column: span 2; }
    .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .input-group label { font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .royal-input {
        background: rgba(20, 20, 20, 0.8); border: 1px solid #333; padding: 15px;
        color: #fff; font-family: sans-serif; outline: none; transition: border 0.3s ease;
    }
    .royal-input:focus { border-color: #d4af37; }
    .royal-input.error { border-color: #ff6666; } 

    /* Payment Selection Cards */
    .payment-options-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .payment-card {
        background: rgba(30, 30, 30, 0.7); border: 1px solid #333; padding: 1rem;
        cursor: pointer; text-align: center; transition: all 0.2s ease;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5); font-size: 0.9rem;
    }
    .payment-card.selected {
        border-color: #d4af37; background: rgba(212, 175, 55, 0.15);
        box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
    }
    .payment-card strong { color: #d4af37; display: block; margin-top: 0.5rem; }
    .payment-card-icon { font-size: 1.5rem; }
    .payment-input-details { grid-template-columns: 2fr 1fr 1fr; } /* Layout for card inputs */
    @media(max-width: 600px) { .payment-input-details { grid-template-columns: 1fr !important; } }
    .payment-input-details .full-width { grid-column: span 3; }
    @media(max-width: 600px) { .payment-input-details .full-width { grid-column: span 1; } }


    /* Summary Card (Right Side) */
    .checkout-summary {
        background: rgba(30, 30, 30, 0.9); padding: 2rem; height: fit-content;
        border: 1px solid #333; position: sticky; top: 2rem;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: #ccc; }
    .total-row { 
        font-size: 1.3rem; color: #d4af37; border-top: 1px solid #444; 
        padding-top: 1rem; margin-top: 1rem; font-weight: bold; 
    }
    
    /* Submit Button */
    .btn-submit {
        width: 100%; 
        background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
        color: #000; padding: 15px; border: none; font-weight: bold; text-transform: uppercase;
        cursor: pointer; margin-top: 2rem; font-family: 'Cinzel', serif; font-size: 1rem;
        transition: all 0.3s ease;
    }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(212, 175, 55, 0.6); }
`;

const LOADING_STYLES = `
    .royal-loading { 
        display: flex; justify-content: center; align-items: center; 
        min-height: 100vh; background: #0a0a0a; color: #d4af37; 
        font-family: 'Cinzel', serif; 
    }
`;

const SUCCESS_STYLES = `
    .success-screen { 
        min-height: 100vh; background-color: #050505; color: #e0e0e0; 
        display: flex; align-items: center; justify-content: center; text-align: center; 
        font-family: 'Cinzel', serif; 
    }
    .success-icon { 
        font-size: 5rem; margin-bottom: 2rem; animation: popIn 0.5s ease; 
        color: #d4af37; 
    }
    .success-message-box { 
        padding: 3rem; border: 1px solid rgba(212, 175, 55, 0.3); 
        background: rgba(20, 20, 20, 0.8); 
    }
    @keyframes popIn { 0% { transform: scale(0); } 80% { transform: scale(1.1); } 100% { transform: scale(1); } }
`;