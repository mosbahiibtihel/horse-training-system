import { useEffect, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import Layout from '../components/Layout';
import api from '../api/axios';
import { tokens as t } from '../styles/tokens';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const chartDefaults = {
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false },
      ticks: { color: '#9A9A9A', font: { size: 11 } } },
    y: { grid: { color: '#F0F0F0' },
      ticks: { color: '#9A9A9A', font: { size: 11 } } }
  },
  maintainAspectRatio: false,
};

const roleGreeting = {
  Rider: 'Your training overview',
  Trainer: 'Your stable overview — all riders',
  StableManager: 'Full stable analytics',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout>
      <div style={s.loading}>Loading analytics...</div>
    </Layout>
  );

  const weeklyBarData = {
    labels: data?.weeklySessions.map(w => w.week) || [],
    datasets: [{
      data: data?.weeklySessions.map(w => w.count) || [],
      backgroundColor: t.accent + 'CC',
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  const intensityLineData = {
    labels: data?.intensityTrend.map(d => d.date) || [],
    datasets: [{
      data: data?.intensityTrend.map(d => d.averageIntensity) || [],
      borderColor: '#6C8EBF',
      backgroundColor: '#6C8EBF22',
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: '#6C8EBF',
      fill: true,
      tension: 0.4,
    }]
  };

  const typeColors = [
    '#C9A96E','#6C8EBF','#A8C5A0',
    '#C9A0C5','#BFA98C','#8CB5BF','#E5534B'
  ];

  const doughnutData = {
    labels: data?.sessionTypeBreakdown.map(s => s.sessionType) || [],
    datasets: [{
      data: data?.sessionTypeBreakdown.map(s => s.count) || [],
      backgroundColor: typeColors,
      borderWidth: 0,
    }]
  };

 const isRider = user?.role === 'Rider';
const isTrainer = user?.role === 'Trainer';
// eslint-disable-next-line no-unused-vars
const isManager = user?.role === 'StableManager';

const statCards = isRider ? [
  { label: 'My horses', value: data?.totalHorses ?? '—',
    icon: '◈', color: t.accent },
  { label: 'My sessions', value: data?.totalSessions ?? '—',
    icon: '◉', color: '#6C8EBF' },
  { label: 'This week', value: data?.sessionsThisWeek ?? '—',
    icon: '▤', color: '#A8C5A0' },
  { label: 'Avg intensity', value: data?.averageIntensity
      ? `${data.averageIntensity}/10` : '—',
    icon: '▲', color: '#C9A0C5' },
] : isTrainer ? [
  { label: 'Total horses', value: data?.totalHorses ?? '—',
    icon: '◈', color: t.accent },
  { label: 'All sessions', value: data?.totalSessions ?? '—',
    icon: '◉', color: '#6C8EBF' },
  { label: 'Sessions this week', value: data?.sessionsThisWeek ?? '—',
    icon: '▤', color: '#A8C5A0' },
  { label: 'Avg intensity', value: data?.averageIntensity
      ? `${data.averageIntensity}/10` : '—',
    icon: '▲', color: '#C9A0C5' },
] : [
  { label: 'Stable horses', value: data?.totalHorses ?? '—',
    icon: '◈', color: t.accent },
  { label: 'Total sessions', value: data?.totalSessions ?? '—',
    icon: '◉', color: '#6C8EBF' },
  { label: 'Active this week', value: data?.sessionsThisWeek ?? '—',
    icon: '▤', color: '#A8C5A0' },
  { label: 'Stable avg intensity', value: data?.averageIntensity
      ? `${data.averageIntensity}/10` : '—',
    icon: '▲', color: '#C9A0C5' },
];

  return (
    <Layout>
      <div style={s.topBar}>
        <div>
          <h1 style={s.title}>
            Good morning, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p style={s.subtitle}>
            {roleGreeting[user?.role] || 'Overview'} · Today
          </p>
        </div>
        <div style={s.roleBadge}>{user?.role}</div>
      </div>

      {/* Stat cards */}
      <div style={s.statsGrid}>
        {statCards.map((card, i) => (
          <div key={i} style={s.statCard}>
            <div style={s.statIcon(card.color)}>{card.icon}</div>
            <div style={s.statValue}>{card.value}</div>
            <div style={s.statLabel}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={s.chartsRow}>
        <div style={s.chartCard}>
          <div style={s.chartHeader}>
            <div style={s.chartTitle}>Sessions per week</div>
            <div style={s.chartSub}>Last 6 weeks</div>
          </div>
          <div style={s.chartWrap}>
            <Bar data={weeklyBarData} options={chartDefaults} />
          </div>
        </div>

        <div style={s.chartCard}>
          <div style={s.chartHeader}>
            <div style={s.chartTitle}>Intensity trend</div>
            <div style={s.chartSub}>Last 14 days</div>
          </div>
          <div style={s.chartWrap}>
            <Line data={intensityLineData} options={chartDefaults} />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={s.bottomRow}>

        {/* Doughnut */}
        <div style={s.doughnutCard}>
          <div style={s.chartHeader}>
            <div style={s.chartTitle}>Session types</div>
            <div style={s.chartSub}>All time breakdown</div>
          </div>
          {data?.sessionTypeBreakdown.length === 0 ? (
            <div style={s.empty}>No sessions yet</div>
          ) : (
            <>
              <div style={s.doughnutWrap}>
                <Doughnut data={doughnutData} options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: {
                        color: '#9A9A9A', font: { size: 11 },
                        padding: 12, boxWidth: 10,
                      }
                    }
                  },
                  cutout: '70%',
                }} />
              </div>
            </>
          )}
        </div>

        {/* Fitness scores */}
        <div style={s.fitnessCard}>
          <div style={s.chartHeader}>
            <div style={s.chartTitle}>Horse fitness scores</div>
            <div style={s.chartSub}>Based on last 30 days</div>
          </div>
          {data?.horseFitnessScores.length === 0 ? (
            <div style={s.empty}>No horses yet</div>
          ) : (
            <div style={s.fitnesslist}>
              {data?.horseFitnessScores.map((h, i) => (
                <div key={i} style={s.fitnessRow}>
                  <div style={s.fitnessName}>{h.horseName}</div>
                  <div style={s.fitnessBarWrap}>
                    <div style={s.fitnessBar(h.fitnessScore)} />
                  </div>
                  <div style={s.fitnessScore(h.fitnessScore)}>
                    {h.fitnessScore}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div style={s.recoCard}>
          <div style={s.chartHeader}>
            <div style={s.chartTitle}>Smart recommendations</div>
            <div style={s.chartSub}>AI-powered insights</div>
          </div>
          {data?.recommendations.length === 0 ? (
            <div style={s.empty}>
              No recommendations — training looks great! 🎉
            </div>
          ) : (
            <div style={s.recoList}>
              {data?.recommendations.map((r, i) => (
                <div key={i} style={s.recoItem(r.type)}>
                  <div style={s.recoIcon(r.type)}>
                    {r.type === 'warning' ? '⚠' : 'ℹ'}
                  </div>
                  <div style={s.recoText}>{r.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

const fitnessColor = (score) => {
  if (score >= 70) return '#3DAA6E';
  if (score >= 40) return '#C9A96E';
  return '#E5534B';
};

const s = {
  loading: { padding: '48px', textAlign: 'center',
    color: t.textMuted, fontSize: '14px' },
  topBar: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '28px' },
  title: { margin: '0 0 4px', fontSize: '22px',
    fontWeight: '600', color: t.textPrimary },
  subtitle: { margin: 0, fontSize: '13px', color: t.textMuted },
  roleBadge: { backgroundColor: t.accentLight, color: t.accent,
    padding: '6px 14px', borderRadius: '999px',
    fontSize: '12px', fontWeight: '500' },
  statsGrid: { display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '20px' },
  statCard: { backgroundColor: t.card, borderRadius: t.radius,
    padding: '20px', boxShadow: t.shadow },
  statIcon: (color) => ({
    width: '36px', height: '36px', borderRadius: t.radiusSm,
    backgroundColor: color + '18', color: color,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '16px', marginBottom: '14px',
  }),
  statValue: { fontSize: '26px', fontWeight: '600',
    color: t.textPrimary, marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: t.textMuted },
  chartsRow: { display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px', marginBottom: '16px' },
  chartCard: { backgroundColor: t.card, borderRadius: t.radius,
    padding: '20px', boxShadow: t.shadow },
  chartHeader: { marginBottom: '16px' },
  chartTitle: { fontSize: '14px', fontWeight: '600',
    color: t.textPrimary, marginBottom: '2px' },
  chartSub: { fontSize: '12px', color: t.textMuted },
  chartWrap: { height: '200px' },
  bottomRow: { display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' },
  doughnutCard: { backgroundColor: t.card, borderRadius: t.radius,
    padding: '20px', boxShadow: t.shadow },
  doughnutWrap: { height: '220px' },
  fitnessCard: { backgroundColor: t.card, borderRadius: t.radius,
    padding: '20px', boxShadow: t.shadow },
  fitnesslist: { display: 'flex', flexDirection: 'column', gap: '14px' },
  fitnessRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  fitnessName: { fontSize: '13px', color: t.textPrimary,
    width: '80px', flexShrink: 0,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  fitnessBarWrap: { flex: 1, height: '6px',
    backgroundColor: t.bg, borderRadius: '999px', overflow: 'hidden' },
  fitnessBar: (score) => ({
    height: '100%', width: `${score}%`,
    backgroundColor: fitnessColor(score),
    borderRadius: '999px', transition: 'width 0.6s ease',
  }),
  fitnessScore: (score) => ({
    fontSize: '13px', fontWeight: '600',
    color: fitnessColor(score), width: '28px', textAlign: 'right',
  }),
  recoCard: { backgroundColor: t.card, borderRadius: t.radius,
    padding: '20px', boxShadow: t.shadow },
  recoList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  recoItem: (type) => ({
    display: 'flex', gap: '10px', padding: '12px',
    borderRadius: t.radiusSm, alignItems: 'flex-start',
    backgroundColor: type === 'warning'
      ? '#FFF8EE' : '#F0F7FF',
    borderLeft: `3px solid ${type === 'warning' ? '#C9A96E' : '#6C8EBF'}`,
  }),
  recoIcon: (type) => ({
    fontSize: '14px', flexShrink: 0, marginTop: '1px',
    color: type === 'warning' ? '#C9A96E' : '#6C8EBF',
  }),
  recoText: { fontSize: '12px', color: t.textPrimary, lineHeight: '1.6' },
  empty: { fontSize: '13px', color: t.textMuted,
    padding: '24px 0', textAlign: 'center' },
};