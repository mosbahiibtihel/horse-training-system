import { useState } from 'react';
import { tokens as t } from '../styles/tokens';

export default function NotificationBell({ notifications, unreadCount, markAllRead }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen(prev => !prev);
    if (!open) markAllRead();
  };

  const typeIcon = (type) => {
    const icons = { feedback: '💬', session: '◉', health: '🩺' };
    return icons[type] || '🔔';
  };

  return (
    <div style={s.wrapper}>
      <button style={s.bell} onClick={toggle}>
        🔔
        {unreadCount > 0 && (
          <span style={s.badge}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={s.dropdown}>
          <div style={s.dropHeader}>
            <span style={s.dropTitle}>Notifications</span>
            {notifications.length > 0 && (
              <span style={s.dropCount}>{notifications.length}</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={s.empty}>No notifications yet</div>
          ) : (
            <div style={s.list}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  ...s.item,
                  ...(n.read ? {} : s.itemUnread)
                }}>
                  <span style={s.itemIcon}>{typeIcon(n.type)}</span>
                  <div style={s.itemBody}>
                    <p style={s.itemMsg}>{n.message}</p>
                    <span style={s.itemTime}>
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  wrapper: { position: 'relative' },
  bell: {
    background: 'rgba(255,255,255,0.08)', border: 'none',
    borderRadius: '8px', padding: '6px 10px',
    cursor: 'pointer', fontSize: '16px', position: 'relative',
  },
  badge: {
    position: 'absolute', top: '-4px', right: '-4px',
    backgroundColor: t.danger, color: '#fff',
    borderRadius: '999px', fontSize: '10px',
    fontWeight: '700', minWidth: '16px', height: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 4px', lineHeight: 1,
  },
  dropdown: {
    position: 'absolute', bottom: '48px', left: '0',
    width: '300px', backgroundColor: '#1a1a1a',
    borderRadius: t.radius, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.08)',
    zIndex: 100, overflow: 'hidden',
  },
  dropHeader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  dropTitle: { color: '#fff', fontSize: '13px', fontWeight: '600' },
  dropCount: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
    borderRadius: '999px', fontSize: '11px',
    padding: '1px 7px',
  },
  empty: {
    padding: '24px 16px', textAlign: 'center',
    color: 'rgba(255,255,255,0.3)', fontSize: '13px',
  },
  list: { maxHeight: '320px', overflowY: 'auto' },
  item: {
    display: 'flex', gap: '10px', padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  itemUnread: { backgroundColor: 'rgba(201,169,110,0.08)' },
  itemIcon: { fontSize: '16px', flexShrink: 0, marginTop: '1px' },
  itemBody: { flex: 1 },
  itemMsg: {
    margin: '0 0 4px', fontSize: '13px',
    color: 'rgba(255,255,255,0.85)', lineHeight: '1.5',
  },
  itemTime: { fontSize: '11px', color: 'rgba(255,255,255,0.3)' },
};