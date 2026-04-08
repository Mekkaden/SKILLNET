import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import SearchBar from './SearchBar.jsx';

var API_BASE = import.meta.env.VITE_API_URL;

/* ─── Placeholder gradient per type ─────────────────────────────────────── */

function getGradient(type) {
  if (type === 'SERVICE') {
    return 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.15) 100%)';
  }
  return 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(59,130,246,0.15) 100%)';
}

/* ─── Price badge text ───────────────────────────────────────────────────── */

function priceBadge(item) {
  if (item.pricing_model === 'CHAI') return 'Chai \u2615';
  if (item.pricing_model === 'FREE') return 'Free';
  return '\u20b9' + parseFloat(item.price).toFixed(0);
}

/* ─── FEED CARD ──────────────────────────────────────────────────────────── */

/**
 * FeedCard — glassmorphic SkillNet listing card for vertical grid.
 * Wraps in a React Router Link. Hover glow + GSAP lift.
 * RSM JS Style.
 */
function FeedCard(props) {
  var item = props.item;
  var cardRef = useRef(null);

  var detailRoute = '/listing/' + item.type + '/' + item.id;
  var badge = priceBadge(item);
  var typeLabel = item.type === 'PRODUCT' ? 'Product' : 'Service';

  var priceBadgeStyle = item.pricing_model === 'CHAI'
    ? { background: 'rgba(234,179,8,0.18)', border: '1px solid rgba(234,179,8,0.3)', color: '#fcd34d' }
    : item.pricing_model === 'FREE'
    ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }
    : { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' };

  var typeBadgeStyle = item.type === 'PRODUCT'
    ? { background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }
    : { background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.25)', color: '#c4b5fd' };

  function onMouseEnter() {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { y: -5, scale: 1.02, duration: 0.3, ease: 'power2.out' });
    cardRef.current.style.borderColor = 'rgba(99,102,241,0.4)';
    cardRef.current.style.boxShadow = '0 20px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(99,102,241,0.15)';
  }

  function onMouseLeave() {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { y: 0, scale: 1, duration: 0.4, ease: 'power3.out' });
    cardRef.current.style.borderColor = 'rgba(255,255,255,0.08)';
    cardRef.current.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
  }

  return (
    <Link to={detailRoute} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        ref={cardRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Image */}
        <div className="relative w-full overflow-hidden" style={{ paddingTop: '60%' }}>
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div
              className="absolute inset-0 w-full h-full flex items-center justify-center"
              style={{ background: getGradient(item.type) }}
            >
              <span style={{ fontSize: '2.5rem', opacity: 0.35 }}>
                {item.type === 'PRODUCT' ? '\ud83d\udce6' : '\ud83d\udee0\ufe0f'}
              </span>
            </div>
          )}
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent 45%, rgba(5,5,5,0.75) 100%)' }}
          />
          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={typeBadgeStyle}>
              {typeLabel}
            </span>
          </div>
          {/* Price badge */}
          <div className="absolute top-3 right-3">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={Object.assign({ backdropFilter: 'blur(8px)' }, priceBadgeStyle)}
            >
              {badge}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 py-3 flex flex-col gap-1.5">
          <div
            className="h-px"
            style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.3), transparent)' }}
          />
          {/* Title */}
          <h3
            className="text-sm font-bold text-white mt-1 leading-snug"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              letterSpacing: '-0.01em',
              minHeight: '2.4rem',
            }}
          >
            {item.title}
          </h3>
          {/* Price row */}
          <div className="flex items-center justify-between mt-0.5">
            <span
              className="text-base font-black"
              style={{ color: item.pricing_model === 'CHAI' ? '#fcd34d' : '#93c5fd' }}
            >
              {badge}
            </span>
            <span className="text-xs font-medium" style={{ color: 'rgba(99,102,241,0.65)' }}>
              View →
            </span>
          </div>
          {/* Contact */}
          {item.contact && (
            <p className="text-xs truncate" style={{ color: 'rgba(100,116,139,0.5)' }}>
              {item.contact.indexOf('@') !== -1 ? '\u2709 ' : '\ud83d\udcde '}
              {item.contact}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── MARKET FEED ─────────────────────────────────────────────────────────── */

/**
 * MarketFeed — SkillNet V5 vertical grid feed.
 * Fetches real listings, vertical scroll, cards append below.
 * SearchBar at top. GSAP stagger entry on load.
 * RSM JS Style: no arrow functions, no destructuring.
 */
function MarketFeed() {
  var listingsState = useState([]);
  var listings = listingsState[0];
  var setListings = listingsState[1];

  var loadingState = useState(true);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];

  var searchState = useState('');
  var searchQuery = searchState[0];
  var setSearchQuery = searchState[1];

  var pageRef = useRef(null);
  var gridRef = useRef(null);

  useEffect(function () {
    loadFeed();
  }, []);

  async function loadFeed() {
    try {
      var response = await fetch(API_BASE + '/api/feed');
      var data = await response.json();
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('MarketFeed fetch failed:', err);
      setListings([]);
    }
    setIsLoading(false);
  }

  /* GSAP stagger after load */
  useEffect(function () {
    if (isLoading) return;
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.children,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.09, ease: 'power3.out', delay: 0.05 }
      );
    }
    if (gridRef.current && gridRef.current.children.length > 0) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out', delay: 0.25 }
      );
    }
  }, [isLoading]);

  /* Filter by search */
  var filteredListings = listings.filter(function (item) {
    if (!searchQuery || searchQuery.trim() === '') return true;
    var q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().indexOf(q) !== -1) ||
      (item.contact && item.contact.toLowerCase().indexOf(q) !== -1)
    );
  });

  /* ── LOADING ─────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full animate-spin"
            style={{ border: '2px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1' }}
          />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(99,102,241,0.6)', letterSpacing: '0.18em' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  /* ── RENDER ──────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen"
      style={{
        background: '#050505',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 55%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 py-10" ref={pageRef}>

        {/* ── SEARCH BAR ─────────────────────────── */}
        <div className="mb-7">
          <SearchBar
            value={searchQuery}
            onChange={function (val) { setSearchQuery(val); }}
            placeholder="Search listings, skills, products..."
          />
        </div>

        {/* ── HERO STRIP ─────────────────────────── */}
        <div
          className="rounded-2xl px-7 py-5 mb-8 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div
            className="absolute top-0 left-8 right-8 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }}
          />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(99,102,241,0.8)', letterSpacing: '0.2em' }}
              >
                Live Campus Feed
              </div>
              <h1
                className="font-black text-white leading-none"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.04em' }}
              >
                The{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #818cf8, #60a5fa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  SkillNet
                </span>
                {' '}Market
              </h1>
              <p className="text-sm mt-1 font-medium" style={{ color: 'rgba(148,163,184,0.5)' }}>
                Peer-to-peer deals from verified campus students
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono"
              style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: 'rgba(165,180,252,0.8)',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#6366f1' }} />
              {listings.length} {listings.length !== 1 ? 'listings' : 'listing'}
            </div>
          </div>
        </div>

        {/* ── EMPTY STATE ─────────────────────────── */}
        {filteredListings.length === 0 && (
          <div className="text-center py-28">
            <div className="text-5xl mb-5">{searchQuery ? '\ud83d\udd0d' : '\u26a1'}</div>
            <p className="font-black text-white text-xl mb-2" style={{ letterSpacing: '-0.03em' }}>
              {searchQuery ? 'No results for "' + searchQuery + '"' : 'No listings yet'}
            </p>
            <p className="text-sm" style={{ color: 'rgba(148,163,184,0.45)' }}>
              {searchQuery ? 'Try a broader search.' : 'Post the first deal on SkillNet!'}
            </p>
          </div>
        )}

        {/* ── VERTICAL CARD GRID \u2014 scroll down to see all ── */}
        {filteredListings.length > 0 && (
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredListings.map(function (item) {
              return (
                <FeedCard
                  key={item.type + '-' + item.id}
                  item={item}
                />
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default MarketFeed;
