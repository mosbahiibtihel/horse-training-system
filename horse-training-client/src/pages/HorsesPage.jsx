// src/pages/HorsesPage.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { tokens as t } from '../styles/tokens';

export default function HorsesPage() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHorse, setEditingHorse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    gender: 'Male',
    discipline: 'Dressage',
    photoUrl: ''
  });

  const fetchHorses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/horses');
      setHorses(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch horses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      if (editingHorse) {
        await api.put(`/horses/${editingHorse.id}`, {
          ...formData,
          age: parseInt(formData.age)
        });
        setSuccess('Horse updated successfully!');
      } else {
        await api.post('/horses', {
          ...formData,
          age: parseInt(formData.age)
        });
        setSuccess('Horse added successfully!');
      }
      
      resetForm();
      fetchHorses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save horse');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(`/horses/${id}`);
        setSuccess(`${name} deleted successfully!`);
        fetchHorses();
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Failed to delete horse');
      }
    }
  };

  const handleEdit = (horse) => {
    setEditingHorse(horse);
    setFormData({
      name: horse.name,
      breed: horse.breed,
      age: horse.age,
      gender: horse.gender,
      discipline: horse.discipline,
      photoUrl: horse.photoUrl || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingHorse(null);
    setShowForm(false);
    setFormData({
      name: '',
      breed: '',
      age: '',
      gender: 'Male',
      discipline: 'Dressage',
      photoUrl: ''
    });
  };

  useEffect(() => {
    fetchHorses();
  }, []);

  const disciplines = ['Dressage', 'Jumping', 'Eventing', 'Western', 'Racing', 'Show Jumping', 'Reining'];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Horses</h1>
          <p style={s.subtitle}>Manage your equine athletes</p>
        </div>
        <button 
          style={s.primaryBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Horse'}
        </button>
      </div>

      {/* Messages */}
      {error && <div style={s.error}>{error}</div>}
      {success && <div style={s.success}>{success}</div>}

      {/* Form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>
            {editingHorse ? 'Edit Horse' : 'Add New Horse'}
          </h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formGrid}>
              <div>
                <label style={s.label}>Horse Name *</label>
                <input
                  style={s.input}
                  type="text"
                  placeholder="e.g., Thunder"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label style={s.label}>Breed *</label>
                <input
                  style={s.input}
                  type="text"
                  placeholder="e.g., Arabian, Thoroughbred"
                  value={formData.breed}
                  onChange={e => setFormData({...formData, breed: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label style={s.label}>Age *</label>
                <input
                  style={s.input}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Years"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label style={s.label}>Gender *</label>
                <select
                  style={s.select}
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                  required
                >
                  <option value="Male">Male (Stallion/Gelding)</option>
                  <option value="Female">Female (Mare)</option>
                </select>
              </div>
              
              <div>
                <label style={s.label}>Discipline *</label>
                <select
                  style={s.select}
                  value={formData.discipline}
                  onChange={e => setFormData({...formData, discipline: e.target.value})}
                  required
                >
                  {disciplines.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={s.label}>Photo URL</label>
                <input
                  style={s.input}
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.photoUrl}
                  onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                />
              </div>
            </div>
            
            <div style={s.formActions}>
              <button type="button" style={s.secondaryBtn} onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" style={s.primaryBtn}>
                {editingHorse ? 'Update Horse' : 'Add Horse'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Horse Grid */}
      {loading ? (
        <div style={s.empty}>Loading horses...</div>
      ) : horses.length === 0 ? (
        <div style={s.emptyCard}>
          <div style={s.emptyIcon}>🐴</div>
          <div style={s.emptyText}>No horses yet</div>
          <div style={s.emptySubtext}>Click "Add Horse" to start building your stable</div>
        </div>
      ) : (
        <div style={s.grid}>
          {horses.map(horse => (
            <div key={horse.id} style={s.card}>
              <div style={s.cardHeader}>
                {horse.photoUrl ? (
                  <img src={horse.photoUrl} alt={horse.name} style={s.avatar} />
                ) : (
                  <div style={s.avatarPlaceholder}>
                    {horse.gender === 'Male' ? '♂' : '♀'}
                  </div>
                )}
                <div style={s.cardInfo}>
                  <h3 style={s.cardName}>{horse.name}</h3>
                  <p style={s.cardBreed}>{horse.breed}</p>
                </div>
                <div style={s.cardActions}>
                  <button 
                    style={s.editBtn}
                    onClick={() => handleEdit(horse)}
                  >
                    Edit
                  </button>
                  <button 
                    style={s.deleteBtn}
                    onClick={() => handleDelete(horse.id, horse.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div style={s.cardDetails}>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>Age</span>
                  <span style={s.detailValue}>{horse.age} years</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>Gender</span>
                  <span style={s.detailValue}>{horse.gender}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>Discipline</span>
                  <span style={s.detailValue}>
                    <span style={{...s.disciplineBadge, backgroundColor: t.accentLight + '40'}}>
                      {horse.discipline}
                    </span>
                  </span>
                </div>
              </div>
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
    maxWidth: '1400px',
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
    transition: 'all 0.2s',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
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
    backgroundColor: '#fff',
    color: t.textPrimary,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: t.radiusSm,
    border: `1px solid ${t.border}`,
    fontSize: '13px',
    backgroundColor: '#fff',
    color: t.textPrimary,
    cursor: 'pointer',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: t.card,
    borderRadius: t.radius,
    padding: '20px',
    boxShadow: t.shadow,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: t.accentLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: t.accent,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: t.textPrimary,
  },
  cardBreed: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: t.textMuted,
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
  cardDetails: {
    borderTop: `1px solid ${t.border}`,
    paddingTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  detailItem: {
    flex: 1,
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
  disciplineBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
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