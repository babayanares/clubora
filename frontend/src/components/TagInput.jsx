import { useState } from 'react';

export default function TagInput({ tags, onChange, suggestions = [], placeholder = 'Type a tag and press Enter or comma' }) {
  const [input, setInput] = useState('');

  function add(raw) {
    const clean = raw.trim().toLowerCase();
    if (!clean || tags.includes(clean)) {
      setInput('');
      return;
    }
    onChange([...tags, clean]);
    setInput('');
  }

  function remove(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(input);
    }
  }

  const remaining = suggestions.filter((s) => !tags.includes(s.toLowerCase()));

  return (
    <div>
      <div className="tag-input-wrapper">
        <div className="tags-list">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
              <button type="button" className="tag-remove" onClick={() => remove(tag)} aria-label={`Remove ${tag}`}>×</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input.trim() && add(input)}
        />
      </div>
      {remaining.length > 0 && (
        <div className="suggestions">
          {remaining.map((s) => (
            <button key={s} type="button" className="suggestion-chip" onClick={() => add(s)}>{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}
