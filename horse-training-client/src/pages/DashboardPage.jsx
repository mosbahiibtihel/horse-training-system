import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { tokens as t } from '../styles/tokens';

const stats = [
  { icon: '◈', label: 'Horses', value: '—', color: t.accent },
  { icon: '◉', label: 'Sessions this week', value: '—', color: '#6C8EBF' },
  { icon: '◆', label: 'Competitions', value: '—', color: '#A8C5A0' },
  { icon: '▲', label: 'Fitness avg.', value: '—', color: '#C9A0C5' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Layout>
      <div style={s.topBar}>
        <div>
          <h1 style={s.title}>Good morning, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p style={s.subtitle}>Here's what's happening with your horses today.</p>
        </div>
        <div style={s.badge}>{user?.role}</div>
      </div>

      <div style={s.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={s.statCard}>
            <div style={{ ...s.statIcon, backgroundColor: stat.color + '18', color: stat.color }}>
              {stat.icon}
            </div>
            <div style={s.statValue}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={s.row}>
        <div style={s.panel}>
          <div style={s.panelHeader}>Recent sessions</div>
          <div style={s.empty}>No sessions yet — start logging training to see activity here.</div>
        </div>
        <div style={s.panel}>
          <div style={s.panelHeader}>Upcoming</div>
          <div style={s.empty}>No upcoming events scheduled.</div>
        </div>
      </div>
    </Layout>
  );
}

const s = {
  topBar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '32px',
  },
  title: { margin: '0 0 4px', fontSize: '22px', fontWeight: '600', color: t.textPrimary },
  subtitle: { margin: 0, fontSize: '13px', color: t.textMuted },
  badge: {
    backgroundColor: t.accentLight, color: t.accent,
    padding: '6px 14px', borderRadius: '999px',
    fontSize: '12px', fontWeight: '500',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '28px',
  },
  statCard: {
    backgroundColor: t.card, borderRadius: t.radius,
    padding: '20px', boxShadow: t.shadow,
  },
  statIcon: {
    width: '36px', height: '36px', borderRadius: t.radiusSm,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', marginBottom: '14px',
  },
  statValue: { fontSize: '26px', fontWeight: '600', color: t.textPrimary, marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: t.textMuted },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  panel: {
    backgroundColor: t.card, borderRadius: t.radius,
    padding: '20px', boxShadow: t.shadow,
  },
  panelHeader: {
    fontSize: '13px', fontWeight: '600', color: t.textPrimary,
    marginBottom: '16px', paddingBottom: '12px',
    borderBottom: `1px solid ${t.border}`,
  },
  empty: { fontSize: '13px', color: t.textMuted, lineHeight: '1.6' },
};