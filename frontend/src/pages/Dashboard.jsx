import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { getUser, isLoggedIn } from '../api/auth';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allClubs, setAllClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    const storedUser = getUser();
    if (!storedUser?.id) { navigate('/login'); return; }

    Promise.all([
      api.get(`/users/${storedUser.id}`),
      api.get('/clubs'),
    ])
      .then(([profileRes, clubsRes]) => {
        setUser(profileRes.data.user);
        setAllClubs(clubsRes.data.clubs);
      })
      .catch(() => setError('Failed to load dashboard. Please try again.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const memberships = user?.memberships || [];
  const owned  = memberships.filter((m) => m.role === 'admin');
  const joined = memberships.filter((m) => m.role === 'member');

  const recommendations = useMemo(() => {
    if (!user?.interests) return null;

    const userTags = new Set(
      user.interests.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
    );
    if (userTags.size === 0) return null;

    const memberClubIds = new Set(memberships.map((m) => m.club.id));

    return allClubs
      .filter((club) => !memberClubIds.has(club.id))
      .map((club) => {
        const clubTags = club.interests
          ? club.interests.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
          : [];
        const matches = clubTags.filter((t) => userTags.has(t));
        return { club, score: matches.length, matches };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [user, allClubs, memberships]);

  if (loading) return <div className="page"><p className="status-msg">Loading your clubs…</p></div>;
  if (error)   return <div className="page"><p className="form-error">{error}</p></div>;

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

      {/* Recommendations */}
      {!user?.interests ? (
        <section className="my-clubs-section">
          <h3 className="my-clubs-section-title">Recommended for You</h3>
          <div className="my-clubs-empty">
            <p>Add interests to your profile to get club recommendations.</p>
            <Link to="/profile" className="btn btn-secondary">Set interests</Link>
          </div>
        </section>
      ) : recommendations && recommendations.length > 0 ? (
        <section className="my-clubs-section">
          <h3 className="my-clubs-section-title">
            Recommended for You
            <span className="my-clubs-count">{recommendations.length}</span>
          </h3>
          <div className="my-clubs-grid">
            {recommendations.map(({ club, matches }) => (
              <RecommendCard key={club.id} club={club} matches={matches} />
            ))}
          </div>
        </section>
      ) : null}
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

function RecommendCard({ club, matches }) {
  const memberCount = club._count?.memberships ?? 0;
  return (
    <Link to={`/clubs/${club.id}`} className="my-club-card recommend-card">
      <div className="my-club-card-header">
        <span className="my-club-card-name">{club.name}</span>
        <span className="recommend-score">
          {matches.length} match{matches.length !== 1 ? 'es' : ''}
        </span>
      </div>
      <div className="recommend-tags">
        {matches.map((t) => <span key={t} className="tag">{t}</span>)}
      </div>
      <div className="my-club-card-meta" style={{ marginTop: '0.5rem' }}>
        <span className="meta-chip">👥 {memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        {club.location && <span className="meta-chip">📍 {club.location}</span>}
      </div>
    </Link>
  );
}
