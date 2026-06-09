import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing">

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-left">
          <h1 className="landing-headline">Find your<br />people.</h1>
          <p className="landing-subline">
            Discover clubs built around what you love — explore, join,
            and connect with communities that share your passions.
          </p>
        </div>

        <div className="landing-hero-right">
          <h2 className="landing-cta-heading">Join free today</h2>
          <p className="landing-cta-sub">Find your first club in minutes.</p>
          <div className="landing-cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
            <Link to="/explore" className="btn btn-outline btn-lg">Explore Clubs</Link>
          </div>
          <p className="landing-cta-login">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>

        {/* Stick figures parade — 7-second intro animation */}
        <div className="landing-figures" aria-hidden="true">
          {/* Walking */}
          <div className="landing-figure lf-1">
            <svg viewBox="0 0 40 70" width="36" height="63" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
              <circle cx="20" cy="9" r="7" fill="white" stroke="none" />
              <line x1="20" y1="16" x2="20" y2="38" />
              <line x1="20" y1="24" x2="7" y2="33" />
              <line x1="20" y1="24" x2="33" y2="18" />
              <line x1="20" y1="38" x2="9" y2="56" />
              <line x1="20" y1="38" x2="27" y2="55" />
            </svg>
          </div>
          {/* Celebrating — arms high */}
          <div className="landing-figure lf-2">
            <svg viewBox="0 0 50 70" width="42" height="59" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
              <circle cx="25" cy="9" r="7" fill="white" stroke="none" />
              <line x1="25" y1="16" x2="25" y2="38" />
              <line x1="25" y1="22" x2="7" y2="11" />
              <line x1="25" y1="22" x2="43" y2="11" />
              <line x1="25" y1="38" x2="15" y2="58" />
              <line x1="25" y1="38" x2="35" y2="58" />
            </svg>
          </div>
          {/* Running — leaning forward */}
          <div className="landing-figure lf-3">
            <svg viewBox="0 0 50 70" width="44" height="62" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
              <circle cx="30" cy="9" r="7" fill="white" stroke="none" />
              <line x1="30" y1="16" x2="20" y2="38" />
              <line x1="25" y1="25" x2="12" y2="18" />
              <line x1="25" y1="25" x2="38" y2="14" />
              <line x1="20" y1="38" x2="7" y2="55" />
              <line x1="20" y1="38" x2="30" y2="52" />
            </svg>
          </div>
          {/* Dancing — kicked leg */}
          <div className="landing-figure lf-4">
            <svg viewBox="0 0 60 75" width="50" height="63" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
              <circle cx="25" cy="9" r="7" fill="white" stroke="none" />
              <line x1="25" y1="16" x2="25" y2="38" />
              <line x1="25" y1="22" x2="40" y2="12" />
              <line x1="25" y1="22" x2="8" y2="28" />
              <line x1="25" y1="38" x2="14" y2="56" />
              <line x1="25" y1="38" x2="36" y2="50" />
              <line x1="36" y1="50" x2="50" y2="40" />
            </svg>
          </div>
          {/* Waving — arm high */}
          <div className="landing-figure lf-5">
            <svg viewBox="0 0 45 70" width="38" height="59" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
              <circle cx="20" cy="9" r="7" fill="white" stroke="none" />
              <line x1="20" y1="16" x2="20" y2="38" />
              <line x1="20" y1="22" x2="5" y2="32" />
              <line x1="20" y1="18" x2="35" y2="4" />
              <line x1="20" y1="38" x2="11" y2="57" />
              <line x1="20" y1="38" x2="28" y2="57" />
            </svg>
          </div>
          {/* Seated grinder — grinds up the diagonal cut */}
          <div className="landing-figure lf-6">
            <svg viewBox="0 0 50 58" width="44" height="51" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
              <circle cx="25" cy="8" r="7" fill="white" stroke="none" />
              <line x1="25" y1="15" x2="25" y2="30" />
              <line x1="25" y1="20" x2="7" y2="13" />
              <line x1="25" y1="20" x2="43" y2="13" />
              <line x1="25" y1="30" x2="14" y2="42" />
              <line x1="14" y1="42" x2="10" y2="53" />
              <line x1="25" y1="30" x2="36" y2="42" />
              <line x1="36" y1="42" x2="40" y2="53" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Feature highlights ── */}
      <section className="landing-section">
        <div className="landing-container">
          <h2 className="landing-section-title">Everything you need to find your people</h2>
          <div className="landing-features">
            <div className="landing-feature-card">
              <div className="landing-feature-icon">🔍</div>
              <h3>Explore Clubs</h3>
              <p>Browse interest-based clubs across every category — sports, tech, cooking, art, and more.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">✨</div>
              <h3>Create Your Own</h3>
              <p>Start a club around any passion. Set it public or private and grow your community your way.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">🎯</div>
              <h3>Get Matched</h3>
              <p>Add your interests and we'll surface clubs that fit you — no endless scrolling required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-section landing-section--alt">
        <div className="landing-container">
          <h2 className="landing-section-title">How it works</h2>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-num">1</div>
              <h3>Discover</h3>
              <p>Browse or search clubs by interest, name, or location.</p>
            </div>
            <div className="landing-step-arrow">→</div>
            <div className="landing-step">
              <div className="landing-step-num">2</div>
              <h3>Join</h3>
              <p>Instantly join public clubs or request access to private ones.</p>
            </div>
            <div className="landing-step-arrow">→</div>
            <div className="landing-step">
              <div className="landing-step-num">3</div>
              <h3>Connect</h3>
              <p>Post in your clubs, follow activity, and grow with your community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="landing-stats">
        <div className="landing-stats-inner">
          <div className="landing-stat">
            <span className="landing-stat-num">100+</span>
            <span className="landing-stat-label">Clubs</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-num">500+</span>
            <span className="landing-stat-label">Members</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-num">30+</span>
            <span className="landing-stat-label">Interest categories</span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <span className="landing-footer-brand">Clubora</span>
          <div className="landing-footer-links">
            <Link to="/explore">Explore</Link>
            <Link to="/login">Log In</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
