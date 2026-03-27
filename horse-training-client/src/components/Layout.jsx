import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokens as t } from '../styles/tokens';

const navItems = [
  { path: '/dashboard', icon: '▤', label: 'Dashboard' },
  { path: '/horses', icon: '◈', label: 'Horses' },
  { path: '/sessions', icon: '◉', label: 'Sessions' },
  { path: '/competitions', icon: '◆', label: 'Competitions' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <div style={s.brandIcon}>✦</div>
          <div>
            <div style={s.brandName}>Equestrian OS</div>
            <div style={s.brandSub}>Training Platform</div>
          </div>
        </div>

        <nav style={s.nav}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                ...s.navItem,
                ...(active ? s.navItemActive : {})
              }}>
                <span style={s.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={s.userBox}>
          <div style={s.avatar}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div style={s.userInfo}>
            <div style={s.userName}>{user?.fullName}</div>
            <div style={s.userRole}>{user?.role}</div>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}
            title="Sign out">→</button>
        </div>
      </aside>

      <main style={s.main}>{children}</main>
    </div>
  );
}

const s = {
  shell: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: t.bg },
  sidebar: {
    width: '230px', backgroundColor: t.sidebar,
    display: 'flex', flexDirection: 'column',
    padding: '24px 16px', position: 'fixed',
    height: '100vh', top: 0, left: 0, boxSizing: 'border-box',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', paddingLeft: '4px' },
  brandIcon: {
    width: '30px', height: '30px', backgroundColor: t.accent,
    borderRadius: '6px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#fff', fontSize: '13px', flexShrink: 0,
  },
  brandName: { color: '#fff', fontSize: '13px', fontWeight: '600' },
  brandSub: { color: 'rgba(255,255,255,0.35)', fontSize: '11px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
    padding: '9px 12px', borderRadius: t.radiusSm,
    fontSize: '13px', transition: 'all 0.15s',
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
  },
  navIcon: { fontSize: '14px', width: '16px', textAlign: 'center' },
  userBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '16px', marginTop: '8px',
  },
  avatar: {
    width: '30px', height: '30px', borderRadius: '50%',
    backgroundColor: t.accent, color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '600', flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { color: '#fff', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { color: 'rgba(255,255,255,0.35)', fontSize: '11px' },
  logoutBtn: {
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
    cursor: 'pointer', fontSize: '16px', padding: '4px', flexShrink: 0,
  },
  main: { marginLeft: '230px', padding: '36px', flex: 1, minHeight: '100vh' },
};