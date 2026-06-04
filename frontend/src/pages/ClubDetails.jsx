import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { getUser, isLoggedIn } from '../api/auth';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ClubDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [leaving, setLeaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    api.get(`/clubs/${id}`)
      .then((res) => setClub(res.data.club))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else setError('Failed to load club. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleJoin() {
    if (!isLoggedIn()) { navigate('/login'); return; }
    setJoining(true);
    setJoinError('');
    try {
      const res = await api.post(`/clubs/${id}/join`);
      const currentUser = getUser();
      setClub((prev) => ({
        ...prev,
        memberships: [...prev.memberships, { userId: currentUser.id, role: 'member' }],
        _count: { memberships: res.data.memberCount },
      }));
    } catch (err) {
      setJoinError(err.response?.data?.error || 'Failed to join. Please try again.');
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    if (!confirmLeave) { setConfirmLeave(true); return; }
    setLeaving(true);
    setJoinError('');
    try {
      const res = await api.delete(`/clubs/${id}/leave`);
      const currentUser = getUser();
      setClub((prev) => ({
        ...prev,
        memberships: prev.memberships.filter((m) => m.userId !== currentUser.id),
        _count: { memberships: res.data.memberCount },
      }));
      setConfirmLeave(false);
    } catch (err) {
      setJoinError(err.response?.data?.error || 'Failed to leave. Please try again.');
      setConfirmLeave(false);
    } finally {
      setLeaving(false);
    }
  }

  if (loading) {
    return <div className="page"><p className="status-msg">Loading club…</p></div>;
  }

  if (notFound) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Club not found.</p>
          <Link to="/explore" className="btn btn-secondary">← Back to Explore</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <p className="form-error">{error}</p>
        <Link to="/explore" className="btn btn-secondary" style={{ marginTop: '1rem' }}>← Back to Explore</Link>
      </div>
    );
  }

  const currentUser = getUser();
  const myMembership = currentUser
    ? club.memberships.find((m) => m.userId === currentUser.id)
    : null;
  const isOwner = myMembership?.role === 'admin';
  const isMember = !!myMembership && !isOwner;
  const isPrivate = club.visibility === 'private';
  const interests = club.interests ? club.interests.split(',').map((t) => t.trim()) : [];

  function renderJoinButton() {
    if (isPrivate) {
      return <span className="join-badge join-badge-private">🔒 Private Club</span>;
    }
    if (isOwner) {
      return <span className="join-badge join-badge-owner">You own this club</span>;
    }
    if (isMember) {
      return (
        <button
          className={`btn ${confirmLeave ? 'btn-danger' : 'btn-secondary'}`}
          onClick={handleLeave}
          disabled={leaving}
        >
          {leaving ? 'Leaving…' : confirmLeave ? 'Confirm Leave?' : 'Leave Club'}
        </button>
      );
    }
    if (!isLoggedIn()) {
      return <Link to="/login" className="btn btn-primary">Log in to Join</Link>;
    }
    return (
      <button className="btn btn-primary" onClick={handleJoin} disabled={joining}>
        {joining ? 'Joining…' : 'Join Club'}
      </button>
    );
  }

  return (
    <div className="page">
      <Link to="/explore" className="back-link">← Back to Explore</Link>

      <div className="club-detail">

        <div className="club-detail-header">
          <div>
            <h1 className="club-detail-name">{club.name}</h1>
            <span className={`visibility-badge ${club.visibility}`}>
              {club.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
            <div className="club-detail-stat">
              <span className="stat-number">{club._count.memberships}</span>
              <span className="stat-label">member{club._count.memberships !== 1 ? 's' : ''}</span>
            </div>
            {renderJoinButton()}
          </div>
        </div>

        {joinError && <p className="form-error" style={{ marginBottom: '1rem' }}>{joinError}</p>}

        {club.description && (
          <p className="club-detail-desc">{club.description}</p>
        )}

        <div className="club-detail-meta">
          {club.location && (
            <span className="meta-chip">📍 {club.location}</span>
          )}
          <span className="meta-chip">👤 Created by {club.owner.name}</span>
          <span className="meta-chip">🗓 {formatDate(club.createdAt)}</span>
        </div>

        {interests.length > 0 && (
          <div className="club-detail-section">
            <h3 className="section-label">Interests</h3>
            <div className="club-card-tags">
              {interests.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
