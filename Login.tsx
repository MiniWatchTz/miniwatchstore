import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (data.success) {
      sessionStorage.setItem('adminToken', data.token);
      sessionStorage.setItem('adminUser', data.username);
      navigate('/admin');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="container">
      <div className="admin-form" style={{ marginTop: '4rem', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Lock size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h2>Admin Login</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to access dashboard</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          {error && <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="add-to-cart-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

