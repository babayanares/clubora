import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { getUser, isLoggedIn } from '../api/auth';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    const user = getUser();
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }

    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/clubs'),
      api.get('/admin/users'),
    ])
      .then(([statsRes, clubsRes, usersRes]) => {
        setStats(statsRes.data.stats);
        setClubs(clubsRes.data.clubs);
        setUsers(usersRes.data.users);
      })
      .catch(() => setError('Failed to load admin data. Please try again.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleDelete(clubId) {
    if (confirmDelete !== clubId) { setConfirmDelete(clubId); return; }
    setDeleting(true);
    try {
      await api.delete(`/admin/clubs/${clubId}`);
      setClubs((prev) => prev.filter((c) => c.id !== clubId));
      setStats((prev) => ({ ...prev, clubCount: prev.clubCount - 1 }));
      setConfirmDelete(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete club.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div className="page"><p className="status-msg">Loading admin panel…</p></div>;

  if (error) return (
    <div className="page">
      <p className="form-error">{error}</p>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">Admin Panel</h1>

      {/* Stat cards */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-number">{stats?.userCount ?? 0}</span>
          <span className="admin-stat-label">Users</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number">{stats?.clubCount ?? 0}</span>
          <span className="admin-stat-label">Clubs</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number">{stats?.postCount ?? 0}</span>
          <span className="admin-stat-label">Posts</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number">{stats?.membershipCount ?? 0}</span>
          <span className="admin-stat-label">Active Memberships</span>
        </div>
      </div>

      {/* Clubs table */}
      <section className="admin-section">
        <h2 className="admin-section-title">Clubs ({clubs.length})</h2>
        {clubs.length === 0 ? (
          <p className="posts-empty">No clubs yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Visibility</th>
                  <th>Members</th>
                  <th>Posts</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((club) => (
                  <tr key={club.id}>
                    <td>
                      <Link to={`/clubs/${club.id}`} className="admin-link">{club.name}</Link>
                    </td>
                    <td>{club.owner.name}<br /><span className="admin-sub">{club.owner.email}</span></td>
                    <td>
                      <span className={`visibility-badge ${club.visibility}`}>
                        {club.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
                      </span>
                    </td>
                    <td>{club._count.memberships}</td>
                    <td>{club._count.posts}</td>
                    <td>{formatDate(club.createdAt)}</td>
                    <td>
                      <button
                        className={`btn ${confirmDelete === club.id ? 'btn-danger' : 'btn-secondary'}`}
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem' }}
                        onClick={() => handleDelete(club.id)}
                        disabled={deleting && confirmDelete === club.id}
                        onBlur={() => setConfirmDelete(null)}
                      >
                        {deleting && confirmDelete === club.id
                          ? 'Deleting…'
                          : confirmDelete === club.id
                          ? 'Confirm Delete?'
                          : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Users table */}
      <section className="admin-section">
        <h2 className="admin-section-title">Users ({users.length})</h2>
        {users.length === 0 ? (
          <p className="posts-empty">No users yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Clubs Owned</th>
                  <th>Clubs Joined</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-badge-${user.role}`}>{user.role}</span>
                    </td>
                    <td>{user._count.ownedClubs}</td>
                    <td>{user._count.memberships}</td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
