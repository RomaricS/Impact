import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">IMPACT <em>LEGENDS</em></div>
        <div className="login-sub">Admin Dashboard — sign in to continue</div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email}
                   onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password}
                   onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}
                  style={{ marginTop: '0.5rem' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <a href="/" style={{ fontSize: '0.78rem', color: 'var(--muted)', textDecoration: 'none' }}>← Back to site</a>
        </div>
      </div>
    </div>
  );
}
