import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ThemeSwitch from '../components/ThemeSwitch';

export default function LoginPage({ theme, toggleTheme }) {
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
      <div className="login-form-side">
        <img src="/logo-wide.png" alt="Impact Legends Volleyball" className="login-logo" />
        <div>
          <h1 className="login-title">Admin sign in</h1>
          <p className="login-sub">Manage teams, sponsors, announcements and site settings.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error" role="alert">{error}</div>}
          <div className="ad-field">
            <label className="ad-label" htmlFor="lg-email">Email</label>
            <input id="lg-email" className="ad-input" type="email" autoComplete="username" placeholder="you@example.com"
                   value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="ad-field">
            <label className="ad-label" htmlFor="lg-pw">Password</label>
            <input id="lg-pw" className="ad-input" type="password" autoComplete="current-password"
                   value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="ad-btn ad-btn-primary ad-btn-lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="login-note">Accounts are created by the club. Need access or a password reset? Ask the site owner.</p>
        </form>

        <div className="login-foot">
          <a href="/">← Back to the public site</a>
          <div className="theme-switch-row">
            <span>Dark mode</span>
            <ThemeSwitch theme={theme} onToggle={toggleTheme} variant="switch" />
          </div>
        </div>
      </div>

      <div className="login-brand" aria-hidden="true">
        <svg viewBox="0 0 640 900" preserveAspectRatio="xMidYMid slice" className="login-art">
          <g fill="none" stroke="#e84388" strokeWidth="20" strokeLinecap="round" className="login-spin">
            <path d="M 90 430 A 230 230 0 0 1 320 200" /><path d="M 550 430 A 230 230 0 0 1 320 660" />
          </g>
          <g fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.75">
            <path d="M -20 700 L 660 600" /><path d="M -20 820 L 660 700" />
            <path d="M 300 656 L 300 380 M 300 380 L 660 330 M 300 430 L 660 384" />
          </g>
          <path d="M 40 760 Q 300 -160 600 520" fill="none" stroke="#0d1117" strokeWidth="3" strokeDasharray="14 14" strokeLinecap="round" />
        </svg>
        <div className="login-card">
          <div className="login-card-title">One place to run the club site.</div>
          <p>Rosters, tournaments, practices, sponsors, announcements, community campaigns and payment settings.</p>
        </div>
      </div>
    </div>
  );
}
