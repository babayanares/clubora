import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { isLoggedIn } from '../api/auth';
import TagInput from '../components/TagInput';

const INTEREST_SUGGESTIONS = ['technology', 'sports', 'music', 'art', 'gaming', 'reading', 'fitness', 'travel', 'photography', 'cooking'];

export default function CreateClub() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    interests: [],
    visibility: 'public',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) navigate('/login');
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Club name is required';
        if (value.trim().length < 3) return 'Club name must be at least 3 characters';
        if (value.trim().length > 100) return 'Club name must be under 100 characters';
        return '';
      case 'description':
        if (value.length > 500) return 'Description must be under 500 characters';
        return '';
      case 'location':
        if (value.trim().length > 100) return 'Location must be under 100 characters';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (e) => {
    const msg = validateField(e.target.name, e.target.value);
    setErrors((prev) => ({ ...prev, [e.target.name]: msg }));
  };

  const validate = () => {
    const errs = {};
    const nameErr = validateField('name', form.name);
    if (nameErr) errs.name = nameErr;
    const descErr = validateField('description', form.description);
    if (descErr) errs.description = descErr;
    const locErr = validateField('location', form.location);
    if (locErr) errs.location = locErr;
    if (form.interests.length === 0) errs.interests = 'Add at least one interest';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await api.post('/clubs', {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        interests: form.interests.join(','),
        visibility: form.visibility,
      });
      navigate('/explore');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Create a Club</h2>
        <p className="page-subtitle">Start a community around something you care about.</p>
      </div>

      <form className="create-club-form" onSubmit={handleSubmit} noValidate>

        <div className="form-group">
          <label htmlFor="name">Club Name <span className="required">*</span></label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Weekend Runners"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={100}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
          <p className="field-hint">{form.name.length}/100</p>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="What is this club about? Who should join?"
            value={form.description}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={4}
            maxLength={500}
          />
          {errors.description && <p className="field-error">{errors.description}</p>}
          <p className="field-hint">{form.description.length}/500</p>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="e.g. New York, NY or Online"
            value={form.location}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={100}
          />
          {errors.location && <p className="field-error">{errors.location}</p>}
          <p className="field-hint">{form.location.length}/100</p>
        </div>

        <div className="form-group">
          <label>Interests / Tags <span className="required">*</span></label>
          <TagInput
            tags={form.interests}
            onChange={(tags) => {
              setForm({ ...form, interests: tags });
              setErrors({ ...errors, interests: '' });
            }}
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

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Creating club…' : 'Create Club'}
        </button>

      </form>
    </div>
  );
}
