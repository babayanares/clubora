import { Link, useNavigate } from 'react-router-dom';
import { isLoggedIn, clearAuth, getUser } from '../api/auth';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Clubora</Link>
      <div className="navbar-links">
        <Link to="/explore">Explore</Link>
        {loggedIn ? (
          <>
            <Link to="/clubs/new">Create Club</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">{user?.name || 'Profile'}</Link>
            <NotificationBell />
            <button className="nav-logout" onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log In</Link>
            <Link to="/register" className="nav-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
