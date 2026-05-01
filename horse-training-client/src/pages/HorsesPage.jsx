import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { tokens as t } from '../styles/tokens';
import { useAuth } from '../context/AuthContext';

const DISCIPLINES = [
  'Jumping', 'Dressage', 'Endurance', 'Racing', 'Groundwork', 'Hacking'
];

const disciplineColors = {
  Jumping: '#6C8EBF',
  Dressage: '#C9A0C5',
  Endurance: '#A8C5A0',
  Racing: '#C9A96E',
  Groundwork: '#BFA98C',
  Hacking: '#8CB5BF',
};

const emptyForm = {
  name: '', breed: '', age: '',
  gender: 'Male', discipline: 'Jumping',
  photoUrl: '', ownerId: ''
};

export default function HorsesPage() {
  const { user } = useAuth();
  const isManager = user?.role === 'StableManager';
  const [horses, setHorses] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchHorses();
    if (user?.role === 'StableManager') fetchRiders();
  }, []);

  const fetchHorses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/horses');
      setHorses(res.data);
    } catch { setError('Failed to load horses.'); }
    finally { setLoading(false); }
  };

  const fetchRiders = async () => {
    try {
      const res = await api.get('/horses/riders');
      setRiders(res.data);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const payload = {
        ...form,
        age: parseInt(form.age),
        ownerId: parseInt(form.ownerId)
      };
      if (editId) await api.put(`/horses/${editId}`, payload);
      else await api.post('/horses', payload);
      setSuccess(editId ? 'Horse updated.' : 'Horse added.');
      setShowForm(false); setForm(emptyForm); setEditId(null);
      fetchHorses();
    } catch { setError('Failed to save horse.'); }
  };

  const handleEdit = (horse) => {
    setForm({
      name: horse.name, breed: horse.breed, age: horse.age,
      gender: horse.gender, discipline: horse.discipline,
      photoUrl: horse.photoUrl || '', ownerId: horse.ownerId
    });
    setEditId(horse.id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await api.delete(`/horses/${id}`);
      setSuccess(`${name} deleted.`);
      fetchHorses();
    } catch { setError('Failed to delete horse.'); }
  };

  const color = (d) => disciplineColors[d] || t.accent;

  return (
    <Layout>
      <div style={s.topBar}>
        <div>
          <h1 style={s.title}>Horses</h1>
          <p style={s.subtitle}>
            {loading ? '—' : `${horses.length} horse${horses.length !== 1 ? 's' : ''} in your stable`}
          </p>
        </div>
        {isManager && (
          <button style={s.addBtn} onClick={() => {
            setShowForm(true); setEditId(null); setForm(emptyForm);
          }}>
            + Add horse
          </button>
        )}
      </div>

      {error && <div style={s.error}>{error}</div>}
      {success && <div style={s.successMsg}>{success}</div>}

      {showForm && isManager && (
        <div style={s.formCard}>
          <div style={s.formHeader}>
            <div>
              <div style={s.formTitle}>
                {editId ? 'Edit horse' : 'New horse'}
              </div>
              <div style={s.formSubtitle}>
                {editId ? 'Update horse details' : 'Register a new horse to your stable'}
              </div>
            </div>
            <button style={s.closeBtn}
              onClick={() => { setShowForm(false); setEditId(null); }}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={s.formGrid}>
              <div>
                <label style={s.label}>Name</label>
                <input style={s.input} type="text" placeholder="Thunder"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required />
              </div>
              <div>
                <label style={s.label}>Breed</label>
                <input style={s.input} type="text" placeholder="Arabian"
                  value={form.breed}
                  onChange={e => setForm({ ...form, breed: e.target.value })}
                  required />
              </div>
              <div>
                <label style={s.label}>Age</label>
                <input style={s.input} type="number" min="0" placeholder="5"
                  value={form.age}
                  onChange={e => setForm({ ...form, age: e.target.value })}
                  required />
              </div>
              <div>
                <label style={s.label}>Gender</label>
                <select style={s.input} value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Discipline</label>
                <select style={s.input} value={form.discipline}
                  onChange={e => setForm({ ...form, discipline: e.target.value })}>
                  {DISCIPLINES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={s.label}>Assign to Rider</label>
                <select style={s.input} value={form.ownerId}
                  onChange={e => setForm({ ...form, ownerId: e.target.value })}
                  required>
                  <option value="">Select a rider</option>
                  {riders.map(r => (
                    <option key={r.id} value={r.id}>{r.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={s.label}>Photo URL <span style={s.optional}>(optional)</span></label>
                <input style={s.input} type="text" placeholder="https://..."
                  value={form.photoUrl}
                  onChange={e => setForm({ ...form, photoUrl: e.target.value })} />
              </div>
            </div>

            <div style={s.formActions}>
              <button type="submit" style={s.saveBtn}>
                {editId ? 'Update horse' : 'Save horse'}
              </button>
              <button type="button" style={s.cancelBtn}
                onClick={() => { setShowForm(false); setEditId(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={s.empty}>Loading...</div>
      ) : horses.length === 0 && !showForm ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>◈</div>
          <div style={s.emptyText}>No horses yet</div>
          <div style={s.emptySubtext}>Add your first horse to get started</div>
        </div>
      ) : (
        <div style={s.grid}>
          {horses.map(horse => (
            <div key={horse.id} style={s.card}>

              {/* Color accent strip based on discipline */}
              <div style={s.cardStrip(color(horse.discipline))} />

              <div style={s.cardInner}>
                {/* Top row */}
                <div style={s.cardTop}>
                  <div style={s.cardAvatar(color(horse.discipline))}>
                    {horse.photoUrl
                      ? <img src={horse.photoUrl} alt={horse.name} style={s.avatarImg} />
                      : <span style={s.avatarInitial}>{horse.name.charAt(0)}</span>
                    }
                  </div>
                  <div style={s.cardTitle}>
                    <div style={s.horseName}>{horse.name}</div>
                    <div style={s.horseBreed}>{horse.breed}</div>
                  </div>
                  <span style={s.disciplinePill(color(horse.discipline))}>
                    {horse.discipline}
                  </span>
                </div>

                {/* Stats row */}
                <div style={s.statsRow}>
                  <div style={s.statBox}>
                    <div style={s.statValue}>{horse.age}</div>
                    <div style={s.statLabel}>Years old</div>
                  </div>
                  <div style={s.statDivider} />
                  <div style={s.statBox}>
                    <div style={s.statValue}>{horse.gender}</div>
                    <div style={s.statLabel}>Gender</div>
                  </div>
                  <div style={s.statDivider} />
                  <div style={s.statBox}>
                    <div style={s.statValue}>{horse.ownerName?.split(' ')[0] || '—'}</div>
                    <div style={s.statLabel}>Owner</div>
                  </div>
                </div>

                {/* Actions */}
                {isManager && (
                  <div style={s.cardFooter}>
                    <button style={s.editBtn}
                      onClick={() => handleEdit(horse)}>
                      Edit details
                    </button>
                    <button style={s.deleteBtn}
                      onClick={() => handleDelete(horse.id, horse.name)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

const s = {
  topBar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '28px',
  },
  title: {
    margin: '0 0 4px', fontSize: '22px',
    fontWeight: '600', color: t.textPrimary,
  },
  subtitle: { margin: 0, fontSize: '13px', color: t.textMuted },
  addBtn: {
    padding: '10px 18px', backgroundColor: t.textPrimary,
    color: '#fff', border: 'none', borderRadius: t.radiusSm,
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
  },
  error: {
    backgroundColor: t.dangerLight, color: t.danger,
    padding: '10px 14px', borderRadius: t.radiusSm,
    marginBottom: '16px', fontSize: '13px',
  },
  successMsg: {
    backgroundColor: '#EDF7F2', color: '#3DAA6E',
    padding: '10px 14px', borderRadius: t.radiusSm,
    marginBottom: '16px', fontSize: '13px',
  },
  formCard: {
    backgroundColor: t.card, borderRadius: t.radius,
    padding: '28px', marginBottom: '28px', boxShadow: t.shadow,
    borderTop: `3px solid ${t.accent}`,
  },
  formHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '24px',
  },
  formTitle: {
    fontSize: '16px', fontWeight: '600', color: t.textPrimary, marginBottom: '2px',
  },
  formSubtitle: { fontSize: '13px', color: t.textMuted },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '16px',
    color: t.textMuted, cursor: 'pointer',
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px',
  },
  label: {
    display: 'block', fontSize: '12px', fontWeight: '500',
    color: t.textMuted, marginBottom: '6px',
  },
  optional: { fontWeight: '400', color: t.textLight },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: t.radiusSm,
    border: `1.5px solid ${t.border}`, fontSize: '13px',
    boxSizing: 'border-box', backgroundColor: '#fff',
    color: t.textPrimary, outline: 'none',
  },
  formActions: { display: 'flex', gap: '10px', marginTop: '24px' },
  saveBtn: {
    padding: '11px 24px', backgroundColor: t.textPrimary,
    color: '#fff', border: 'none', borderRadius: t.radiusSm,
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
  },
  cancelBtn: {
    padding: '11px 24px', backgroundColor: 'transparent',
    color: t.textMuted, border: `1px solid ${t.border}`,
    borderRadius: t.radiusSm, fontSize: '13px', cursor: 'pointer',
  },
  empty: {
    textAlign: 'center', padding: '48px',
    color: t.textMuted, fontSize: '13px',
  },
  emptyState: {
    textAlign: 'center', padding: '60px 40px',
    backgroundColor: t.card, borderRadius: t.radius, boxShadow: t.shadow,
  },
  emptyIcon: { fontSize: '32px', color: t.textLight, marginBottom: '12px' },
  emptyText: {
    fontSize: '15px', fontWeight: '500',
    color: t.textPrimary, marginBottom: '4px',
  },
  emptySubtext: { fontSize: '13px', color: t.textMuted },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: t.card, borderRadius: t.radius,
    boxShadow: t.shadow, overflow: 'hidden',
  },
  cardStrip: (color) => ({ height: '3px', backgroundColor: color }),
  cardInner: { padding: '20px' },
  cardTop: {
    display: 'flex', alignItems: 'center',
    gap: '14px', marginBottom: '20px',
  },
  cardAvatar: (color) => ({
    width: '44px', height: '44px', borderRadius: '10px',
    backgroundColor: color + '22',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
  }),
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarInitial: {
    fontSize: '18px', fontWeight: '600', color: t.textPrimary,
  },
  cardTitle: { flex: 1, minWidth: 0 },
  horseName: {
    fontSize: '15px', fontWeight: '600',
    color: t.textPrimary, marginBottom: '2px',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  horseBreed: { fontSize: '12px', color: t.textMuted },
  disciplinePill: (color) => ({
    fontSize: '11px', padding: '4px 10px', borderRadius: '999px',
    backgroundColor: color + '18', color: color,
    fontWeight: '500', flexShrink: 0,
  }),
  statsRow: {
    display: 'flex', alignItems: 'center',
    backgroundColor: t.bg, borderRadius: t.radiusSm,
    padding: '12px 0', marginBottom: '16px',
  },
  statBox: { flex: 1, textAlign: 'center' },
  statValue: {
    fontSize: '14px', fontWeight: '600',
    color: t.textPrimary, marginBottom: '2px',
  },
  statLabel: { fontSize: '11px', color: t.textMuted },
  statDivider: {
    width: '1px', height: '28px', backgroundColor: t.border,
  },
  cardFooter: {
    display: 'flex', gap: '8px',
    paddingTop: '16px', borderTop: `1px solid ${t.border}`,
  },
  editBtn: {
    flex: 1, padding: '8px', background: 'none',
    border: `1px solid ${t.border}`, borderRadius: t.radiusSm,
    fontSize: '12px', color: t.textMuted, cursor: 'pointer',
  },
  deleteBtn: {
    padding: '8px 14px', background: 'none',
    border: `1px solid ${t.danger}`, borderRadius: t.radiusSm,
    fontSize: '12px', color: t.danger, cursor: 'pointer',
  },
};