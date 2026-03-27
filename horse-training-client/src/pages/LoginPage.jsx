import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { tokens as t } from '../styles/tokens';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(
        { id: res.data.id, fullName: res.data.fullName, role: res.data.role },
        res.data.token
      );
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.brand}>
          <div style={s.brandIcon}>✦</div>
          <div>
            <div style={s.brandName}>Equestrian OS</div>
            <div style={s.brandSub}>Horse Training Platform</div>
          </div>
        </div>
        <div style={s.leftQuote}>
          "The horse is a mirror to your soul — and sometimes you might not
          like what you see."
        </div>
        <div style={s.leftAuthor}>— Buck Brannaman</div>
      </div>

      <div style={s.right}>
        <div style={s.formBox}>
          <h2 style={s.heading}>Welcome back</h2>
          <p style={s.subheading}>Sign in to your account to continue</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={s.label}>Email address</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={s.footer}>
            Don't have an account?{' '}
            <Link to="/register" style={s.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif',
  },
  left: {
    width: '42%', backgroundColor: t.sidebar,
    padding: '48px', display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  brandIcon: {
    width: '36px', height: '36px', backgroundColor: t.accent,
    borderRadius: '8px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#fff', fontSize: '16px',
  },
  brandName: {
    color: '#fff', fontSize: '15px', fontWeight: '600',
  },
  brandSub: {
    color: 'rgba(255,255,255,0.4)', fontSize: '12px',
  },
  leftQuote: {
    color: 'rgba(255,255,255,0.7)', fontSize: '18px',
    lineHeight: '1.7', fontStyle: 'italic', maxWidth: '340px',
  },
  leftAuthor: {
    color: t.accent, fontSize: '13px',
  },
  right: {
    flex: 1, backgroundColor: t.bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '48px',
  },
  formBox: { width: '100%', maxWidth: '380px' },
  heading: {
    margin: '0 0 6px', fontSize: '26px',
    fontWeight: '600', color: t.textPrimary,
  },
  subheading: {
    margin: '0 0 32px', color: t.textMuted, fontSize: '14px',
  },
  error: {
    backgroundColor: t.dangerLight, color: t.danger,
    padding: '10px 14px', borderRadius: t.radiusSm,
    marginBottom: '20px', fontSize: '13px',
  },
  label: {
    display: 'block', fontSize: '13px', fontWeight: '500',
    color: t.textPrimary, marginBottom: '6px', marginTop: '16px',
  },
  input: {
    width: '100%', padding: '11px 14px', borderRadius: t.radiusSm,
    border: `1.5px solid ${t.border}`, fontSize: '14px',
    boxSizing: 'border-box', backgroundColor: '#fff',
    color: t.textPrimary, outline: 'none',
  },
  btn: {
    width: '100%', padding: '13px', marginTop: '24px',
    backgroundColor: t.textPrimary, color: '#fff',
    border: 'none', borderRadius: t.radiusSm,
    fontSize: '14px', fontWeight: '500', cursor: 'pointer',
    letterSpacing: '0.02em',
  },
  footer: {
    textAlign: 'center', marginTop: '24px',
    fontSize: '13px', color: t.textMuted,
  },
  link: { color: t.accent, textDecoration: 'none', fontWeight: '500' },
};