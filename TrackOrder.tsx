import React, { useState } from 'react';
import { Search, MapPin, Package, Calendar, Clock } from 'lucide-react';

const TrackOrder: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;
    
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`http://localhost:5000/api/track/${trackingId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setError('Tracking ID not found. Please double-check your ID.');
      }
    } catch (err) {
      setError('System busy. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <div className="page-hero" style={{ marginBottom: '2rem' }}>
        <div className="hero-icon"><MapPin size={40} /></div>
        <h1>Track Your Watch</h1>
        <p className="breadcrumb">Home / Track Order</p>
      </div>

      <div className="page-content-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleTrack} className="admin-form" style={{ marginBottom: '2rem' }}>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Enter the Tracking ID provided after your purchase (e.g., MS-XXXXX).
          </p>
          <div className="search-input" style={{ margin: '0 0 1rem 0', maxWidth: '100%' }}>
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Enter Tracking ID..." 
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              style={{ paddingLeft: '3.5rem' }}
            />
          </div>
          <button type="submit" className="add-to-cart-btn" disabled={loading}>
            {loading ? 'Locating Order...' : 'Track My Order'}
          </button>
        </form>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {order && (
          <div className="tracking-results">
            <div className="status-banner" style={{ textAlign: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
              <span className={`status-badge ${order.status.toLowerCase()}`} style={{ fontSize: '1.2rem', padding: '0.5rem 1.5rem' }}>
                {order.status}
              </span>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Current order status as of today.</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Calendar color="var(--primary)" />
                <div>
                  <strong>Order Date</strong>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{new Date(order.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Package color="var(--primary)" />
                <div>
                  <strong>Items</strong>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{order.items.map((i: any) => i.name).join(', ')}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Clock color="var(--primary)" />
                <div>
                  <strong>Estimated Delivery</strong>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>24-48 Hours (Within Dar es Salaam)</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount Paid:</span>
              <h3 style={{ margin: '0.5rem 0 0' }}>TSh {order.totalPrice.toLocaleString()}</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;

