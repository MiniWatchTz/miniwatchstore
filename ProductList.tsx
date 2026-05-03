import React, { useEffect, useState } from 'react';
import type { Product } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Truck, ShieldCheck, Watch } from 'lucide-react';

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    console.log('Fetching products from http://localhost:5000/api/products...');
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        console.log('Products received:', data);
        setProducts(data || []);
        setFilteredProducts(data || []);
        setLoading(false);
      }).catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = products;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  if (loading) return (
    <div className='container loading-container'>
      <div className='spinner'></div>
      <p style={{ fontWeight: 600, color: 'var(--primary)' }}>Unlocking The Vault...</p>
    </div>
  );

  return (
    <div className='home-container'>
      <section className='hero-banner'>
        <div className='container hero-content-split'>
          <div className='hero-text'>
            <span className='hero-badge'>Tanzania No. 1 Watch Shop</span>
            <h1>Timeless Style For Every Hand</h1>
            <p>Premium minimalist and luxury watches delivered to your door.</p>
            <div className='hero-actions' style={{ marginTop: '2rem' }}>
              <a href='#shop' className='btn-primary-large'>Shop the Collection</a>
            </div>
          </div>
        </div>
      </section>

      <section className='trust-badges' style={{ background: 'var(--midnight)', padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className='container' style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8' }}>
            <Truck color='var(--primary)' />
            <span>Fast Delivery Tanzania</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8' }}>
            <ShieldCheck color='var(--primary)' />
            <span>Official Warranty</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8' }}>
            <Watch color='var(--primary)' />
            <span>100% Authentic</span>
          </div>
        </div>
      </section>

      <div id='shop' className='container' style={{ paddingTop: '5rem', paddingBottom: '8rem' }}>
        <div className='section-header' style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase' }}>The Vault</h2>
            <div style={{ height: '4px', width: '60px', background: 'var(--primary)', marginTop: '0.5rem' }}></div>
          </div>
        </div>

        <div className='filter-bar'>
          <div className='search-input'>
            <Search className='search-icon' size={20} />
            <input 
              type='text' 
              placeholder='Search collection...' 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className='category-filter'>
            <Filter size={18} style={{ marginRight: '0.75rem', color: 'var(--primary)' }} />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <p style={{ fontSize: '1.2rem', opacity: 0.5 }}>No timepieces match your current search.</p>
          </div>
        ) : (
          <div className='product-grid'>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;