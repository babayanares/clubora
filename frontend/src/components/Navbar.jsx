import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Clubora</Link>
      <div className="navbar-links">
        <Link to="/explore">Explore</Link>
        <Link to="/clubs/new">Create Club</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/login">Log In</Link>
      </div>
    </nav>
  );
}
