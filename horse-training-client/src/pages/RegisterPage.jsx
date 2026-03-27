import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { tokens as t } from '../styles/tokens';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', role: 'Rider'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch {
      setError('Registration failed. Email may already exist.');
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
        <div>
          <div style={s.roleCard}>
            <div style={s.roleTitle}>🏇 Rider</div>
            <div style={s.roleDesc}>Track training, log sessions, monitor your horse's progress</div>
          </div>
          <div style={s.roleCard}>
            <div style={s.roleTitle}>🧑‍🏫 Trainer</div>
            <div style={s.roleDesc}>Supervise riders, create programs, give feedback</div>
          </div>
          <div style={s.roleCard}>
            <div style={s.roleTitle}>🏠 Stable Manager</div>
            <div style={s.roleDesc}>Manage horses, stalls, health records and analytics</div>
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.formBox}>
          <h2 style={s.heading}>Create your account</h2>
          <p style={s.subheading}>Join the platform in under a minute</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={s.label}>Full name</label>
            <input
              style={s.input} type="text" placeholder="John Smith"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              required
            />
            <label style={s.label}>Email address</label>
            <input
              style={s.input} type="email" placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <label style={s.label}>Password</label>
            <input
              style={s.input} type="password" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            <label style={s.label}>I am a</label>
            <div style={s.roleGroup}>
              {['Rider', 'Trainer', 'StableManager'].map(role => (
                <button
                  key={role} type="button"
                  style={{
                    ...s.roleBtn,
                    ...(form.role === role ? s.roleBtnActive : {})
                  }}
                  onClick={() => setForm({ ...form, role })}
                >
                  {role === 'StableManager' ? 'Stable Manager' : role}
                </button>
              ))}
            </div>
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p style={s.footer}>
            Already have an account?{' '}
            <Link to="/login" style={s.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  left: {
    width: '42%', backgroundColor: t.sidebar, padding: '48px',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '12px' },
  brandIcon: {
    width: '36px', height: '36px', backgroundColor: t.accent,
    borderRadius: '8px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#fff', fontSize: '16px',
  },
  brandName: { color: '#fff', fontSize: '15px', fontWeight: '600' },
  brandSub: { color: 'rgba(255,255,255,0.4)', fontSize: '12px' },
  roleCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: t.radiusSm, padding: '16px', marginBottom: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  roleTitle: { color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '4px' },
  roleDesc: { color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: '1.5' },
  right: {
    flex: 1, backgroundColor: t.bg,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '48px',
  },
  formBox: { width: '100%', maxWidth: '380px' },
  heading: { margin: '0 0 6px', fontSize: '26px', fontWeight: '600', color: t.textPrimary },
  subheading: { margin: '0 0 32px', color: t.textMuted, fontSize: '14px' },
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
  roleGroup: { display: 'flex', gap: '8px', marginTop: '6px' },
  roleBtn: {
    flex: 1, padding: '9px 6px', borderRadius: t.radiusSm,
    border: `1.5px solid ${t.border}`, backgroundColor: '#fff',
    fontSize: '12px', cursor: 'pointer', color: t.textMuted,
  },
  roleBtnActive: {
    borderColor: t.accent, backgroundColor: t.accentLight,
    color: t.textPrimary, fontWeight: '500',
  },
  btn: {
    width: '100%', padding: '13px', marginTop: '24px',
    backgroundColor: t.textPrimary, color: '#fff', border: 'none',
    borderRadius: t.radiusSm, fontSize: '14px',
    fontWeight: '500', cursor: 'pointer',
  },
  footer: { textAlign: 'center', marginTop: '24px', fontSize: '13px', color: t.textMuted },
  link: { color: t.accent, textDecoration: 'none', fontWeight: '500' },
};