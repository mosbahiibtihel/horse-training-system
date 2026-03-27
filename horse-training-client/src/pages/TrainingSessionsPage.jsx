// src/pages/TrainingSessionsPage.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { tokens as t } from '../styles/tokens';

export default function TrainingSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [filter, setFilter] = useState({ horseId: '', fromDate: '', toDate: '' });
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    sessionType: 'Flatwork',
    durationMinutes: 60,
    intensity: 'Moderate',
    notes: '',
    horseId: '',
    trainerFeedback: ''
  });

  const sessionTypes = ['Flatwork', 'Jumping', 'Dressage', 'CrossCountry', 'Lunging', 'Hacking', 'Groundwork', 'Recovery'];
  const intensityLevels = ['VeryLow', 'Low', 'Moderate', 'High', 'VeryHigh'];

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role || '');
    fetchHorses();
    fetchSessions();
  }, []);

  const fetchHorses = async () => {
    try {
      const response = await api.get('/horses');
      setHorses(response.data);
    } catch (err) {
      console.error('Error fetching horses:', err);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      let url = '/trainingsessions';
      const params = [];
      if (filter.horseId) params.push(`horseId=${filter.horseId}`);
      if (filter.fromDate) params.push(`fromDate=${filter.fromDate}`);
      if (filter.toDate) params.push(`toDate=${filter.toDate}`);
      if (params.length) url += `?${params.join('&')}`;
      
      const response = await api.get(url);
      setSessions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      const sessionData = {
        date: formData.date,
        sessionType: formData.sessionType,
        durationMinutes: parseInt(formData.durationMinutes),
        intensity: formData.intensity,
        notes: formData.notes,
        horseId: parseInt(formData.horseId)
      };
      
      if (editingSession) {
        await api.put(`/trainingsessions/${editingSession.id}`, {
          ...sessionData,
          trainerFeedback: formData.trainerFeedback
        });
        setSuccess('Session updated successfully!');
      } else {
        await api.post('/trainingsessions', sessionData);
        setSuccess('Training session logged successfully!');
      }
      
      resetForm();
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save session');
    }
  };

  const handleAddFeedback = async (sessionId, feedback) => {
    try {
      await api.post(`/trainingsessions/${sessionId}/feedback`, {
        trainerFeedback: feedback
      });
      setSuccess('Feedback added successfully!');
      fetchSessions();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Failed to add feedback');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this training session?')) {
      try {
        await api.delete(`/trainingsessions/${id}`);
        setSuccess('Session deleted successfully!');
        fetchSessions();
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Failed to delete session');
      }
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      date: session.date.slice(0, 16),
      sessionType: session.sessionType,
      durationMinutes: session.durationMinutes,
      intensity: session.intensity,
      notes: session.notes || '',
      horseId: session.horseId,
      trainerFeedback: session.trainerFeedback || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingSession(null);
    setShowForm(false);
    setFormData({
      date: new Date().toISOString().slice(0, 16),
      sessionType: 'Flatwork',
      durationMinutes: 60,
      intensity: 'Moderate',
      notes: '',
      horseId: '',
      trainerFeedback: ''
    });
  };

  const getIntensityColor = (intensity) => {
    const colors = {
      VeryLow: '#A8E6CF',
      Low: '#D4E6A8',
      Moderate: '#FFD966',
      High: '#FFB347',
      VeryHigh: '#FF6B6B'
    };
    return colors[intensity] || t.textMuted;
  };

  const getIntensityLabel = (intensity) => {
    const labels = {
      VeryLow: '🟢 Very Low',
      Low: '🟢 Low',
      Moderate: '🟡 Moderate',
      High: '🟠 High',
      VeryHigh: '🔴 Very High'
    };
    return labels[intensity] || intensity;
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Training Sessions</h1>
          <p style={s.subtitle}>Log and track your training progress</p>
        </div>
        {userRole === 'Rider' && (
          <button style={s.primaryBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Log Session'}
          </button>
        )}
      </div>

      {/* Messages */}
      {error && <div style={s.error}>{error}</div>}
      {success && <div style={s.success}>{success}</div>}

      {/* Filters */}
      <div style={s.filters}>
        <select
          style={s.filterSelect}
          value={filter.horseId}
          onChange={e => setFilter({...filter, horseId: e.target.value})}
        >
          <option value="">All Horses</option>
          {horses.map(horse => (
            <option key={horse.id} value={horse.id}>{horse.name}</option>
          ))}
        </select>
        <input
          type="date"
          style={s.filterInput}
          value={filter.fromDate}
          onChange={e => setFilter({...filter, fromDate: e.target.value})}
          placeholder="From Date"
        />
        <input
          type="date"
          style={s.filterInput}
          value={filter.toDate}
          onChange={e => setFilter({...filter, toDate: e.target.value})}
          placeholder="To Date"
        />
        <button style={s.filterBtn} onClick={fetchSessions}>Apply Filters</button>
        <button style={s.clearBtn} onClick={() => {
          setFilter({ horseId: '', fromDate: '', toDate: '' });
          setTimeout(fetchSessions, 100);
        }}>Clear</button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>
            {editingSession ? 'Edit Training Session' : 'Log New Training Session'}
          </h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formGrid}>
              <div>
                <label style={s.label}>Date & Time *</label>
                <input
                  style={s.input}
                  type="datetime-local"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label style={s.label}>Horse *</label>
                <select
                  style={s.select}
                  value={formData.horseId}
                  onChange={e => setFormData({...formData, horseId: e.target.value})}
                  required
                >
                  <option value="">Select a horse</option>
                  {horses.map(horse => (
                    <option key={horse.id} value={horse.id}>{horse.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={s.label}>Session Type *</label>
                <select
                  style={s.select}
                  value={formData.sessionType}
                  onChange={e => setFormData({...formData, sessionType: e.target.value})}
                  required
                >
                  {sessionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={s.label}>Duration (minutes) *</label>
                <input
                  style={s.input}
                  type="number"
                  min="1"
                  max="480"
                  value={formData.durationMinutes}
                  onChange={e => setFormData({...formData, durationMinutes: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label style={s.label}>Intensity *</label>
                <select
                  style={s.select}
                  value={formData.intensity}
                  onChange={e => setFormData({...formData, intensity: e.target.value})}
                  required
                >
                  {intensityLevels.map(level => (
                    <option key={level} value={level}>{getIntensityLabel(level)}</option>
                  ))}
                </select>
              </div>
              
              <div style={s.fullWidth}>
                <label style={s.label}>Notes</label>
                <textarea
                  style={s.textarea}
                  rows="3"
                  placeholder="Describe the session, what went well, areas to improve..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              
              {userRole === 'Trainer' && editingSession && (
                <div style={s.fullWidth}>
                  <label style={s.label}>Trainer Feedback</label>
                  <textarea
                    style={s.textarea}
                    rows="3"
                    placeholder="Provide feedback to the rider..."
                    value={formData.trainerFeedback}
                    onChange={e => setFormData({...formData, trainerFeedback: e.target.value})}
                  />
                </div>
              )}
            </div>
            
            <div style={s.formActions}>
              <button type="button" style={s.secondaryBtn} onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" style={s.primaryBtn}>
                {editingSession ? 'Update Session' : 'Log Session'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions List */}
      {loading ? (
        <div style={s.empty}>Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div style={s.emptyCard}>
          <div style={s.emptyIcon}>🏋️</div>
          <div style={s.emptyText}>No training sessions yet</div>
          <div style={s.emptySubtext}>
            {userRole === 'Rider' 
              ? 'Click "Log Session" to start tracking your training'
              : 'No sessions logged yet'}
          </div>
        </div>
      ) : (
        <div style={s.list}>
          {sessions.map(session => (
            <div key={session.id} style={s.sessionCard}>
              <div style={s.cardHeader}>
                <div style={s.cardTitle}>
                  <h3 style={s.horseName}>{session.horseName}</h3>
                  <span style={s.sessionBadge}>{session.sessionType}</span>
                </div>
                <div style={s.cardActions}>
                  {userRole === 'Rider' && (
                    <button style={s.editBtn} onClick={() => handleEdit(session)}>Edit</button>
                  )}
                  {userRole === 'Rider' && (
                    <button style={s.deleteBtn} onClick={() => handleDelete(session.id)}>Delete</button>
                  )}
                  {userRole === 'Trainer' && !session.hasFeedback && (
                    <button style={s.feedbackBtn} onClick={() => {
                      const feedback = prompt('Enter feedback for this session:');
                      if (feedback) handleAddFeedback(session.id, feedback);
                    }}>Add Feedback</button>
                  )}
                </div>
              </div>
              
              <div style={s.cardDetails}>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>Date</span>
                  <span style={s.detailValue}>
                    {new Date(session.date).toLocaleDateString()}
                  </span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>Duration</span>
                  <span style={s.detailValue}>{session.durationMinutes} min</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>Intensity</span>
                  <span style={{
                    ...s.intensityBadge,
                    backgroundColor: getIntensityColor(session.intensity) + '20',
                    color: getIntensityColor(session.intensity)
                  }}>
                    {getIntensityLabel(session.intensity)}
                  </span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>Rider</span>
                  <span style={s.detailValue}>{session.riderName}</span>
                </div>
              </div>
              
              {session.notes && (
                <div style={s.notes}>
                  <span style={s.notesLabel}>📝 Notes:</span>
                  <p style={s.notesText}>{session.notes}</p>
                </div>
              )}
              
              {session.trainerFeedback && (
                <div style={s.feedback}>
                  <span style={s.feedbackLabel}>💬 Trainer Feedback:</span>
                  <p style={s.feedbackText}>{session.trainerFeedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '22px',
    fontWeight: '600',
    color: t.textPrimary,
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: t.textMuted,
  },
  primaryBtn: {
    backgroundColor: t.textPrimary,
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: t.radiusSm,
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: t.radiusSm,
    border: `1px solid ${t.border}`,
    fontSize: '13px',
    backgroundColor: '#fff',
  },
  filterInput: {
    padding: '8px 12px',
    borderRadius: t.radiusSm,
    border: `1px solid ${t.border}`,
    fontSize: '13px',
  },
  filterBtn: {
    padding: '8px 16px',
    backgroundColor: t.accent,
    color: '#fff',
    border: 'none',
    borderRadius: t.radiusSm,
    cursor: 'pointer',
  },
  clearBtn: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    border: `1px solid ${t.border}`,
    borderRadius: t.radiusSm,
    cursor: 'pointer',
  },
  error: {
    backgroundColor: t.dangerLight,
    color: t.danger,
    padding: '12px 16px',
    borderRadius: t.radiusSm,
    marginBottom: '20px',
    fontSize: '13px',
  },
  success: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    padding: '12px 16px',
    borderRadius: t.radiusSm,
    marginBottom: '20px',
    fontSize: '13px',
  },
  formCard: {
    backgroundColor: t.card,
    borderRadius: t.radius,
    padding: '24px',
    marginBottom: '32px',
    boxShadow: t.shadow,
  },
  formTitle: {
    margin: '0 0 20px',
    fontSize: '16px',
    fontWeight: '600',
    color: t.textPrimary,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  fullWidth: {
    gridColumn: 'span 2',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: t.textPrimary,
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: t.radiusSm,
    border: `1px solid ${t.border}`,
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: t.radiusSm,
    border: `1px solid ${t.border}`,
    fontSize: '13px',
    backgroundColor: '#fff',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: t.radiusSm,
    border: `1px solid ${t.border}`,
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: t.textMuted,
    border: `1px solid ${t.border}`,
    padding: '10px 20px',
    borderRadius: t.radiusSm,
    fontSize: '13px',
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sessionCard: {
    backgroundColor: t.card,
    borderRadius: t.radius,
    padding: '20px',
    boxShadow: t.shadow,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  horseName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: t.textPrimary,
  },
  sessionBadge: {
    backgroundColor: t.accentLight,
    color: t.accent,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    backgroundColor: 'transparent',
    color: t.textMuted,
    border: `1px solid ${t.border}`,
    padding: '4px 12px',
    borderRadius: t.radiusSm,
    fontSize: '11px',
    cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    color: t.danger,
    border: `1px solid ${t.danger}`,
    padding: '4px 12px',
    borderRadius: t.radiusSm,
    fontSize: '11px',
    cursor: 'pointer',
  },
  feedbackBtn: {
    backgroundColor: t.accent,
    color: '#fff',
    border: 'none',
    padding: '4px 12px',
    borderRadius: t.radiusSm,
    fontSize: '11px',
    cursor: 'pointer',
  },
  cardDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${t.border}`,
  },
  detailItem: {
    textAlign: 'center',
  },
  detailLabel: {
    display: 'block',
    fontSize: '11px',
    color: t.textMuted,
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '13px',
    fontWeight: '500',
    color: t.textPrimary,
  },
  intensityBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
  },
  notes: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: t.radiusSm,
  },
  notesLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: t.textMuted,
    display: 'block',
    marginBottom: '6px',
  },
  notesText: {
    margin: 0,
    fontSize: '13px',
    color: t.textPrimary,
    lineHeight: '1.5',
  },
  feedback: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: t.accentLight + '20',
    borderRadius: t.radiusSm,
    borderLeft: `3px solid ${t.accent}`,
  },
  feedbackLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: t.accent,
    display: 'block',
    marginBottom: '6px',
  },
  feedbackText: {
    margin: 0,
    fontSize: '13px',
    color: t.textPrimary,
    lineHeight: '1.5',
  },
  empty: {
    textAlign: 'center',
    padding: '48px',
    color: t.textMuted,
    fontSize: '13px',
  },
  emptyCard: {
    textAlign: 'center',
    padding: '60px 40px',
    backgroundColor: t.card,
    borderRadius: t.radius,
    boxShadow: t.shadow,
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '500',
    color: t.textPrimary,
    marginBottom: '8px',
  },
  emptySubtext: {
    fontSize: '13px',
    color: t.textMuted,
  },
};