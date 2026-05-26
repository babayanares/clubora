import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function ExploreClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/clubs')
      .then((res) => setClubs(res.data.clubs))
      .catch(() => setError('Failed to load clubs. Please refresh the page.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p className="status-msg">Loading clubs…</p></div>;
  if (error) return <div className="page"><p className="form-error">{error}</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Explore Clubs</h2>
        <Link to="/clubs/new" className="btn btn-primary">+ Create Club</Link>
      </div>

      {clubs.length === 0 ? (
        <div className="empty-state">
          <p>No clubs yet.</p>
          <Link to="/clubs/new" className="btn btn-primary">Be the first to create one</Link>
        </div>
      ) : (
        <div className="clubs-grid">
          {clubs.map((club) => (
            <Link to={`/clubs/${club.id}`} key={club.id} className="club-card">
              <div className="club-card-body">
                <h3 className="club-card-name">{club.name}</h3>
                {club.description && <p className="club-card-desc">{club.description}</p>}
                <div className="club-card-meta">
                  {club.location && <span className="meta-chip">📍 {club.location}</span>}
                  <span className="meta-chip">👥 {club._count.memberships} member{club._count.memberships !== 1 ? 's' : ''}</span>
                </div>
                {club.interests && (
                  <div className="club-card-tags">
                    {club.interests.split(',').map((t) => (
                      <span key={t} className="tag">{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
