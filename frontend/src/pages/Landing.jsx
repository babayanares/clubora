import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing">
      <h1>Welcome to Clubora</h1>
      <p>Discover and join clubs that match your interests.</p>
      <div className="cta-buttons">
        <Link to="/register" className="btn btn-primary">Get Started</Link>
        <Link to="/explore" className="btn btn-secondary">Explore Clubs</Link>
      </div>
    </div>
  );
}
