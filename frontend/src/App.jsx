import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000';

//HELPERS

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
  const item = props.item;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-2 hover:border-indigo-500 transition-colors">
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
    </div>
  );
}



function Navbar(props) {
  const loggedInUserId = props.loggedInUserId;
  const onLogout = props.onLogout;

  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xl font-extrabold text-indigo-400 tracking-tight leading-tight">
            SKILLNET
          </div>
          <div className="text-xs text-gray-500 leading-tight">
            Muthoot Institute of Technology and Science
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/feed" className="text-gray-300 hover:text-indigo-400 transition-colors font-medium">
            Feed
          </Link>

          {loggedInUserId && ( //this is a conditional rendering, if the user is logged in then show these links
            <>
              <Link to="/my-listings" className="text-gray-300 hover:text-indigo-400 transition-colors font-medium">
                My Listings
              </Link>
              <Link to="/post" className="text-gray-300 hover:text-indigo-400 transition-colors font-medium">
                Post Gig
              </Link>
              <button
                onClick={onLogout}
                className="bg-red-900 hover:bg-red-800 text-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          )}

          {!loggedInUserId && (
            <Link
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

//LOGIN VIEW

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
        localStorage.setItem('userId', data.userId);
        onLogin(data.userId);
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
              placeholder="admin@skillnet.com"
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
          Test credentials: <span className="text-gray-300">admin@skillnet.com / password123</span>
        </p>
      </div>
    </div>
  );
}

//FEED VIEW


function FeedView() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadFeed() {
    try {
      const response = await fetch(API_BASE + '/api/feed');
      const data = await response.json();
      setListings(data);
    } catch (err) {
      console.error('Failed to load feed:', err);
    }
    setLoading(false);
  }

  useEffect(function () {
    loadFeed();
  }, []); //we put inside useeffect to avoid infinite loop,also this is just to run the app once the component mounts for the first time

  if (loading) {
    return <p className="text-center text-gray-500 mt-20">Loading feed...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Live Feed</h1>
        <span className="text-sm text-gray-500">{listings.length} listing{listings.length !== 1 ? 's' : ''}</span>
      </div>

      {listings.length === 0 && (
        <p className="text-center text-gray-600 mt-20">No listings yet. Be the first!</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map(function (item) {
          return <ListingCard key={item.type + '-' + item.id} item={item} />;
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MY LISTINGS VIEW
═══════════════════════════════════════ */

function MyListingsView(props) {
  const loggedInUserId = props.loggedInUserId;
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState(null);

  const [editTitle, setEditTitle] = useState('');
  const [editPricingModel, setEditPricingModel] = useState('FREE');
  const [editPrice, setEditPrice] = useState('');
  const [editContact, setEditContact] = useState('');

  useEffect(function () {
    if (!loggedInUserId) {
      navigate('/login');
      return;
    }
    loadMyListings();
  }, [loggedInUserId]);

  async function loadMyListings() {
    try {
      const response = await fetch(API_BASE + '/api/my-listings?userId=' + loggedInUserId);
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
        API_BASE + '/api/listings/' + type + '/' + id + '?userId=' + loggedInUserId,
        { method: 'DELETE' }
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
      userId: loggedInUserId,
    };

    try {
      const response = await fetch(API_BASE + '/api/listings/' + type + '/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

/* ═══════════════════════════════════════
   CREATE LISTING VIEW
═══════════════════════════════════════ */

function CreateListingView(props) {
  const loggedInUserId = props.loggedInUserId;
  const navigate = useNavigate();

  const [listingType, setListingType] = useState('PRODUCT');
  const [title, setTitle] = useState('');
  const [pricingModel, setPricingModel] = useState('FREE');
  const [price, setPrice] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(function () {
    if (!loggedInUserId) {
      navigate('/login');
    }
  }, [loggedInUserId]);

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
      user_id: loggedInUserId,
    };

    try {
      const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
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



function App() {
  const [loggedInUserId, setLoggedInUserId] = useState(
    localStorage.getItem('userId')
  );

  function handleLogin(userId) {
    setLoggedInUserId(userId);
  }

  function handleLogout() {
    localStorage.removeItem('userId');
    setLoggedInUserId(null);
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar loggedInUserId={loggedInUserId} onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<FeedView />} />
          <Route path="/feed" element={<FeedView />} />
          <Route
            path="/login"
            element={<LoginView onLogin={handleLogin} />}
          />
          <Route
            path="/my-listings"
            element={<MyListingsView loggedInUserId={loggedInUserId} />}
          />
          <Route
            path="/post"
            element={<CreateListingView loggedInUserId={loggedInUserId} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
