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

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.get(`/clubs/${id}`)
      .then((res) => setClub(res.data.club))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else setError('Failed to load club. Please try again.');
      })
      .finally(() => setLoading(false));

    api.get(`/clubs/${id}/posts`)
      .then((res) => setPosts(res.data.posts))
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, [id]);

  async function handleJoin() {
    if (!isLoggedIn()) { navigate('/login'); return; }
    setJoining(true);
    setJoinError('');
    try {
      const res = await api.post(`/clubs/${id}/join`);
      const cu = getUser();
      const newStatus = res.data.pending ? 'pending' : 'approved';
      setClub((prev) => ({
        ...prev,
        memberships: [...prev.memberships, { userId: cu.id, role: 'member', status: newStatus, user: { id: cu.id, name: cu.name } }],
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

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await api.delete(`/clubs/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setJoinError(err.response?.data?.error || 'Failed to delete. Please try again.');
      setConfirmDelete(false);
      setDeleting(false);
    }
  }

  async function handleApprove(userId) {
    try {
      const res = await api.patch(`/clubs/${id}/requests/${userId}/approve`);
      setClub((prev) => ({
        ...prev,
        memberships: prev.memberships.map((m) =>
          m.userId === userId ? { ...m, status: 'approved' } : m
        ),
        _count: { memberships: res.data.memberCount },
      }));
    } catch (err) {
      setJoinError(err.response?.data?.error || 'Failed to approve.');
    }
  }

  async function handleReject(userId) {
    try {
      await api.delete(`/clubs/${id}/requests/${userId}/reject`);
      setClub((prev) => ({
        ...prev,
        memberships: prev.memberships.filter((m) => m.userId !== userId),
      }));
    } catch (err) {
      setJoinError(err.response?.data?.error || 'Failed to reject.');
    }
  }

  async function handlePost(e) {
    e.preventDefault();
    if (!postContent.trim()) return;
    setPosting(true);
    setPostError('');
    try {
      const res = await api.post(`/clubs/${id}/posts`, { content: postContent.trim() });
      setPosts((prev) => [res.data.post, ...prev]);
      setPostContent('');
    } catch (err) {
      setPostError(err.response?.data?.error || 'Failed to post. Please try again.');
    } finally {
      setPosting(false);
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
  const isPending = myMembership?.status === 'pending';
  const isMember = !!myMembership && !isOwner && !isPending;
  const isPrivate = club.visibility === 'private';
  const interests = club.interests ? club.interests.split(',').map((t) => t.trim()) : [];
  const pendingRequests = isOwner
    ? club.memberships.filter((m) => m.status === 'pending')
    : [];

  function renderJoinButton() {
    if (isOwner) {
      return <span className="join-badge join-badge-owner">You own this club</span>;
    }
    if (isPending) {
      return <span className="join-badge join-badge-pending">Request Pending ⏳</span>;
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
        {joining ? (isPrivate ? 'Requesting…' : 'Joining…') : (isPrivate ? 'Request to Join' : 'Join Club')}
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
            {isOwner && (
              <div className="owner-actions">
                <Link to={`/clubs/${id}/edit`} className="btn btn-secondary">Edit Club</Link>
                <button
                  className={`btn ${confirmDelete ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : confirmDelete ? 'Confirm Delete?' : 'Delete Club'}
                </button>
              </div>
            )}
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

      {/* Join requests — owner of private club only */}
      {isOwner && isPrivate && (
        <div className="join-requests-section">
          <h3 className="posts-section-title">
            Join Requests
            {pendingRequests.length > 0 && (
              <span className="my-clubs-count" style={{ marginLeft: '0.5rem' }}>{pendingRequests.length}</span>
            )}
          </h3>
          {pendingRequests.length === 0 ? (
            <p className="posts-empty">No pending requests.</p>
          ) : (
            <ul className="join-requests-list">
              {pendingRequests.map((m) => (
                <li key={m.userId} className="join-request-item">
                  <span className="join-request-name">{m.user?.name || 'Unknown user'}</span>
                  <div className="join-request-actions">
                    <button className="btn btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }} onClick={() => handleApprove(m.userId)}>Approve</button>
                    <button className="btn btn-danger"  style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }} onClick={() => handleReject(m.userId)}>Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Posts feed */}
      <div className="posts-section">
        <h3 className="posts-section-title">Discussion</h3>

        {/* Post form — members only */}
        {isLoggedIn() && (isOwner || isMember) ? (
          <form className="post-form" onSubmit={handlePost}>
            <textarea
              className="post-textarea"
              placeholder="Write something for the club…"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              maxLength={1000}
              rows={3}
            />
            <div className="post-form-footer">
              <span className="field-hint">{postContent.length}/1000</span>
              <button type="submit" className="btn btn-primary" disabled={posting || !postContent.trim()}>
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
            {postError && <p className="field-error">{postError}</p>}
          </form>
        ) : (
          <div className="post-join-prompt">
            {!isLoggedIn()
              ? <><Link to="/login">Log in</Link> to post in this club.</>
              : <>Join this club to start posting.</>
            }
          </div>
        )}

        {/* Feed */}
        {postsLoading ? (
          <p className="status-msg">Loading posts…</p>
        ) : posts.length === 0 ? (
          <div className="posts-empty">No posts yet. Be the first to post!</div>
        ) : (
          <ul className="posts-list">
            {posts.map((post) => (
              <li key={post.id} className="post-item">
                <div className="post-meta">
                  <span className="post-author">{post.author.name}</span>
                  <span className="post-time">{timeAgo(post.createdAt)}</span>
                </div>
                <p className="post-content">{post.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
