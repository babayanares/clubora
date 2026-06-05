import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import api from '../api/client';

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, dismiss, refresh } = useNotifications();
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const ref = useRef(null);

  // Close popup on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleOpen() {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) markAllRead();
  }

  async function handleApprove(notification) {
    setActionError('');
    try {
      await api.patch(`/clubs/${notification.clubId}/requests/${notification.fromUserId}/approve`);
      dismiss(notification.id);
      refresh();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to approve.');
    }
  }

  async function handleReject(notification) {
    setActionError('');
    try {
      await api.delete(`/clubs/${notification.clubId}/requests/${notification.fromUserId}/reject`);
      dismiss(notification.id);
      refresh();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to reject.');
    }
  }

  return (
    <div className="notif-bell-wrap" ref={ref}>
      <button className="notif-bell-btn" onClick={handleOpen} aria-label="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-popup">
          <div className="notif-popup-header">Notifications</div>
          {actionError && <p className="notif-error">{actionError}</p>}
          {notifications.length === 0 ? (
            <p className="notif-empty">No notifications yet.</p>
          ) : (
            <ul className="notif-list">
              {notifications.map((n) => (
                <li key={n.id} className={`notif-item${n.read ? ' notif-read' : ''}`}>
                  {n.type === 'join_request' && (
                    <div>
                      <p className="notif-text">
                        <strong>{n.fromUserName}</strong> wants to join <strong>{n.clubName}</strong>
                      </p>
                      <div className="notif-actions">
                        <button className="btn btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem' }} onClick={() => handleApprove(n)}>Approve</button>
                        <button className="btn btn-danger"  style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem' }} onClick={() => handleReject(n)}>Reject</button>
                      </div>
                    </div>
                  )}
                  {n.type === 'request_approved' && (
                    <p className="notif-text notif-approved">
                      ✓ Your request to join <strong>{n.clubName}</strong> was approved!
                    </p>
                  )}
                  {n.type === 'request_rejected' && (
                    <p className="notif-text notif-rejected">
                      Your request to join <strong>{n.clubName}</strong> was not approved.
                    </p>
                  )}
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
