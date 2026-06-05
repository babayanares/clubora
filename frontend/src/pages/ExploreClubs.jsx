import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function ExploreClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeInterest, setActiveInterest] = useState('');

  useEffect(() => {
    api.get('/clubs')
      .then((res) => setClubs(res.data.clubs))
      .catch(() => setError('Failed to load clubs. Please refresh the page.'))
      .finally(() => setLoading(false));
  }, []);

  // Collect unique interest tags from all clubs
  const allInterests = useMemo(() => {
    const set = new Set();
    clubs.forEach((club) => {
      if (club.interests) {
        club.interests.split(',').forEach((t) => {
          const tag = t.trim().toLowerCase();
          if (tag) set.add(tag);
        });
      }
    });
    return [...set].sort();
  }, [clubs]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clubs.filter((club) => {
      const matchesSearch = !term || club.name.toLowerCase().includes(term);
      const matchesInterest = !activeInterest || (
        club.interests?.split(',').map((t) => t.trim().toLowerCase()).includes(activeInterest)
      );
      return matchesSearch && matchesInterest;
    });
  }, [clubs, search, activeInterest]);

  const filtersActive = search.trim() !== '' || activeInterest !== '';

  function clearFilters() {
    setSearch('');
    setActiveInterest('');
  }

  if (loading) return <div className="page"><p className="status-msg">Loading clubs…</p></div>;
  if (error)   return <div className="page"><p className="form-error">{error}</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Explore Clubs</h2>
          {filtersActive && (
            <p className="page-subtitle">Showing {filtered.length} of {clubs.length} clubs</p>
          )}
        </div>
        <Link to="/clubs/new" className="btn btn-primary">+ Create Club</Link>
      </div>

      {/* Search bar */}
      <div className="explore-search-row">
        <div className="explore-search-wrap">
          <span className="explore-search-icon">🔍</span>
          <input
            className="explore-search-input"
            type="text"
            placeholder="Search clubs by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="explore-search-clear" onClick={() => setSearch('')} aria-label="Clear search">×</button>
          )}
        </div>
        {filtersActive && (
          <button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {/* Interest filter chips */}
      {allInterests.length > 0 && (
        <div className="explore-interests">
          {allInterests.map((tag) => (
            <button
              key={tag}
              className={`explore-interest-chip ${activeInterest === tag ? 'active' : ''}`}
              onClick={() => setActiveInterest(activeInterest === tag ? '' : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Active interest badge */}
      {activeInterest && (
        <div className="explore-active-filter">
          <span>Filtered by:</span>
          <span className="explore-active-chip">
            {activeInterest}
            <button onClick={() => setActiveInterest('')} aria-label="Remove filter">×</button>
          </span>
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{clubs.length === 0 ? 'No clubs yet.' : 'No clubs match your search.'}</p>
          {clubs.length === 0
            ? <Link to="/clubs/new" className="btn btn-primary">Be the first to create one</Link>
            : <button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
          }
        </div>
      ) : (
        <div className="clubs-grid">
          {filtered.map((club) => {
            const isPrivate = club.visibility === 'private';
            return (
              <Link
                to={`/clubs/${club.id}`}
                key={club.id}
                className={`club-card${isPrivate ? ' club-card-private' : ''}`}
              >
                <div className="club-card-body">
                  <div className="club-card-name-row">
                    <h3 className="club-card-name">{club.name}</h3>
                    {isPrivate && <span className="visibility-badge private" style={{ fontSize: '0.72rem' }}>🔒 Private</span>}
                  </div>
                  {!isPrivate && club.description && <p className="club-card-desc">{club.description}</p>}
                  <div className="club-card-meta">
                    {!isPrivate && club.location && <span className="meta-chip">📍 {club.location}</span>}
                    <span className="meta-chip">👥 {club._count.memberships} member{club._count.memberships !== 1 ? 's' : ''}</span>
                    {isPrivate && <span className="meta-chip">Request to join</span>}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
