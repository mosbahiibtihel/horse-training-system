import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { tokens as t } from '../styles/tokens';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Show Jumping', 'Dressage', 'Eventing',
  'Endurance', 'Racing', 'Reining'
];

const emptyComp = {
  name: '', location: '', date: '', category: 'Show Jumping', description: ''
};

const emptyResult = {
  horseId: '', riderId: '', ranking: '',
  jumpHeight: '', time: '', notes: ''
};

const categoryColors = {
  'Show Jumping': '#6C8EBF',
  'Dressage': '#C9A0C5',
  'Eventing': '#A8C5A0',
  'Endurance': '#C9A96E',
  'Racing': '#E5534B',
  'Reining': '#BFA98C',
};

export default function CompetitionsPage() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [horses, setHorses] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompForm, setShowCompForm] = useState(false);
  const [compForm, setCompForm] = useState(emptyComp);
  const [resultForms, setResultForms] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAll();
    fetchHorses();
    fetchRiders();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await api.get('/competitions');
      setCompetitions(res.data);
    } catch { setError('Failed to load competitions.'); }
    finally { setLoading(false); }
  };

  const fetchHorses = async () => {
    try {
      const res = await api.get('/horses');
      setHorses(res.data);
    // eslint-disable-next-line no-empty
    } catch {}
  };

  const fetchRiders = async () => {
    try {
      const res = await api.get('/horses/riders');
      setRiders(res.data);
    } catch {}
  };

  const handleCreateComp = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/competitions', compForm);
      setSuccess('Competition created.');
      setShowCompForm(false);
      setCompForm(emptyComp);
      fetchAll();
    } catch { setError('Failed to create competition.'); }
  };

  const handleDeleteComp = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await api.delete(`/competitions/${id}`);
      setSuccess('Competition deleted.');
      fetchAll();
    } catch { setError('Failed to delete.'); }
  };

  const handleAddResult = async (e, compId) => {
    e.preventDefault();
    const form = resultForms[compId] || emptyResult;
    try {
      await api.post(`/competitions/${compId}/results`, {
        horseId: parseInt(form.horseId),
        riderId: parseInt(form.riderId),
        ranking: parseInt(form.ranking),
        jumpHeight: form.jumpHeight ? parseFloat(form.jumpHeight) : null,
        time: form.time ? parseFloat(form.time) : null,
        notes: form.notes || null
      });
      setSuccess('Result added.');
      setResultForms(prev => ({ ...prev, [compId]: emptyResult }));
      fetchAll();
    } catch { setError('Failed to add result.'); }
  };

  const handleDeleteResult = async (compId, resultId) => {
    try {
      await api.delete(`/competitions/${compId}/results/${resultId}`);
      setSuccess('Result removed.');
      fetchAll();
    } catch { setError('Failed to remove result.'); }
  };

  const color = (cat) => categoryColors[cat] || t.accent;

  const rankingIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const isManager = user?.role === 'StableManager' || user?.role === 'Trainer';

  return (
    <Layout>
      <div style={s.topBar}>
        <div>
          <h1 style={s.title}>Competitions</h1>
          <p style={s.subtitle}>
            {competitions.length} competition{competitions.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        {isManager && (
          <button style={s.addBtn} onClick={() => setShowCompForm(true)}>
            + Add competition
          </button>
        )}
      </div>

      {error && <div style={s.error}>{error}</div>}
      {success && <div style={s.successMsg}>{success}</div>}

      {showCompForm && (
        <div style={s.formCard}>
          <div style={s.formHeader}>
            <div>
              <div style={s.formTitle}>New competition</div>
              <div style={s.formSub}>Add a competition to the calendar</div>
            </div>
            <button style={s.closeBtn}
              onClick={() => setShowCompForm(false)}>✕</button>
          </div>
          <form onSubmit={handleCreateComp}>
            <div style={s.formGrid}>
              <div>
                <label style={s.label}>Competition name</label>
                <input style={s.input} placeholder="Spring Classic 2026"
                  value={compForm.name}
                  onChange={e => setCompForm({...compForm, name: e.target.value})}
                  required />
              </div>
              <div>
                <label style={s.label}>Location</label>
                <input style={s.input} placeholder="Paris, France"
                  value={compForm.location}
                  onChange={e => setCompForm({...compForm, location: e.target.value})}
                  required />
              </div>
              <div>
                <label style={s.label}>Date</label>
                <input style={s.input} type="datetime-local"
                  value={compForm.date}
                  onChange={e => setCompForm({...compForm, date: e.target.value})}
                  required />
              </div>
              <div>
                <label style={s.label}>Category</label>
                <select style={s.input} value={compForm.category}
                  onChange={e => setCompForm({...compForm, category: e.target.value})}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={s.label}>Description <span style={s.optional}>(optional)</span></label>
                <input style={s.input} placeholder="Details about the competition..."
                  value={compForm.description}
                  onChange={e => setCompForm({...compForm, description: e.target.value})} />
              </div>
            </div>
            <div style={s.formActions}>
              <button type="submit" style={s.saveBtn}>Create competition</button>
              <button type="button" style={s.cancelBtn}
                onClick={() => setShowCompForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={s.empty}>Loading...</div>
      ) : competitions.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>◆</div>
          <div style={s.emptyText}>No competitions yet</div>
          <div style={s.emptySubtext}>
            {isManager
              ? 'Add your first competition to start tracking results'
              : 'No competitions have been added yet'}
          </div>
        </div>
      ) : (
        <div style={s.list}>
          {competitions.map(comp => (
            <div key={comp.id} style={s.card}>
              <div style={s.cardStrip(color(comp.category))} />
              <div style={s.cardInner}>

                <div style={s.cardTop}>
                  <div style={s.cardLeft}>
                    <div style={s.dateBox(color(comp.category))}>
                      <div style={s.dateDay}>
                        {new Date(comp.date).toLocaleDateString('en-US', { day: '2-digit' })}
                      </div>
                      <div style={s.dateMonth}>
                        {new Date(comp.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                    <div>
                      <div style={s.compName}>{comp.name}</div>
                      <div style={s.compMeta}>
                        📍 {comp.location} ·{' '}
                        <span style={s.categoryPill(color(comp.category))}>
                          {comp.category}
                        </span>
                      </div>
                      {comp.description && (
                        <div style={s.compDesc}>{comp.description}</div>
                      )}
                    </div>
                  </div>

                  <div style={s.cardRight}>
                    <div style={s.resultCount}>
                      <span style={s.resultNum}>{comp.resultCount}</span>
                      <span style={s.resultLabel}>results</span>
                    </div>
                    <div style={s.cardActions}>
                      <button style={s.expandBtn}
                        onClick={() => setExpanded(
                          expanded === comp.id ? null : comp.id)}>
                        {expanded === comp.id ? 'Hide ▲' : 'View ▼'}
                      </button>
                      {isManager && (
                        <button style={s.deleteBtn}
                          onClick={() => handleDeleteComp(comp.id, comp.name)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {expanded === comp.id && (
                  <div style={s.expandedSection}>

                    {/* Results table */}
                    {comp.results.length > 0 && (
                      <div style={s.resultsTable}>
                        <div style={s.tableHeader}>
                          <span style={s.th}>Rank</span>
                          <span style={s.th}>Horse</span>
                          <span style={s.th}>Rider</span>
                          <span style={s.th}>Jump height</span>
                          <span style={s.th}>Time</span>
                          <span style={s.th}>Notes</span>
                          {isManager && <span style={s.th} />}
                        </div>
                        {comp.results.map(r => (
                          <div key={r.id} style={s.tableRow}>
                            <span style={s.td}>
                              <span style={s.rankBadge}>
                                {rankingIcon(r.ranking)}
                              </span>
                            </span>
                            <span style={s.tdBold}>{r.horseName}</span>
                            <span style={s.td}>{r.riderName}</span>
                            <span style={s.td}>
                              {r.jumpHeight ? `${r.jumpHeight}m` : '—'}
                            </span>
                            <span style={s.td}>
                              {r.time ? `${r.time}s` : '—'}
                            </span>
                            <span style={s.td}>{r.notes || '—'}</span>
                            {isManager && (
                              <span style={s.td}>
                                <button style={s.removeBtn}
                                  onClick={() =>
                                    handleDeleteResult(comp.id, r.id)}>
                                  ✕
                                </button>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add result form */}
                    <div style={s.resultForm}>
                      <div style={s.resultFormTitle}>Add result</div>
                      <form onSubmit={e => handleAddResult(e, comp.id)}>
                        <div style={s.resultGrid}>
                          <div>
                            <label style={s.label}>Horse</label>
                            <select style={s.input}
                              value={resultForms[comp.id]?.horseId || ''}
                              onChange={e => setResultForms(prev => ({
                                ...prev,
                                [comp.id]: {
                                  ...(prev[comp.id] || emptyResult),
                                  horseId: e.target.value
                                }
                              }))} required>
                              <option value="">Select horse</option>
                              {horses.map(h => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={s.label}>Rider</label>
                            <select style={s.input}
                              value={resultForms[comp.id]?.riderId || ''}
                              onChange={e => setResultForms(prev => ({
                                ...prev,
                                [comp.id]: {
                                  ...(prev[comp.id] || emptyResult),
                                  riderId: e.target.value
                                }
                              }))} required>
                              <option value="">Select rider</option>
                              {riders.map(r => (
                                <option key={r.id} value={r.id}>{r.fullName}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={s.label}>Ranking</label>
                            <input style={s.input} type="number" min="1"
                              placeholder="1"
                              value={resultForms[comp.id]?.ranking || ''}
                              onChange={e => setResultForms(prev => ({
                                ...prev,
                                [comp.id]: {
                                  ...(prev[comp.id] || emptyResult),
                                  ranking: e.target.value
                                }
                              }))} required />
                          </div>
                          <div>
                            <label style={s.label}>Jump height (m)</label>
                            <input style={s.input} type="number"
                              step="0.05" placeholder="1.20"
                              value={resultForms[comp.id]?.jumpHeight || ''}
                              onChange={e => setResultForms(prev => ({
                                ...prev,
                                [comp.id]: {
                                  ...(prev[comp.id] || emptyResult),
                                  jumpHeight: e.target.value
                                }
                              }))} />
                          </div>
                          <div>
                            <label style={s.label}>Time (s)</label>
                            <input style={s.input} type="number"
                              step="0.01" placeholder="62.45"
                              value={resultForms[comp.id]?.time || ''}
                              onChange={e => setResultForms(prev => ({
                                ...prev,
                                [comp.id]: {
                                  ...(prev[comp.id] || emptyResult),
                                  time: e.target.value
                                }
                              }))} />
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={s.label}>Notes</label>
                            <input style={s.input} placeholder="Clean round, no faults..."
                              value={resultForms[comp.id]?.notes || ''}
                              onChange={e => setResultForms(prev => ({
                                ...prev,
                                [comp.id]: {
                                  ...(prev[comp.id] || emptyResult),
                                  notes: e.target.value
                                }
                              }))} />
                          </div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                          <button type="submit" style={s.saveBtn}>
                            Add result
                          </button>
                        </div>
                      </form>
                    </div>
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
  topBar: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '28px' },
  title: { margin: '0 0 4px', fontSize: '22px',
    fontWeight: '600', color: t.textPrimary },
  subtitle: { margin: 0, fontSize: '13px', color: t.textMuted },
  addBtn: { padding: '10px 18px', backgroundColor: t.textPrimary,
    color: '#fff', border: 'none', borderRadius: t.radiusSm,
    fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  error: { backgroundColor: t.dangerLight, color: t.danger,
    padding: '10px 14px', borderRadius: t.radiusSm,
    marginBottom: '16px', fontSize: '13px' },
  successMsg: { backgroundColor: '#EDF7F2', color: '#3DAA6E',
    padding: '10px 14px', borderRadius: t.radiusSm,
    marginBottom: '16px', fontSize: '13px' },
  formCard: { backgroundColor: t.card, borderRadius: t.radius,
    padding: '28px', marginBottom: '24px', boxShadow: t.shadow,
    borderTop: `3px solid ${t.accent}` },
  formHeader: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '24px' },
  formTitle: { fontSize: '16px', fontWeight: '600',
    color: t.textPrimary, marginBottom: '2px' },
  formSub: { fontSize: '13px', color: t.textMuted },
  closeBtn: { background: 'none', border: 'none',
    fontSize: '16px', color: t.textMuted, cursor: 'pointer' },
  formGrid: { display: 'grid',
    gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '500',
    color: t.textMuted, marginBottom: '6px' },
  optional: { fontWeight: '400', color: t.textLight },
  input: { width: '100%', padding: '10px 12px',
    borderRadius: t.radiusSm, border: `1.5px solid ${t.border}`,
    fontSize: '13px', boxSizing: 'border-box',
    backgroundColor: '#fff', color: t.textPrimary, outline: 'none' },
  formActions: { display: 'flex', gap: '10px', marginTop: '20px' },
  saveBtn: { padding: '10px 20px', backgroundColor: t.textPrimary,
    color: '#fff', border: 'none', borderRadius: t.radiusSm,
    fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  cancelBtn: { padding: '10px 20px', backgroundColor: 'transparent',
    color: t.textMuted, border: `1px solid ${t.border}`,
    borderRadius: t.radiusSm, fontSize: '13px', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '48px',
    color: t.textMuted, fontSize: '13px' },
  emptyState: { textAlign: 'center', padding: '60px 40px',
    backgroundColor: t.card, borderRadius: t.radius,
    boxShadow: t.shadow },
  emptyIcon: { fontSize: '32px', color: t.textLight, marginBottom: '12px' },
  emptyText: { fontSize: '15px', fontWeight: '500',
    color: t.textPrimary, marginBottom: '4px' },
  emptySubtext: { fontSize: '13px', color: t.textMuted },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: t.card, borderRadius: t.radius,
    boxShadow: t.shadow, overflow: 'hidden' },
  cardStrip: (color) => ({ height: '3px', backgroundColor: color }),
  cardInner: { padding: '20px' },
  cardTop: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start' },
  cardLeft: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  dateBox: (color) => ({
    backgroundColor: color + '18', borderRadius: t.radiusSm,
    padding: '8px 12px', textAlign: 'center', flexShrink: 0,
  }),
  dateDay: { fontSize: '20px', fontWeight: '700',
    color: t.textPrimary, lineHeight: 1 },
  dateMonth: { fontSize: '11px', color: t.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.05em' },
  compName: { fontSize: '16px', fontWeight: '600',
    color: t.textPrimary, marginBottom: '4px' },
  compMeta: { fontSize: '13px', color: t.textMuted, marginBottom: '4px' },
  categoryPill: (color) => ({
    display: 'inline-block', fontSize: '11px',
    padding: '2px 8px', borderRadius: '999px',
    backgroundColor: color + '18', color: color, fontWeight: '500',
  }),
  compDesc: { fontSize: '12px', color: t.textMuted, marginTop: '4px' },
  cardRight: { display: 'flex', flexDirection: 'column',
    alignItems: 'flex-end', gap: '12px' },
  resultCount: { textAlign: 'center' },
  resultNum: { display: 'block', fontSize: '22px',
    fontWeight: '700', color: t.textPrimary },
  resultLabel: { fontSize: '11px', color: t.textMuted },
  cardActions: { display: 'flex', gap: '8px' },
  expandBtn: { padding: '6px 14px', backgroundColor: t.accentLight,
    color: t.accent, border: `1px solid ${t.accent}`,
    borderRadius: t.radiusSm, fontSize: '12px', cursor: 'pointer' },
  deleteBtn: { padding: '6px 12px', background: 'none',
    border: `1px solid ${t.danger}`, borderRadius: t.radiusSm,
    fontSize: '12px', color: t.danger, cursor: 'pointer' },
  expandedSection: { marginTop: '20px',
    borderTop: `1px solid ${t.border}`, paddingTop: '20px' },
  resultsTable: { marginBottom: '20px', borderRadius: t.radiusSm,
    overflow: 'hidden', border: `1px solid ${t.border}` },
  tableHeader: { display: 'grid',
    gridTemplateColumns: '60px 1fr 1fr 100px 80px 1fr 40px',
    backgroundColor: t.bg, padding: '10px 16px' },
  th: { fontSize: '11px', fontWeight: '500', color: t.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.04em' },
  tableRow: { display: 'grid',
    gridTemplateColumns: '60px 1fr 1fr 100px 80px 1fr 40px',
    padding: '12px 16px',
    borderTop: `1px solid ${t.border}`,
    backgroundColor: t.card },
  td: { fontSize: '13px', color: t.textMuted,
    display: 'flex', alignItems: 'center' },
  tdBold: { fontSize: '13px', color: t.textPrimary,
    fontWeight: '500', display: 'flex', alignItems: 'center' },
  rankBadge: { fontSize: '16px' },
  removeBtn: { background: 'none', border: 'none',
    color: t.textLight, cursor: 'pointer', fontSize: '12px' },
  resultForm: { backgroundColor: t.bg, borderRadius: t.radiusSm,
    padding: '16px' },
  resultFormTitle: { fontSize: '13px', fontWeight: '600',
    color: t.textPrimary, marginBottom: '14px' },
  resultGrid: { display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' },
};