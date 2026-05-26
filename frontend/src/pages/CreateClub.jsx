import { useState } from 'react';

export default function CreateClub() {
  const [form, setForm] = useState({ name: '', description: '', category: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire up to POST /api/clubs
    console.log('Create club:', form);
  };

  return (
    <div className="page">
      <h2>Create a Club</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" type="text" placeholder="Club Name" value={form.name} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="category" type="text" placeholder="Category" value={form.category} onChange={handleChange} />
        <button type="submit">Create Club</button>
      </form>
    </div>
  );
}
