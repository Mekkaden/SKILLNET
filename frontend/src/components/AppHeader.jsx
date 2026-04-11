import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

function AppHeader(props) {
  var loggedIn = props.loggedIn;
  var onLogout = props.onLogout;
  var navRef = useRef(null);

  useEffect(function () {
    gsap.fromTo(
      navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(10,10,10,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(223,255,0,0.08)',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">

        {/* Brand */}
        <Link to="/feed" style={{ textDecoration: 'none' }}>
          <div className="flex items-center gap-3">
            {/* Logo Mark */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-base"
              style={{
                background: 'linear-gradient(135deg, #dfff00, #a8cc00)',
                color: '#0a0a0a',
                letterSpacing: '-0.05em',
                boxShadow: '0 0 18px rgba(223,255,0,0.3)',
              }}
            >
              SS
            </div>

            {/* Brand Name */}
            <div>
              <div
                className="font-black tracking-tight leading-none"
                style={{
                  fontSize: '1.15rem',
                  color: '#dfff00',
                  letterSpacing: '-0.02em',
                }}
              >
                SkillSphere
              </div>
              <div
                className="text-xs leading-tight font-medium"
                style={{ color: 'rgba(223,255,0,0.4)', letterSpacing: '0.06em' }}
              >
                CAMPUS MARKET
              </div>
            </div>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link
            to="/feed"
            className="transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
            onMouseEnter={function (e) { e.target.style.color = '#dfff00'; }}
            onMouseLeave={function (e) { e.target.style.color = 'rgba(255,255,255,0.55)'; }}
          >
            Market
          </Link>

          {loggedIn && (
            <>
              <Link
                to="/my-listings"
                className="transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
                onMouseEnter={function (e) { e.target.style.color = '#dfff00'; }}
                onMouseLeave={function (e) { e.target.style.color = 'rgba(255,255,255,0.55)'; }}
              >
                My Listings
              </Link>

              <Link
                to="/post"
                className="font-bold text-xs px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                  background: '#dfff00',
                  color: '#0a0a0a',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  boxShadow: '0 0 14px rgba(223,255,0,0.2)',
                }}
                onMouseEnter={function (e) {
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(223,255,0,0.45)';
                  e.currentTarget.style.background = '#eeff33';
                }}
                onMouseLeave={function (e) {
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(223,255,0,0.2)';
                  e.currentTarget.style.background = '#dfff00';
                }}
              >
                + Post Gig
              </Link>

              <button
                onClick={onLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.45)',
                }}
                onMouseEnter={function (e) {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                  e.currentTarget.style.color = '#f87171';
                }}
                onMouseLeave={function (e) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                }}
              >
                Logout
              </button>
            </>
          )}

          {!loggedIn && (
            <>
              <Link
                to="/login"
                className="text-xs font-medium transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}
                onMouseEnter={function (e) { e.target.style.color = '#dfff00'; }}
                onMouseLeave={function (e) { e.target.style.color = 'rgba(255,255,255,0.45)'; }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="font-bold text-xs px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                  background: '#dfff00',
                  color: '#0a0a0a',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  boxShadow: '0 0 14px rgba(223,255,0,0.2)',
                }}
                onMouseEnter={function (e) {
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(223,255,0,0.45)';
                  e.currentTarget.style.background = '#eeff33';
                }}
                onMouseLeave={function (e) {
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(223,255,0,0.2)';
                  e.currentTarget.style.background = '#dfff00';
                }}
              >
                Join Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AppHeader;
