import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { getUser, isLoggedIn, setAuth, getToken } from '../api/auth';
import TagInput from '../components/TagInput';

const INTEREST_SUGGESTIONS = ['technology', 'sports', 'music', 'art', 'gaming', 'reading', 'fitness', 'travel', 'photography', 'cooking', 'science', 'design', 'writing', 'film', 'entrepreneurship'];

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', location: '', interests: [] });
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    const user = getUser();
    if (!user?.id) {
      navigate('/login');
      return;
    }
    api.get(`/users/${user.id}`)
      .then((res) => {
        setProfile(res.data.user);
        const u = res.data.user;
        const interestTags = u.interests ? u.interests.split(',').map((t) => t.trim()).filter(Boolean) : [];
        setForm({ name: u.name, bio: u.bio || '', location: u.location || '', interests: interestTags });
      })
      .catch(() => setError('Failed to load profile. Please try again.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  function validate() {
    const errors = {};
    const trimmedName = form.name.trim();
    if (!trimmedName) errors.name = 'Name is required';
    else if (trimmedName.length < 2) errors.name = 'Name must be at least 2 characters';
    else if (trimmedName.length > 100) errors.name = 'Name cannot exceed 100 characters';
    if (form.bio.length > 300) errors.bio = 'Bio cannot exceed 300 characters';
    if (form.location.length > 100) errors.location = 'Location cannot exceed 100 characters';
    return errors;
  }

  function handleEdit() {
    setEditing(true);
    setSaveError('');
    setSaveSuccess(false);
    setFieldErrors({});
  }

  function handleCancel() {
    setEditing(false);
    const interestTags = profile.interests ? profile.interests.split(',').map((t) => t.trim()).filter(Boolean) : [];
    setForm({ name: profile.name, bio: profile.bio || '', location: profile.location || '', interests: interestTags });
    setFieldErrors({});
    setSaveError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await api.patch(`/users/${profile.id}`, {
        name: form.name.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        interests: form.interests.join(','),
      });
      const updated = res.data.user;
      setProfile((prev) => ({ ...prev, ...updated }));
      setAuth(getToken(), { id: updated.id, name: updated.name, email: updated.email });
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page"><p className="status-msg">Loading profile…</p></div>;
  if (error) return <div className="page"><p className="form-error">{error}</p></div>;

  const memberClubs = profile.memberships || [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>My Profile</h2>
          <p className="page-subtitle">Manage your account info and see your clubs</p>
        </div>
        {!editing && (
          <button className="btn btn-secondary" onClick={handleEdit}>Edit Profile</button>
        )}
      </div>

      <div className="profile-layout">
        <div className="profile-card">
          {saveSuccess && (
            <div className="form-success">Profile updated successfully.</div>
          )}

          {editing ? (
            <form onSubmit={handleSave} noValidate>
              <div className="form-group">
                <label htmlFor="name">Name <span className="required">*</span></label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  maxLength={100}
                />
                {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  rows={3}
                  placeholder="Tell others a bit about yourself…"
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  maxLength={300}
                />
                <p className="field-hint">{form.bio.length}/300</p>
                {fieldErrors.bio && <p className="field-error">{fieldErrors.bio}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  placeholder="City, country…"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  maxLength={100}
                />
                {fieldErrors.location && <p className="field-error">{fieldErrors.location}</p>}
              </div>

              <div className="form-group">
                <label>Interests</label>
                <TagInput
                  tags={form.interests}
                  onChange={(tags) => setForm((f) => ({ ...f, interests: tags }))}
                  suggestions={INTEREST_SUGGESTIONS}
                  placeholder="Type an interest and press Enter"
                />
                <p className="field-hint">Up to 20 tags. These power club recommendations.</p>
              </div>

              {saveError && <p className="form-error">{saveError}</p>}

              <div className="profile-form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={saving}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="profile-field">
                <span className="profile-field-label">Name</span>
                <span className="profile-field-value">{profile.name}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Email</span>
                <span className="profile-field-value">{profile.email}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Bio</span>
                <span className="profile-field-value profile-field-muted">
                  {profile.bio || <em>Not set</em>}
                </span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Location</span>
                <span className="profile-field-value profile-field-muted">
                  {profile.location || <em>Not set</em>}
                </span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Interests</span>
                {profile.interests ? (
                  <div className="club-card-tags" style={{ marginTop: '0.25rem' }}>
                    {profile.interests.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                ) : (
                  <span className="profile-field-value profile-field-muted"><em>Not set</em></span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-clubs">
          <h3 className="section-label">My Clubs</h3>
          {memberClubs.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p style={{ marginBottom: '1rem' }}>You haven't joined any clubs yet.</p>
              <Link to="/explore" className="btn btn-primary">Explore Clubs</Link>
            </div>
          ) : (
            <ul className="profile-clubs-list">
              {memberClubs.map(({ club, role, joinedAt }) => (
                <li key={club.id} className="profile-club-item">
                  <Link to={`/clubs/${club.id}`} className="profile-club-name">{club.name}</Link>
                  <div className="profile-club-meta">
                    {club.category && <span className="meta-chip">{club.category}</span>}
                    <span className="meta-chip">{role === 'admin' ? 'Owner' : 'Member'}</span>
                    <span className="meta-chip">Joined {new Date(joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
