import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, ClipboardList, Plus, LogOut, Trash2, Edit2, 
  Upload, FileText, X, Settings as SettingsIcon, 
  UserPlus, Users, Save, BarChart3, TrendingUp, DollarSign, ShoppingBag
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pages, setPages] = useState<any>({});
  const [selectedPage, setSelectedPage] = useState('about');
  const [pageEdit, setPageEdit] = useState({ title: '', content: '' });
  const [isEditing, setIsEditing] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState<any>({ name: '', price: '', description: '', images: [], category: '' });
  const [userForm, setUserForm] = useState({ username: '', password: '' });
  const [admins, setAdmins] = useState([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem('adminToken')) navigate('/login');
    fetchProducts();
    fetchPages();
    fetchAdmins();
    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'pages') fetchPageData(selectedPage);
    if (activeTab === 'settings') fetchAdmins();
  }, [activeTab, selectedPage]);

  const fetchProducts = () => fetch('http://localhost:5000/api/products').then(res => res.json()).then(setProducts);
  const fetchOrders = () => fetch('http://localhost:5000/api/orders').then(res => res.json()).then(setOrders);
  const fetchAdmins = () => fetch('http://localhost:5000/api/admin/list').then(res => res.json()).then(setAdmins);
  const fetchPages = () => fetch('http://localhost:5000/api/pages').then(res => res.json()).then(setPages);
  const fetchPageData = (slug: string) => fetch('http://localhost:5000/api/pages/' + slug).then(res => res.json()).then(setPageEdit);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach(f => formData.append('images', f));
    try {
      const res = await fetch('http://localhost:5000/api/upload-multiple', { method: 'POST', body: formData });
      const { imageUrls } = await res.json();
      if (isEditing) {
        setIsEditing({ ...isEditing, images: [...isEditing.images, ...imageUrls] });
      } else {
        setNewProduct({ ...newProduct, images: [...newProduct.images, ...imageUrls] });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    const url = isEditing ? `http://localhost:5000/api/products/${isEditing.id}` : 'http://localhost:5000/api/products';
    await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEditing || newProduct)
    });
    setIsEditing(null);
    setNewProduct({ name: '', price: '', description: '', images: [], category: '' });
    fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    if (confirm('Delete this timepiece?')) {
      await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    await fetch(`http://localhost:5000/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  // Analytics Logic
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);
  const orderData = orders.slice(-7).map((o: any) => ({
    date: new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: o.totalPrice
  }));

  const COLORS = ['#c5a059', '#0f172a', '#334155', '#475569', '#94a3b8'];

  return (
    <div className='admin-layout' style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      <aside className='admin-sidebar' style={{ width: '280px', background: '#0f172a', color: 'white', padding: '2rem 1.5rem', position: 'fixed', height: '100vh' }}>
        <h2 style={{ color: '#c5a059', marginBottom: '2.5rem', fontSize: '1.5rem', fontWeight: 700 }}>MiniWatch Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'products', label: 'Inventory', icon: Package },
            { id: 'orders', label: 'Orders', icon: ClipboardList },
            { id: 'pages', label: 'CMS Pages', icon: FileText },
            { id: 'settings', label: 'Security', icon: SettingsIcon }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '0.75rem',
                border: 'none', background: activeTab === tab.id ? '#c5a059' : 'transparent',
                color: activeTab === tab.id ? '#0f172a' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, textAlign: 'left'
              }}
            >
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
          <button 
            onClick={() => { sessionStorage.clear(); navigate('/login'); }}
            style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
          >
            <LogOut size={20} /> Exit System
          </button>
        </nav>
      </aside>

      <main className='admin-main' style={{ marginLeft: '280px', flex: 1, padding: '3rem' }}>
        {activeTab === 'dashboard' && (
          <div className='fade-in'>
            <h1 style={{ marginBottom: '2rem' }}>Performance Overview</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
              {[
                { label: 'Total Revenue', value: `TSh ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#10b981' },
                { label: 'Orders', value: orders.length, icon: ShoppingBag, color: '#3b82f6' },
                { label: 'Products', value: products.length, icon: Package, color: '#f59e0b' },
                { label: 'Growth', value: '+12.5%', icon: TrendingUp, color: '#8b5cf6' }
              ].map((stat, i) => (
                <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ background: `${stat.color}20`, padding: '0.5rem', borderRadius: '0.5rem' }}>
                      <stat.icon size={24} color={stat.color} />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>{stat.label}</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</h3>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '2rem' }}>Sales Trend (Recent)</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orderData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#c5a059" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '2rem' }}>Inventory Status</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'In Stock', value: products.length },
                          { name: 'Out of Stock', value: 2 }, // Mock
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className='fade-in'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h1>Timepiece Vault</h1>
              <button onClick={() => setIsEditing({ name: '', price: '', description: '', images: [], category: '' })} style={{ background: '#c5a059', color: '#0f172a', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Plus size={20} /> Add New Watch
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {products.map((p: any) => (
                <div key={p.id} style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                  <img src={p.images?.[0] || p.image} alt={p.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#c5a059', fontWeight: 700, textTransform: 'uppercase' }}>{p.category}</span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>{p.name}</h3>
                      </div>
                      <p style={{ fontWeight: 700, color: '#0f172a' }}>TSh {p.price.toLocaleString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                      <button onClick={() => setIsEditing(p)} style={{ flex: 1, background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Edit2 size={16} /> Edit
                      </button>
                      <button onClick={() => deleteProduct(p.id)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className='fade-in'>
            <h1 style={{ marginBottom: '2.5rem' }}>Transaction Registry</h1>
            <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '1.25rem' }}>Tracking ID</th>
                    <th style={{ textAlign: 'left', padding: '1.25rem' }}>Client</th>
                    <th style={{ textAlign: 'left', padding: '1.25rem' }}>Total</th>
                    <th style={{ textAlign: 'left', padding: '1.25rem' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '1.25rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o: any) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1.25rem', fontWeight: 600 }}>{o.trackingId}</td>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ fontWeight: 600 }}>{o.shipping.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{o.shipping.phone}</div>
                      </td>
                      <td style={{ padding: '1.25rem', fontWeight: 700 }}>TSh {o.totalPrice.toLocaleString()}</td>
                      <td style={{ padding: '1.25rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600,
                          background: o.status === 'Delivered' ? '#dcfce7' : '#fef9c3',
                          color: o.status === 'Delivered' ? '#166534' : '#854d0e'
                        }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                        <select 
                          value={o.status} 
                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CMS Tab */}
        {activeTab === 'pages' && (
          <div className='fade-in' style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h1 style={{ marginBottom: '2rem' }}>Global CMS Editor</h1>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              {['about', 'contact', 'policy'].map(slug => (
                <button key={slug} onClick={() => setSelectedPage(slug)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', background: selectedPage === slug ? '#c5a059' : '#f1f5f9', cursor: 'pointer', fontWeight: 600 }}>
                  {slug.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input value={pageEdit.title} onChange={e => setPageEdit({...pageEdit, title: e.target.value})} placeholder="Page Title" style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '1.1rem' }} />
              <textarea value={pageEdit.content} onChange={e => setPageEdit({...pageEdit, content: e.target.value})} placeholder="Content" rows={15} style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', lineHeight: 1.6 }} />
              <button onClick={async () => { await fetch(`http://localhost:5000/api/pages/${selectedPage}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pageEdit) }); alert('Page Published'); }} style={{ background: '#0f172a', color: 'white', padding: '1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
                <Save size={20} /> Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Security/Settings Tab */}
        {activeTab === 'settings' && (
          <div className='fade-in'>
            <h1 style={{ marginBottom: '2.5rem' }}>Security Protocol</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', height: 'fit-content' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>{editingUser ? 'Update Credentials' : 'Add New Admin'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} placeholder="Username" style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                  <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} placeholder="Secure Password" style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                  <button 
                    onClick={async () => {
                      const method = editingUser ? 'PUT' : 'POST';
                      const body = editingUser ? { oldUsername: editingUser.username, newUsername: userForm.username, password: userForm.password } : userForm;
                      await fetch(`http://localhost:5000/api/admin/${editingUser ? 'edit' : 'add'}`, {
                        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
                      });
                      setUserForm({ username: '', password: '' });
                      setEditingUser(null);
                      fetchAdmins();
                    }}
                    style={{ background: '#c5a059', color: '#0f172a', padding: '1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {editingUser ? 'Commit Changes' : 'Initialize Access'}
                  </button>
                  {editingUser && <button onClick={() => { setEditingUser(null); setUserForm({ username: '', password: '' }); }} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>}
                </div>
              </div>

              <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Active Administrators</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {admins.map((a: any) => (
                    <div key={a.username} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#c5a05920', padding: '0.5rem', borderRadius: '50%' }}><Users size={20} color="#c5a059" /></div>
                        <span style={{ fontWeight: 600 }}>{a.username}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { setEditingUser(a); setUserForm({ username: a.username, password: a.password }); }} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}><Edit2 size={16} /></button>
                        <button 
                          onClick={async () => {
                            if (confirm('Revoke access?')) {
                              await fetch(`http://localhost:5000/api/admin/remove/${a.username}`, { method: 'DELETE' });
                              fetchAdmins();
                            }
                          }}
                          style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer' }}
                        ><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Product Modal */}
      {isEditing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '1.5rem', padding: '3rem', position: 'relative' }}>
            <button onClick={() => setIsEditing(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '2.5rem' }}>{isEditing.id ? 'Refine Timepiece' : 'Register New Timepiece'}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Model Name</label>
                  <input value={isEditing.name} onChange={e => setIsEditing({...isEditing, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Valuation (TSh)</label>
                  <input type="number" value={isEditing.price} onChange={e => setIsEditing({...isEditing, price: Number(e.target.value)})} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Collection/Category</label>
                  <input value={isEditing.category} onChange={e => setIsEditing({...isEditing, category: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Artistic Description</label>
                  <textarea rows={6} value={isEditing.description} onChange={e => setIsEditing({...isEditing, description: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', resize: 'vertical' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600 }}>Visual Assets (Up to 5)</label>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
                  <input type="file" multiple onChange={handleUpload} style={{ display: 'none' }} id="asset-upload" />
                  <label htmlFor="asset-upload" style={{ cursor: 'pointer', color: '#c5a059', fontWeight: 700 }}>
                    <Upload size={32} style={{ marginBottom: '0.5rem' }} />
                    <p>{uploading ? 'Processing Assets...' : 'Upload Timepiece Images'}</p>
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {isEditing.images?.map((img: string, i: number) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.5rem', overflow: 'hidden' }}>
                      <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => setIsEditing({...isEditing, images: isEditing.images.filter((_: any, idx: number) => idx !== i)})} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 10 }}>X</button>
                    </div>
                  ))}
                </div>
                <button onClick={handleSaveProduct} style={{ marginTop: 'auto', background: '#0f172a', color: 'white', padding: '1.2rem', borderRadius: '0.75rem', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                  Confirm Registry Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
