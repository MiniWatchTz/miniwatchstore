import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [reviewForm, setReviewForm] = useState({ user: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/products/' + id)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setActiveImage(data.images?.[0] || data.image);
        setLoading(false);
      });
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      if (res.ok) {
        const newReview = await res.json();
        setProduct((prev: any) => ({
          ...prev,
          reviews: [...(prev.reviews || []), newReview]
        }));
        setReviewForm({ user: '', rating: 5, comment: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className='container'>Loading timepiece details...</div>;
  if (!product) return <div className='container'>Watch not found.</div>;

  const images = product.images || [product.image];
  const reviews = product.reviews || [];

  return (
    <div className='container'>
      <Helmet>
        <title>{product.name} | MiniWatch Tanzania</title>
        <meta name="description" content={product.description.substring(0, 160)} />
        <meta property="og:title" content={`${product.name} | MiniWatch Tanzania`} />
        <meta property="og:description" content={product.description.substring(0, 160)} />
        <meta property="og:image" content={activeImage} />
      </Helmet>
      <button className='back-btn' onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Back to Shop
      </button>

      <div className='product-detail-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '4rem' }}>
        <div className='product-detail-image-gallery'>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <img src={activeImage} alt={product.name} style={{ width: '100%', display: 'block', transition: 'transform 0.5s ease' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            {images.map((img: string, i: number) => (
              <div 
                key={i} 
                onClick={() => setActiveImage(img)} 
                style={{ 
                  aspectRatio: '1', 
                  borderRadius: '0.5rem', 
                  overflow: 'hidden', 
                  cursor: 'pointer', 
                  border: activeImage === img ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: 'var(--card-bg)'
                }}
              >
                <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`${product.name} view ${i+1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className='product-detail-info' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className='product-category' style={{ textTransform: 'uppercase', letterSpacing: '0.2rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem', display: 'block' }}>{product.category}</span>
          <h1 className='detail-title' style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.1 }}>{product.name}</h1>
          <p className='detail-price' style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '2rem' }}>TSh {product.price.toLocaleString()}</p>
          <p className='detail-description' style={{ fontSize: '1.1rem', opacity: 0.8, lineHeight: 1.6, marginBottom: '2.5rem', whiteSpace: 'pre-line' }}>{product.description}</p>
          
          <button className='add-to-cart-large' onClick={() => addToCart(product)} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1.2rem 2.5rem', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', transition: 'all 0.3s ease' }}>
            <ShoppingCart size={20} /> Add to Cart
          </button>
        </div>
      </div>

      <div className='reviews-section' style={{ borderTop: '1px solid var(--border)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <h2 style={{ marginBottom: '3rem', fontSize: '2rem', textAlign: 'center' }}>Customer Experience</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '5rem' }}>
          <div>
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              Verified Feedback <span style={{ fontSize: '0.9rem', fontWeight: 400, opacity: 0.6 }}>({reviews.length})</span>
            </h3>
            {reviews.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
                <p style={{ opacity: 0.7 }}>No feedback yet. Be the first to share your experience with this timepiece.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {reviews.map((r: any) => (
                  <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{r.user}</span>
                      <div style={{ display: 'flex', color: 'var(--primary)' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill={i < r.rating ? "var(--primary)" : "none"} strokeWidth={1.5} />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '1.05rem', opacity: 0.8, lineHeight: 1.5, marginBottom: '1rem' }}>{r.comment}</p>
                    <span style={{ fontSize: '0.85rem', opacity: 0.5 }}>{new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
            <div style={{ background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '1rem', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Leave a Review</h3>
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8 }}>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Fadhili Sumayan" 
                    required 
                    value={reviewForm.user}
                    onChange={e => setReviewForm({...reviewForm, user: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8 }}>Rating</label>
                  <select 
                    value={reviewForm.rating}
                    onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'inherit' }}
                  >
                    {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8 }}>Your Thoughts</label>
                  <textarea 
                    placeholder="Describe the build quality, feel, and look..." 
                    required 
                    rows={4}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'inherit', resize: 'vertical' }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ 
                    background: 'var(--primary)', 
                    color: 'white', 
                    padding: '1rem', 
                    borderRadius: '0.5rem', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    marginTop: '0.5rem',
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  {submitting ? 'Sharing...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
