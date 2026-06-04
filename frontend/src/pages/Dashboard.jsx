import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { getUser, isLoggedIn } from '../api/auth';

export default function Dashboard() {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    const user = getUser();
    if (!user?.id) { navigate('/login'); return; }

    api.get(`/users/${user.id}`)
      .then((res) => setMemberships(res.data.user.memberships || []))
      .catch(() => setError('Failed to load your clubs. Please try again.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="page"><p className="status-msg">Loading your clubs…</p></div>;
  if (error)   return <div className="page"><p className="form-error">{error}</p></div>;

  const owned  = memberships.filter((m) => m.role === 'admin');
  const joined = memberships.filter((m) => m.role === 'member');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>My Clubs</h2>
          <p className="page-subtitle">Clubs you own and clubs you've joined</p>
        </div>
        <Link to="/clubs/new" className="btn btn-primary">+ Create Club</Link>
      </div>

      <section className="my-clubs-section">
        <h3 className="my-clubs-section-title">
          Clubs I Own
          <span className="my-clubs-count">{owned.length}</span>
        </h3>
        {owned.length === 0 ? (
          <div className="my-clubs-empty">
            <p>You haven't created any clubs yet.</p>
            <Link to="/clubs/new" className="btn btn-primary">Create your first club</Link>
          </div>
        ) : (
          <div className="my-clubs-grid">
            {owned.map(({ club, joinedAt }) => (
              <ClubCard key={club.id} club={club} joinedAt={joinedAt} role="Owner" />
            ))}
          </div>
        )}
      </section>

      <section className="my-clubs-section">
        <h3 className="my-clubs-section-title">
          Clubs I've Joined
          <span className="my-clubs-count">{joined.length}</span>
        </h3>
        {joined.length === 0 ? (
          <div className="my-clubs-empty">
            <p>You haven't joined any clubs yet.</p>
            <Link to="/explore" className="btn btn-secondary">Explore clubs</Link>
          </div>
        ) : (
          <div className="my-clubs-grid">
            {joined.map(({ club, joinedAt }) => (
              <ClubCard key={club.id} club={club} joinedAt={joinedAt} role="Member" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ClubCard({ club, joinedAt, role }) {
  const memberCount = club._count?.memberships ?? 0;

  return (
    <Link to={`/clubs/${club.id}`} className="my-club-card">
      <div className="my-club-card-header">
        <span className="my-club-card-name">{club.name}</span>
        <span className={`visibility-badge ${club.visibility}`}>
          {club.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
        </span>
      </div>
      <div className="my-club-card-meta">
        {club.category && <span className="meta-chip">{club.category}</span>}
        <span className="meta-chip">{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        <span className="meta-chip">{role}</span>
        <span className="meta-chip">
          {role === 'Owner' ? 'Created' : 'Joined'}{' '}
          {new Date(joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </Link>
  );
}
