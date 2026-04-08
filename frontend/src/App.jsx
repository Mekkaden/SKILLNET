import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { gsap } from 'gsap';
import ListingDetail from './components/ListingDetail.jsx';
import ReceiptPage from './components/ReceiptPage.jsx';
import MarketFeed from './components/MarketFeed.jsx';
import PostListing from './components/PostListing.jsx';
import MyListings from './components/MyListings.jsx';
import AppFooter from './components/AppFooter.jsx';
import { selectedListingAtom } from './state/listingAtoms.js';

var API_BASE = import.meta.env.VITE_API_URL;

var queryClient = new QueryClient();

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('token');
}

function getUserIdFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // Check expiry
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return decoded.userId;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  };
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────────

function PriceBadge(props) {
  const model = props.pricingModel;
  const price = props.price;

  if (model === 'FREE') {
    return <span className="text-green-400 font-bold text-lg">Free</span>;
  }
  if (model === 'CHAI') {
    return <span className="text-yellow-400 font-bold text-lg">Chai ☕</span>;
  }
  return (
    <span className="text-indigo-400 font-bold text-lg">
      ₹{parseFloat(price).toFixed(2)}
    </span>
  );
}

function TypeBadge(props) {
  if (props.type === 'PRODUCT') {
    return (
      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-900 text-green-300">
        Product
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-900 text-purple-300">
      Service
    </span>
  );
}

function ListingCard(props) {
  var item = props.item;
  var cardRef = useRef(null);
  var setSelectedListing = useSetRecoilState(selectedListingAtom);

  function handleMouseEnter() {
    gsap.to(cardRef.current, {
      scale: 1.03,
      y: -4,
      duration: 0.28,
      ease: 'power2.out',
      boxShadow: '0 12px 40px rgba(99,102,241,0.25)',
    });
  }

  function handleMouseLeave() {
    gsap.to(cardRef.current, {
      scale: 1,
      y: 0,
      duration: 0.28,
      ease: 'power2.out',
      boxShadow: '0 0px 0px rgba(0,0,0,0)',
    });
  }

  function handleClick() {
    setSelectedListing(item);
  }

  var linkPath = '/listing/' + item.type + '/' + item.id;

  return (
    <Link
      to={linkPath}
      onClick={handleClick}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer rounded-2xl p-5 flex flex-col gap-3"
        style={{
          background: 'linear-gradient(160deg, #0d1117 0%, #161b22 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          transition: 'border-color 0.2s',
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-100 text-sm leading-snug flex-1">{item.title}</h3>
          <TypeBadge type={item.type} />
        </div>
        <div className="flex items-center justify-between">
          <PriceBadge pricingModel={item.pricing_model} price={item.price} />
          <span className="text-xs" style={{ color: '#1e3a50', fontFamily: 'monospace' }}>#{item.id}</span>
        </div>
        {item.contact && (
          <div
            className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}
          >
            <span>{item.contact.indexOf('@') !== -1 ? '📧' : '📞'}</span>
            <span className="truncate">{item.contact}</span>
          </div>
        )}
        <div
          className="text-xs font-semibold flex items-center gap-1 mt-1"
          style={{ color: '#6366f1' }}
        >
          View Deal <span style={{ fontSize: '10px' }}>→</span>
        </div>
      </div>
    </Link>
  );
}

// ─── NAVBAR (V3 — SkillNet Glass) ──────────────────────────────────────────

function Navbar(props) {
  var loggedIn = props.loggedIn;
  var onLogout = props.onLogout;

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(5,5,5,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 1px 0 rgba(99,102,241,0.08)',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <Link to="/feed" style={{ textDecoration: 'none' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                boxShadow: '0 0 16px rgba(99,102,241,0.35)',
              }}
            >
              S
            </div>
            <div>
              <div
                className="font-black text-sm tracking-tight leading-tight"
                style={{
                  background: 'linear-gradient(90deg, #a5b4fc, #93c5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                SkillNet
              </div>
              <div className="text-xs leading-tight" style={{ color: 'rgba(100,116,139,0.6)' }}>
                Campus Market
              </div>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-5 text-sm">
          <Link
            to="/feed"
            className="font-medium transition-colors"
            style={{ color: 'rgba(148,163,184,0.7)' }}
            onMouseEnter={function (e) { e.currentTarget.style.color = '#a5b4fc'; }}
            onMouseLeave={function (e) { e.currentTarget.style.color = 'rgba(148,163,184,0.7)'; }}
          >
            Market
          </Link>

          {loggedIn && (
            <>
              <Link
                to="/my-listings"
                className="font-medium transition-colors"
                style={{ color: 'rgba(148,163,184,0.7)' }}
                onMouseEnter={function (e) { e.currentTarget.style.color = '#a5b4fc'; }}
                onMouseLeave={function (e) { e.currentTarget.style.color = 'rgba(148,163,184,0.7)'; }}
              >
                My Listings
              </Link>
              <Link
                to="/post"
                className="font-medium transition-colors"
                style={{ color: 'rgba(148,163,184,0.7)' }}
                onMouseEnter={function (e) { e.currentTarget.style.color = '#a5b4fc'; }}
                onMouseLeave={function (e) { e.currentTarget.style.color = 'rgba(148,163,184,0.7)'; }}
              >
                Post Gig
              </Link>
              <button
                onClick={onLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: 'rgba(252,165,165,0.8)',
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
                className="text-xs font-medium transition-colors"
                style={{ color: 'rgba(148,163,184,0.7)' }}
                onMouseEnter={function (e) { e.currentTarget.style.color = '#a5b4fc'; }}
                onMouseLeave={function (e) { e.currentTarget.style.color = 'rgba(148,163,184,0.7)'; }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                  color: '#fff',
                  boxShadow: '0 0 12px rgba(99,102,241,0.3)',
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

// ─── LOGIN VIEW ───────────────────────────────────────────────────────────────

function LoginView(props) {
  const onLogin = props.onLogin;
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_BASE + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed.');
      } else {
        localStorage.setItem('token', data.token);
        onLogin();
        navigate('/feed');
      }
    } catch (err) {
      setError('Could not connect to server.');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-1">Welcome back</h2>
        <p className="text-gray-400 text-sm mb-6">Login to post or manage your listings</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@mits.ac.in"
              value={email}
              onChange={function (e) { setEmail(e.target.value); }}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={function (e) { setPassword(e.target.value); }}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-60 mt-1"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          No account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── REGISTER VIEW ────────────────────────────────────────────────────────────

function RegisterView(props) {
  const onLogin = props.onLogin;
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_BASE + '/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed.');
      } else {
        localStorage.setItem('token', data.token);
        onLogin();
        navigate('/feed');
      }
    } catch (err) {
      setError('Could not connect to server.');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-1">Create Account</h2>
        <p className="text-gray-400 text-sm mb-6">Join Skillnet to post your gigs</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="reg-name">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              placeholder="e.g. Arjun Menon"
              value={name}
              onChange={function (e) { setName(e.target.value); }}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              placeholder="you@mits.ac.in"
              value={email}
              onChange={function (e) { setEmail(e.target.value); }}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="reg-password">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={function (e) { setPassword(e.target.value); }}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-60 mt-1"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── FEED VIEW (public) ───────────────────────────────────────────────────────

function FeedView() {
  var [listings, setListings] = useState([]);
  var [loading, setLoading] = useState(true);
  var gridRef = useRef(null);
  var headerRef = useRef(null);

  async function loadFeed() {
    try {
      var response = await fetch(API_BASE + '/api/feed');
      var data = await response.json();
      setListings(data);
    } catch (err) {
      console.error('Failed to load feed:', err);
    }
    setLoading(false);
  }

  useEffect(function () {
    loadFeed();
  }, []);

  // GSAP staggered entrance animation once cards render
  useEffect(function () {
    if (loading || listings.length === 0) return;

    // Animate hero header
    gsap.fromTo(
      headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );

    // Stagger animate each card child
    var cards = gridRef.current ? gridRef.current.children : [];
    gsap.fromTo(
      cards,
      { y: 50, opacity: 0, scale: 0.96 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.07,
        delay: 0.1,
      }
    );
  }, [loading, listings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full animate-spin"
            style={{ border: '3px solid rgba(99,102,241,0.15)', borderTopColor: '#6366f1' }}
          />
          <p className="text-sm" style={{ color: '#475569' }}>Loading the Shark Tank...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)' }}
    >
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Feed Header */}
        <div ref={headerRef} className="mb-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6366f1' }}>
                Live · Campus Feed
              </div>
              <h1
                className="font-extrabold text-3xl md:text-4xl tracking-tight text-white"
                style={{ lineHeight: 1.1 }}
              >
                The Shark Tank 🦈
              </h1>
              <p className="text-sm mt-2" style={{ color: '#475569' }}>
                Peer-to-peer deals from verified MITS students
              </p>
            </div>
            <span
              className="text-xs font-mono px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}
            >
              {listings.length} {listings.length !== 1 ? 'deals' : 'deal'}
            </span>
          </div>

          {/* Divider */}
          <div
            className="mt-6 h-px"
            style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.4) 0%, transparent 100%)' }}
          />
        </div>

        {listings.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🦈</div>
            <p className="text-white font-bold mb-1">The tank is empty</p>
            <p className="text-sm" style={{ color: '#334155' }}>Be the first to post a deal!</p>
          </div>
        )}

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map(function (item) {
            return <ListingCard key={item.type + '-' + item.id} item={item} />;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MY LISTINGS VIEW (protected) ────────────────────────────────────────────

function MyListingsView() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState(null);

  const [editTitle, setEditTitle] = useState('');
  const [editPricingModel, setEditPricingModel] = useState('FREE');
  const [editPrice, setEditPrice] = useState('');
  const [editContact, setEditContact] = useState('');

  useEffect(function () {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    loadMyListings();
  }, []);

  async function loadMyListings() {
    try {
      const response = await fetch(API_BASE + '/api/my-listings', {
        headers: authHeaders(),
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      const data = await response.json();
      setListings(data);
    } catch (err) {
      console.error('Failed to load my listings:', err);
    }
    setLoading(false);
  }

  async function handleDelete(id, type) {
    const confirmed = window.confirm('Delete this listing?');
    if (!confirmed) return;

    try {
      const response = await fetch(
        API_BASE + '/api/listings/' + type + '/' + id,
        {
          method: 'DELETE',
          headers: authHeaders(),
        }
      );

      if (response.ok) {
        await loadMyListings();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete.');
      }
    } catch (err) {
      alert('Could not connect to server.');
    }
  }

  function startEditing(item) {
    setEditingListing(item);
    setEditTitle(item.title);
    setEditPricingModel(item.pricing_model);
    setEditPrice(item.price);
    setEditContact(item.contact || '');
  }

  function cancelEditing() {
    setEditingListing(null);
  }

  async function handleUpdateSubmit(event, id, type) {
    event.preventDefault();

    const body = {
      title: editTitle,
      pricing_model: editPricingModel,
      price: editPricingModel === 'PAID' ? editPrice : 0,
      contact: editContact,
    };

    try {
      const response = await fetch(API_BASE + '/api/listings/' + type + '/' + id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setEditingListing(null);
        setLoading(true);
        await loadMyListings();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update.');
      }
    } catch (err) {
      alert('Could not connect to server.');
    }
  }

  if (loading) {
    return <p className="text-center text-gray-500 mt-20">Loading your listings...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">My Listings</h1>
        <span className="text-sm text-gray-500">{listings.length} listing{listings.length !== 1 ? 's' : ''}</span>
      </div>

      {listings.length === 0 && (
        <p className="text-center text-gray-600 mt-20">You haven't posted anything yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map(function (item) {
          const isEditing = editingListing !== null && editingListing.id === item.id && editingListing.type === item.type;

          if (isEditing) {
            return (
              <div key={item.type + '-' + item.id} className="bg-gray-800 border-2 border-indigo-500 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Editing</span>
                  <TypeBadge type={item.type} />
                </div>

                <form
                  onSubmit={function (e) { handleUpdateSubmit(e, item.id, item.type); }}
                  className="flex flex-col gap-3"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={function (e) { setEditTitle(e.target.value); }}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Pricing</label>
                    <div className="flex gap-2">
                      {['FREE', 'CHAI', 'PAID'].map(function (model) {
                        return (
                          <button
                            key={model}
                            type="button"
                            onClick={function () { setEditPricingModel(model); }}
                            className={
                              'flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ' +
                              (editPricingModel === model
                                ? 'bg-indigo-900 border-indigo-500 text-indigo-300'
                                : 'bg-gray-900 border-gray-600 text-gray-400')
                            }
                          >
                            {model === 'FREE' ? 'Free' : model === 'CHAI' ? 'Chai ☕' : 'Paid ₹'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {editPricingModel === 'PAID' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={editPrice}
                        onChange={function (e) { setEditPrice(e.target.value); }}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Contact</label>
                    <input
                      type="text"
                      value={editContact}
                      onChange={function (e) { setEditContact(e.target.value); }}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            );
          }

          return (
            <div key={item.type + '-' + item.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-2 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-100 text-base truncate pr-2">{item.title}</h3>
                <TypeBadge type={item.type} />
              </div>
              <div className="flex items-center justify-between">
                <PriceBadge pricingModel={item.pricing_model} price={item.price} />
                <span className="text-xs text-gray-500">#{item.id}</span>
              </div>
              {item.contact && (
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-700 rounded-lg px-3 py-1.5">
                  <span>📞</span>
                  <span>{item.contact}</span>
                </div>
              )}

              <div className="flex gap-2 mt-1 pt-2 border-t border-gray-700">
                <button
                  onClick={function () { startEditing(item); }}
                  className="flex-1 bg-blue-900 hover:bg-blue-800 text-blue-300 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={function () { handleDelete(item.id, item.type); }}
                  className="flex-1 bg-red-900 hover:bg-red-800 text-red-300 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CREATE LISTING VIEW (protected) ─────────────────────────────────────────

function CreateListingView() {
  const navigate = useNavigate();

  const [listingType, setListingType] = useState('PRODUCT');
  const [title, setTitle] = useState('');
  const [pricingModel, setPricingModel] = useState('FREE');
  const [price, setPrice] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(function () {
    if (!getToken()) {
      navigate('/login');
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = listingType === 'PRODUCT' ? '/api/products' : '/api/services';
    const body = {
      title: title,
      pricing_model: pricingModel,
      price: pricingModel === 'PAID' ? price : 0,
      contact: contact,
    };

    try {
      const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        setError(data.error || 'Something went wrong.');
      } else {
        navigate('/feed');
      }
    } catch (err) {
      setError('Could not connect to server.');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Post a Gig</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={function () { setListingType('PRODUCT'); }}
                className={
                  'flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ' +
                  (listingType === 'PRODUCT'
                    ? 'bg-green-900 border-green-600 text-green-300'
                    : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-gray-500')
                }
              >
                📦 Product
              </button>
              <button
                type="button"
                onClick={function () { setListingType('SERVICE'); }}
                className={
                  'flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ' +
                  (listingType === 'SERVICE'
                    ? 'bg-purple-900 border-purple-600 text-purple-300'
                    : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-gray-500')
                }
              >
                🛠️ Service
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="post-title">
              Title
            </label>
            <input
              id="post-title"
              type="text"
              placeholder={listingType === 'PRODUCT' ? 'e.g. Used Headset' : 'e.g. Linux Installation'}
              value={title}
              onChange={function (e) { setTitle(e.target.value); }}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Pricing</label>
            <div className="flex gap-2">
              {['FREE', 'CHAI', 'PAID'].map(function (model) {
                return (
                  <button
                    key={model}
                    type="button"
                    onClick={function () { setPricingModel(model); }}
                    className={
                      'flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ' +
                      (pricingModel === model
                        ? 'bg-indigo-900 border-indigo-500 text-indigo-300'
                        : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-gray-500')
                    }
                  >
                    {model === 'FREE' ? 'Free' : model === 'CHAI' ? 'Chai ☕' : 'Paid ₹'}
                  </button>
                );
              })}
            </div>
          </div>

          {pricingModel === 'PAID' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="post-price">
                Amount (₹)
              </label>
              <input
                id="post-price"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 499"
                value={price}
                onChange={function (e) { setPrice(e.target.value); }}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="post-contact">
              Contact (Phone / Email)
            </label>
            <input
              id="post-contact"
              type="text"
              placeholder="e.g. 9876543210"
              value={contact}
              onChange={function (e) { setContact(e.target.value); }}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-60 mt-1"
          >
            {loading ? 'Posting...' : 'Post Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

function App() {
  const [loggedIn, setLoggedIn] = useState(function () {
    return getUserIdFromToken() !== null;
  });

  function handleLogin() {
    setLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setLoggedIn(false);
  }

  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen text-gray-100" style={{ background: '#050505' }}>
            <Navbar loggedIn={loggedIn} onLogout={handleLogout} />

            <Routes>
              <Route path="/" element={<MarketFeed />} />
              <Route path="/feed" element={<MarketFeed />} />
              <Route path="/login" element={<LoginView onLogin={handleLogin} />} />
              <Route path="/register" element={<RegisterView onLogin={handleLogin} />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/post" element={<PostListing />} />
              <Route path="/listing/:type/:id" element={<ListingDetail />} />
              <Route path="/receipt" element={<ReceiptPage />} />
            </Routes>
            <AppFooter />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );
}

export default App;
