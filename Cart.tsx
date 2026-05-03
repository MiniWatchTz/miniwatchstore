import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState('cart');
  const [trackingId, setTrackingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    phone: ''
  });

  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
      alert('Please provide complete shipping details to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          totalPrice,
          shipping: shippingInfo,
          payment: 'Lipa Namba (Vodacom)'
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setTrackingId(data.trackingId);
        setStep('success');
        clearCart();
      }
    } catch (error) {
      alert('We encountered an issue processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className='container fade-in' style={{ textAlign: 'center', padding: '8rem 2rem' }}>
        <div style={{ background: 'var(--card-bg)', padding: '4rem', borderRadius: '2rem', border: '1px solid var(--border)', maxWidth: '600px', margin: '0 auto', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
          <div style={{ background: 'var(--primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <ShieldCheck size={40} color="white" />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Order Secured</h1>
          <p style={{ opacity: 0.7, marginBottom: '2rem', fontSize: '1.1rem' }}>Thank you for choosing MiniWatch. Your master timepiece is being prepared for shipment.</p>
          
          <div style={{ background: 'var(--midnight)', color: 'white', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '0.5rem' }}>Your Tracking ID</p>
            <h2 style={{ color: 'var(--primary)', fontSize: '2rem', letterSpacing: '4px' }}>{trackingId}</h2>
          </div>

          <button 
            onClick={() => navigate('/')}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1.2rem 2.5rem', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', width: '100%' }}
          >
            Continue Discovery <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className='container fade-in' style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <ShoppingBag size={64} style={{ color: 'var(--primary)', marginBottom: '2rem', opacity: 0.3 }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Your Bag is Empty</h1>
        <p style={{ opacity: 0.6, marginBottom: '3rem' }}>Your next signature timepiece is waiting in our collection.</p>
        <button onClick={() => navigate('/')} style={{ background: 'var(--midnight)', color: 'white', padding: '1.2rem 3rem', borderRadius: '0.5rem', border: 'none', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className='container fade-in' style={{ paddingTop: '4rem', paddingBottom: '8rem' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '4rem', textTransform: 'uppercase', letterSpacing: '-1px' }}>
        Shopping Bag <span style={{ fontSize: '1.2rem', fontWeight: 400, opacity: 0.4, verticalAlign: 'middle', marginLeft: '1rem' }}>({cart.length} Items)</span>
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '5rem', alignItems: 'start' }}>
        {/* Left: Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '150px 1fr auto', gap: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <div style={{ height: '150px', borderRadius: '1rem', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <img src={item.images?.[0] || item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.category}</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.25rem' }}>{item.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem', marginTop: '0.5rem' }}>TSh {item.price.toLocaleString()}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', borderRight: '1px solid var(--border)' }}><ChevronLeft size={16}/></button>
                    <span style={{ padding: '0 1rem', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', borderLeft: '1px solid var(--border)' }}><ChevronRight size={16}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>TSh {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            </div>
          ))}

          {/* Secure Payment Notice */}
          <div style={{ marginTop: '2rem', padding: '2rem', background: 'var(--card-bg)', borderRadius: '1rem', border: '1px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem 1rem', background: 'var(--primary)', color: 'var(--midnight)', fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase' }}>Official Payment</div>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CreditCard size={20} color="var(--primary)" /> Lipa Namba (Vodacom)
            </h3>
            <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6 }}>
              Complete your payment to: <br/>
              <strong>Name:</strong> FADHILILI D SUMAYAN <br/>
              <strong>Lipa Namba:</strong> 5190479 <br/>
              <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginTop: '0.5rem' }}>Please include your Tracking ID as the reference in your payment.</span>
            </p>
          </div>
        </div>

        {/* Right: Summary & Checkout */}
        <div style={{ position: 'sticky', top: '7rem' }}>
          <div style={{ background: 'var(--midnight)', color: 'white', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Client Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Fadhili Sumayan" 
                    required 
                    value={shippingInfo.name}
                    onChange={e => setShippingInfo({...shippingInfo, name: e.target.value})}
                    style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Delivery Address</label>
                  <input 
                    type="text" 
                    placeholder="Building, Street, Area" 
                    required 
                    value={shippingInfo.address}
                    onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})}
                    style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>City</label>
                    <input 
                      type="text" 
                      placeholder="Arusha" 
                      required 
                      value={shippingInfo.city}
                      onChange={e => setShippingInfo({...shippingInfo, city: e.target.value})}
                      style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Phone</label>
                    <input 
                      type="text" 
                      placeholder="07XXXXXXXX" 
                      required 
                      value={shippingInfo.phone}
                      onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ opacity: 0.6 }}>Subtotal</span>
                  <span>TSh {totalPrice.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <span style={{ opacity: 0.6 }}>Delivery</span>
                  <span style={{ color: 'var(--primary)' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>TSh {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={isSubmitting}
                style={{ background: 'var(--primary)', color: 'var(--midnight)', border: 'none', padding: '1.5rem', borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', transition: 'all 0.3s ease' }}
              >
                {isSubmitting ? 'Processing...' : 'Complete Secure Order'} <ArrowRight size={20} />
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', opacity: 0.5 }}>
                  <ShieldCheck size={16} /> <span>Secured by MiniWatch TLS</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', opacity: 0.5 }}>
                  <Truck size={16} /> <span>Insured Shipping Across Tanzania</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;