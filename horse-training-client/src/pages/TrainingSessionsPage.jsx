import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { tokens as t } from '../styles/tokens';
import { useAuth } from '../context/AuthContext';

const SESSION_TYPES = [
  'Flatwork','JumpTraining','Dressage',
  'Endurance','Recovery','Groundwork','Hacking'
];

const emptyForm = {
  date: new Date().toISOString().slice(0,16),
  sessionType: 'Flatwork',
  durationMinutes: 60,
  intensity: 5,
  notes: '',
  horseId: ''
};

const intensityColor = (v) => {
  if (v <= 3) return '#3DAA6E';
  if (v <= 6) return '#C9A96E';
  if (v <= 8) return '#E08C3A';
  return '#E5534B';
};

const intensityLabel = (v) => {
  const map = {
    1:'Very light',2:'Light',3:'Light moderate',
    4:'Moderate',5:'Moderate hard',6:'Hard',
    7:'Very hard',8:'Intense',9:'Very intense',10:'Maximum'
  };
  return map[v] || `${v}/10`;
};

export default function TrainingSessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState('history');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState({ horseId: '', fromDate: '', toDate: '' });

  useEffect(() => {
    fetchHorses();
    fetchSessions();
  }, []);

  const fetchHorses = async () => {
    try {
      const res = await api.get('/horses');
      setHorses(res.data);
    } catch { /* empty */ }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.horseId) params.append('horseId', filter.horseId);
      if (filter.fromDate) params.append('fromDate', filter.fromDate);
      if (filter.toDate) params.append('toDate', filter.toDate);
      const res = await api.get(`/trainingsessions?${params}`);
      setSessions(res.data);
    } catch { setError('Failed to load sessions.'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const payload = { ...form,
        durationMinutes: parseInt(form.durationMinutes),
        intensity: parseInt(form.intensity),
        horseId: parseInt(form.horseId)
      };
      if (editId) await api.put(`/trainingsessions/${editId}`, payload);
      else await api.post('/trainingsessions', payload);
      setSuccess(editId ? 'Session updated.' : 'Session logged.');
      setShowForm(false); setForm(emptyForm); setEditId(null);
      fetchSessions();
    } catch { setError('Failed to save session.'); }
  };

  const handleEdit = (s) => {
    setForm({
      date: s.date.slice(0,16), sessionType: s.sessionType,
      durationMinutes: s.durationMinutes, intensity: s.intensity,
      notes: s.notes || '', horseId: s.horseId
    });
    setEditId(s.id); setShowForm(true);
    setActiveTab('history');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await api.delete(`/trainingsessions/${id}`);
      setSuccess('Session deleted.');
      fetchSessions();
    } catch { setError('Failed to delete.'); }
  };

  const handleFeedback = async (id) => {
    const feedback = window.prompt('Enter trainer feedback:');
    if (!feedback) return;
    try {
      await api.post(`/trainingsessions/${id}/feedback`,
        { trainerFeedback: feedback });
      setSuccess('Feedback added.');
      fetchSessions();
    } catch { setError('Failed to add feedback.'); }
  };

  return (
    <Layout>
      <div style={s.topBar}>
        <div>
          <h1 style={s.title}>Sessions</h1>
          <p style={s.subtitle}>{sessions.length} session{sessions.length !== 1 ? 's' : ''} logged</p>
        </div>
        {user?.role === 'Rider' && (
          <button style={s.addBtn} onClick={() => {
            setShowForm(true); setEditId(null); setForm(emptyForm);
          }}>+ Log session</button>
        )}
      </div>

      {error && <div style={s.error}>{error}</div>}
      {success && <div style={s.successMsg}>{success}</div>}

      {showForm && (
        <div style={s.formCard}>
          <div style={s.formHeader}>
            <span style={s.formTitle}>
              {editId ? 'Edit session' : 'Log new session'}
            </span>
            <button style={s.closeBtn}
              onClick={() => { setShowForm(false); setEditId(null); }}>✕</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={s.formGrid}>
              <div>
                <label style={s.label}>Horse</label>
                <select style={s.input} value={form.horseId}
                  onChange={e => setForm({...form, horseId: e.target.value})}
                  required>
                  <option value="">Select a horse</option>
                  {horses.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={s.label}>Date & time</label>
                <input style={s.input} type="datetime-local"
                  value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                  required />
              </div>
              <div>
                <label style={s.label}>Session type</label>
                <select style={s.input} value={form.sessionType}
                  onChange={e => setForm({...form, sessionType: e.target.value})}>
                  {SESSION_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={s.label}>Duration (minutes)</label>
                <input style={s.input} type="number" min="5" max="480"
                  value={form.durationMinutes}
                  onChange={e => setForm({...form, durationMinutes: e.target.value})}
                  required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={s.label}>
                  Intensity — <span style={{ color: intensityColor(form.intensity), fontWeight: '500' }}>
                    {form.intensity}/10 · {intensityLabel(form.intensity)}
                  </span>
                </label>
                <input type="range" min="1" max="10"
                  value={form.intensity} style={s.slider}
                  onChange={e => setForm({...form, intensity: parseInt(e.target.value)})} />
                <div style={s.sliderTrack}>
                  {['1','2','3','4','5','6','7','8','9','10'].map(n => (
                    <span key={n} style={s.sliderTick}>{n}</span>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={s.label}>Notes</label>
                <textarea style={s.textarea} rows="3"
                  placeholder="What went well? Areas to improve..."
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
            </div>
            <div style={s.formActions}>
              <button type="submit" style={s.saveBtn}>
                {editId ? 'Update session' : 'Log session'}
              </button>
              <button type="button" style={s.cancelBtn}
                onClick={() => { setShowForm(false); setEditId(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={s.tabRow}>
        {['history'].map(tab => (
          <button key={tab} style={{
            ...s.tab,
            ...(activeTab === tab ? s.tabActive : {})
          }} onClick={() => setActiveTab(tab)}>
            History ({sessions.length})
          </button>
        ))}
      </div>

      <div style={s.filterRow}>
        <select style={s.filterInput} value={filter.horseId}
          onChange={e => setFilter({...filter, horseId: e.target.value})}>
          <option value="">All horses</option>
          {horses.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
        <input type="date" style={s.filterInput} value={filter.fromDate}
          onChange={e => setFilter({...filter, fromDate: e.target.value})} />
        <input type="date" style={s.filterInput} value={filter.toDate}
          onChange={e => setFilter({...filter, toDate: e.target.value})} />
        <button style={s.filterBtn} onClick={fetchSessions}>Apply</button>
        <button style={s.clearBtn} onClick={() => {
          setFilter({ horseId: '', fromDate: '', toDate: '' });
          fetchSessions();
        }}>Clear</button>
      </div>

      {loading ? (
        <div style={s.empty}>Loading...</div>
      ) : sessions.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>◉</div>
          <div style={s.emptyText}>No sessions yet</div>
          <div style={s.emptySubtext}>
            {user?.role === 'Rider'
              ? 'Click "Log session" to start tracking your training'
              : 'No sessions have been logged yet'}
          </div>
        </div>
      ) : (
        <div style={s.list}>
          {sessions.map(session => (
            <div key={session.id} style={s.card}>
              <div style={s.cardLeft}>
                <div style={s.cardDate}>
                  <div style={s.cardDay}>
                    {new Date(session.date).toLocaleDateString('en-US',{day:'2-digit'})}
                  </div>
                  <div style={s.cardMonth}>
                    {new Date(session.date).toLocaleDateString('en-US',{month:'short'})}
                  </div>
                </div>
              </div>

              <div style={s.cardBody}>
                <div style={s.cardTop}>
                  <div style={s.cardMeta}>
                    <span style={s.horseName}>{session.horseName}</span>
                    <span style={s.dot}>·</span>
                    <span style={s.sessionType}>{session.sessionType}</span>
                  </div>
                  <div style={s.cardActions}>
                      {user?.role === 'Rider' && (
                      <>
                        <button style={s.editBtn}
                          onClick={() => handleEdit(session)}>Edit</button>
                        <button style={s.deleteBtn}
                          onClick={() => handleDelete(session.id)}>Delete</button>
                      </>
                    )}
                    {user?.role === 'Trainer' && !session.hasFeedback && (
                      <button style={s.feedbackBtn}
                        onClick={() => handleFeedback(session.id)}>
                        Add feedback
                      </button>
                    )}
                    {user?.role === 'Trainer' && session.hasFeedback && (
                      <span style={s.feedbackDone}>✓ Feedback given</span>
                    )}
                  </div>
                </div>

                <div style={s.cardStats}>
                  <div style={s.stat}>
                    <span style={s.statLabel}>Duration</span>
                    <span style={s.statValue}>{session.durationMinutes} min</span>
                  </div>
                  <div style={s.stat}>
                    <span style={s.statLabel}>Intensity</span>
                    <span style={{
                      ...s.intensityPill,
                      backgroundColor: intensityColor(session.intensity) + '18',
                      color: intensityColor(session.intensity)
                    }}>
                      {session.intensity}/10 · {intensityLabel(session.intensity)}
                    </span>
                  </div>
                  <div style={s.stat}>
                    <span style={s.statLabel}>Rider</span>
                    <span style={s.statValue}>{session.riderName}</span>
                  </div>
                </div>

                {session.notes && (
                  <div style={s.notesBox}>
                    <span style={s.notesLabel}>Notes</span>
                    <p style={s.notesText}>{session.notes}</p>
                  </div>
                )}

                {session.trainerFeedback && (
                  <div style={s.feedbackBox}>
                    <span style={s.feedbackLabel}>Trainer feedback</span>
                    <p style={s.feedbackText}>{session.trainerFeedback}</p>
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
  topBar: { display:'flex', justifyContent:'space-between',
    alignItems:'flex-start', marginBottom:'28px' },
  title: { margin:'0 0 4px', fontSize:'22px',
    fontWeight:'600', color:t.textPrimary },
  subtitle: { margin:0, fontSize:'13px', color:t.textMuted },
  addBtn: { padding:'10px 18px', backgroundColor:t.textPrimary,
    color:'#fff', border:'none', borderRadius:t.radiusSm,
    fontSize:'13px', fontWeight:'500', cursor:'pointer' },
  error: { backgroundColor:t.dangerLight, color:t.danger,
    padding:'10px 14px', borderRadius:t.radiusSm,
    marginBottom:'16px', fontSize:'13px' },
  successMsg: { backgroundColor:'#EDF7F2', color:'#3DAA6E',
    padding:'10px 14px', borderRadius:t.radiusSm,
    marginBottom:'16px', fontSize:'13px' },
  formCard: { backgroundColor:t.card, borderRadius:t.radius,
    padding:'24px', marginBottom:'24px', boxShadow:t.shadow },
  formHeader: { display:'flex', justifyContent:'space-between',
    alignItems:'center', marginBottom:'20px' },
  formTitle: { fontSize:'15px', fontWeight:'600', color:t.textPrimary },
  closeBtn: { background:'none', border:'none', fontSize:'16px',
    color:t.textMuted, cursor:'pointer' },
  formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' },
  label: { display:'block', fontSize:'12px', fontWeight:'500',
    color:t.textMuted, marginBottom:'6px' },
  input: { width:'100%', padding:'10px 12px', borderRadius:t.radiusSm,
    border:`1.5px solid ${t.border}`, fontSize:'13px',
    boxSizing:'border-box', backgroundColor:'#fff',
    color:t.textPrimary, outline:'none' },
  slider: { width:'100%', marginTop:'8px', accentColor:t.accent },
  sliderTrack: { display:'flex', justifyContent:'space-between',
    marginTop:'4px' },
  sliderTick: { fontSize:'11px', color:t.textLight },
  textarea: { width:'100%', padding:'10px 12px', borderRadius:t.radiusSm,
    border:`1.5px solid ${t.border}`, fontSize:'13px',
    boxSizing:'border-box', fontFamily:'inherit',
    resize:'vertical', outline:'none' },
  formActions: { display:'flex', gap:'10px', marginTop:'20px' },
  saveBtn: { padding:'10px 20px', backgroundColor:t.textPrimary,
    color:'#fff', border:'none', borderRadius:t.radiusSm,
    fontSize:'13px', fontWeight:'500', cursor:'pointer' },
  cancelBtn: { padding:'10px 20px', backgroundColor:t.bg,
    color:t.textMuted, border:`1px solid ${t.border}`,
    borderRadius:t.radiusSm, fontSize:'13px', cursor:'pointer' },
  tabRow: { display:'flex', gap:'4px', marginBottom:'16px',
    borderBottom:`1px solid ${t.border}` },
  tab: { padding:'8px 16px', background:'none', border:'none',
    fontSize:'13px', color:t.textMuted, cursor:'pointer' },
  tabActive: { color:t.accent, borderBottom:`2px solid ${t.accent}` },
  filterRow: { display:'flex', gap:'10px', marginBottom:'20px',
    flexWrap:'wrap' },
  filterInput: { padding:'8px 12px', borderRadius:t.radiusSm,
    border:`1px solid ${t.border}`, fontSize:'13px',
    backgroundColor:'#fff', color:t.textPrimary },
  filterBtn: { padding:'8px 14px', backgroundColor:t.textPrimary,
    color:'#fff', border:'none', borderRadius:t.radiusSm,
    fontSize:'13px', cursor:'pointer' },
  clearBtn: { padding:'8px 14px', backgroundColor:'transparent',
    color:t.textMuted, border:`1px solid ${t.border}`,
    borderRadius:t.radiusSm, fontSize:'13px', cursor:'pointer' },
  empty: { textAlign:'center', padding:'48px',
    color:t.textMuted, fontSize:'13px' },
  emptyState: { textAlign:'center', padding:'60px 40px',
    backgroundColor:t.card, borderRadius:t.radius, boxShadow:t.shadow },
  emptyIcon: { fontSize:'32px', color:t.textLight, marginBottom:'12px' },
  emptyText: { fontSize:'15px', fontWeight:'500',
    color:t.textPrimary, marginBottom:'4px' },
  emptySubtext: { fontSize:'13px', color:t.textMuted },
  list: { display:'flex', flexDirection:'column', gap:'12px' },
  card: { backgroundColor:t.card, borderRadius:t.radius,
    boxShadow:t.shadow, display:'flex', overflow:'hidden' },
  cardLeft: { width:'64px', flexShrink:0,
    backgroundColor:t.accentLight,
    display:'flex', alignItems:'center', justifyContent:'center' },
  cardDate: { textAlign:'center' },
  cardDay: { fontSize:'20px', fontWeight:'600', color:t.accent,
    lineHeight:1 },
  cardMonth: { fontSize:'11px', color:t.accent, textTransform:'uppercase',
    letterSpacing:'0.05em' },
  cardBody: { flex:1, padding:'16px 20px' },
  cardTop: { display:'flex', justifyContent:'space-between',
    alignItems:'flex-start', marginBottom:'12px' },
  cardMeta: { display:'flex', alignItems:'center', gap:'8px' },
  horseName: { fontSize:'15px', fontWeight:'600', color:t.textPrimary },
  dot: { color:t.textLight },
  sessionType: { fontSize:'13px', color:t.textMuted },
  cardActions: { display:'flex', gap:'6px' },
  editBtn: { padding:'4px 10px', background:'none',
    border:`1px solid ${t.border}`, borderRadius:'6px',
    fontSize:'11px', color:t.textMuted, cursor:'pointer' },
  deleteBtn: { padding:'4px 10px', background:'none',
    border:`1px solid ${t.danger}`, borderRadius:'6px',
    fontSize:'11px', color:t.danger, cursor:'pointer' },
  feedbackBtn: { padding:'4px 10px', backgroundColor:t.accentLight,
    border:`1px solid ${t.accent}`, borderRadius:'6px',
    fontSize:'11px', color:t.accent, cursor:'pointer' },
  feedbackDone: {
    fontSize:'11px', color:'#3DAA6E', padding:'4px 8px'
  },
  cardStats: { display:'flex', gap:'24px', marginBottom:'12px' },
  stat: { display:'flex', flexDirection:'column', gap:'2px' },
  statLabel: { fontSize:'11px', color:t.textMuted,
    textTransform:'uppercase', letterSpacing:'0.04em' },
  statValue: { fontSize:'13px', fontWeight:'500', color:t.textPrimary },
  intensityPill: { fontSize:'11px', padding:'2px 8px',
    borderRadius:'999px', fontWeight:'500', width:'fit-content' },
  notesBox: { padding:'10px 12px', backgroundColor:t.bg,
    borderRadius:t.radiusSm, marginTop:'8px' },
  notesLabel: { fontSize:'11px', fontWeight:'500', color:t.textMuted,
    textTransform:'uppercase', letterSpacing:'0.04em',
    display:'block', marginBottom:'4px' },
  notesText: { margin:0, fontSize:'13px', color:t.textPrimary,
    lineHeight:'1.6' },
  feedbackBox: { padding:'10px 12px', backgroundColor:t.accentLight,
    borderRadius:t.radiusSm, marginTop:'8px',
    borderLeft:`3px solid ${t.accent}` },
  feedbackLabel: { fontSize:'11px', fontWeight:'500', color:t.accent,
    textTransform:'uppercase', letterSpacing:'0.04em',
    display:'block', marginBottom:'4px' },
  feedbackText: { margin:0, fontSize:'13px', color:t.textPrimary,
    lineHeight:'1.6' },
};