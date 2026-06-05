import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { getUser, isLoggedIn } from '../api/auth';
import TagInput from '../components/TagInput';

const INTEREST_SUGGESTIONS = ['technology', 'sports', 'music', 'art', 'gaming', 'reading', 'fitness', 'travel', 'photography', 'cooking'];

export default function EditClub() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', location: '', interests: [], visibility: 'public' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return; }

    api.get(`/clubs/${id}`)
      .then((res) => {
        const club = res.data.club;
        const currentUser = getUser();

        // Redirect non-owners away
        if (!currentUser || club.owner.id !== currentUser.id) {
          navigate(`/clubs/${id}`);
          return;
        }

        setForm({
          name: club.name,
          description: club.description || '',
          location: club.location || '',
          interests: club.interests ? club.interests.split(',').map((t) => t.trim()).filter(Boolean) : [],
          visibility: club.visibility,
        });
      })
      .catch(() => navigate(`/clubs/${id}`))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Club name is required';
    else if (form.name.trim().length < 3) errs.name = 'Club name must be at least 3 characters';
    else if (form.name.trim().length > 100) errs.name = 'Club name must be under 100 characters';
    if (form.description.length > 500) errs.description = 'Description must be under 500 characters';
    if (form.interests.length === 0) errs.interests = 'Add at least one interest';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      await api.patch(`/clubs/${id}`, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        interests: form.interests.join(','),
        visibility: form.visibility,
      });
      navigate(`/clubs/${id}`);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page"><p className="status-msg">Loading…</p></div>;

  return (
    <div className="page">
      <Link to={`/clubs/${id}`} className="back-link">← Back to Club</Link>
      <div className="page-header">
        <h2>Edit Club</h2>
        <p className="page-subtitle">Update your club's details.</p>
      </div>

      <form className="create-club-form" onSubmit={handleSubmit} noValidate>

        <div className="form-group">
          <label htmlFor="name">Club Name <span className="required">*</span></label>
          <input id="name" name="name" type="text" value={form.name} onChange={handleChange} maxLength={100} />
          {errors.name && <p className="field-error">{errors.name}</p>}
          <p className="field-hint">{form.name.length}/100</p>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange} maxLength={500} />
          {errors.description && <p className="field-error">{errors.description}</p>}
          <p className="field-hint">{form.description.length}/500</p>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input id="location" name="location" type="text" placeholder="e.g. New York, NY or Online" value={form.location} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Interests / Tags <span className="required">*</span></label>
          <TagInput
            tags={form.interests}
            onChange={(tags) => { setForm({ ...form, interests: tags }); setErrors({ ...errors, interests: '' }); }}
            suggestions={INTEREST_SUGGESTIONS}
          />
          {errors.interests && <p className="field-error">{errors.interests}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="visibility">Visibility</label>
          <select id="visibility" name="visibility" value={form.visibility} onChange={handleChange}>
            <option value="public">Public — anyone can find and join</option>
            <option value="private">Private — invite only</option>
          </select>
        </div>

        {apiError && <p className="form-error">{apiError}</p>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <Link to={`/clubs/${id}`} className="btn btn-secondary">Cancel</Link>
        </div>

      </form>
    </div>
  );
}
