import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

var API_BASE = import.meta.env.VITE_API_URL;

function getCardGradient(type) {
  if (type === 'SERVICE') {
    return 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.15) 100%)';
  }
  return 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(59,130,246,0.15) 100%)';
}

function getCardIcon(type) {
  return type === 'SERVICE' ? '🛠️' : '📦';
}

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  var token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  };
}

// ─── PRICE DISPLAY ────────────────────────────────────────────────────────────

function PriceDisplay(props) {
  var model = props.pricingModel;
  var price = props.price;

  if (model === 'FREE') {
    return <span style={{ color: '#a5b4fc', fontWeight: 700 }}>Free</span>;
  }
  if (model === 'CHAI') {
    return <span style={{ color: '#fcd34d', fontWeight: 700 }}>Chai ☕</span>;
  }
  return (
    <span style={{ color: '#93c5fd', fontWeight: 700 }}>
      ₹{parseFloat(price).toFixed(0)}
    </span>
  );
}

// ─── GLASS INPUT (inline for edit mode) ──────────────────────────────────────

function InlineInput(props) {
  var value = props.value;
  var onChange = props.onChange;
  var type = props.type || 'text';
  var placeholder = props.placeholder || '';

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all"
      style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#f1f5f9',
        caretColor: '#60a5fa',
      }}
      onFocus={function (e) {
        e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.15)';
      }}
      onBlur={function (e) {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

// ─── MY LISTING CARD ─────────────────────────────────────────────────────────

/**
 * MyListingCard — glass card with image, info, and Edit / Delete actions.
 * Props: props.item, props.onEditStart, props.onDelete
 */
function MyListingCard(props) {
  var item = props.item;
  var onEditStart = props.onEditStart;
  var onDelete = props.onDelete;


  var typeStyle = item.type === 'PRODUCT'
    ? {
      background: 'rgba(99,102,241,0.14)',
      border: '1px solid rgba(99,102,241,0.25)',
      color: '#a5b4fc',
    }
    : {
      background: 'rgba(139,92,246,0.14)',
      border: '1px solid rgba(139,92,246,0.25)',
      color: '#c4b5fd',
    };

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '62%' }}>
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
            style={{ background: getCardGradient(item.type) }}
          >
            <span style={{ fontSize: '2.5rem', opacity: 0.25 }}>
              {getCardIcon(item.type)}
            </span>
          </div>
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(5,5,5,0) 40%, rgba(5,5,5,0.85) 100%)',
          }}
        />
        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={typeStyle}
          >
            {item.type === 'PRODUCT' ? 'Product' : 'Service'}
          </span>
        </div>
        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              color: '#93c5fd',
            }}
          >
            {item.pricing_model === 'FREE'
              ? 'Free'
              : item.pricing_model === 'CHAI'
                ? 'Chai'
                : '₹' + parseFloat(item.price).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3 flex-1 flex flex-col gap-2">
        <div
          className="h-px w-full"
          style={{
            background: 'linear-gradient(90deg, rgba(99,102,241,0.25) 0%, transparent 100%)',
          }}
        />
        <h3
          className="text-sm font-bold text-white"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            letterSpacing: '-0.01em',
          }}
        >
          {item.title}
        </h3>
        {item.contact && (
          <p className="text-xs truncate" style={{ color: 'rgba(100,116,139,0.6)' }}>
            {item.contact.indexOf('@') !== -1 ? '✉ ' : '📞 '}
            {item.contact}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div
        className="px-4 pb-4 pt-1 grid grid-cols-2 gap-2"
      >
        <button
          onClick={function () { onEditStart(item); }}
          className="py-2 rounded-xl text-xs font-bold transition-all duration-200"
          style={{
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.25)',
            color: '#93c5fd',
          }}
          onMouseEnter={function (e) {
            e.currentTarget.style.background = 'rgba(59,130,246,0.2)';
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.45)';
          }}
          onMouseLeave={function (e) {
            e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)';
          }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={function () { onDelete(item.id, item.type); }}
          className="py-2 rounded-xl text-xs font-bold transition-all duration-200"
          style={{
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#fca5a5',
          }}
          onMouseEnter={function (e) {
            e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
          }}
          onMouseLeave={function (e) {
            e.currentTarget.style.background = 'rgba(239,68,68,0.07)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
          }}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

// ─── EDIT DRAWER ─────────────────────────────────────────────────────────────

/**
 * EditPanel — inline glass edit panel.
 * Props: props.item, props.onSave, props.onCancel
 */
function EditPanel(props) {
  var item = props.item;
  var onSave = props.onSave;
  var onCancel = props.onCancel;

  var titleState = useState(item.title);
  var editTitle = titleState[0];
  var setEditTitle = titleState[1];

  var pricingModelState = useState(item.pricing_model);
  var editModel = pricingModelState[0];
  var setEditModel = pricingModelState[1];

  var priceState = useState(item.price);
  var editPrice = priceState[0];
  var setEditPrice = priceState[1];

  var contactState = useState(item.contact || '');
  var editContact = contactState[0];
  var setEditContact = contactState[1];

  function handleSubmit(e) {
    e.preventDefault();
    onSave(item.id, item.type, {
      title: editTitle,
      pricing_model: editModel,
      price: editModel === 'PAID' ? editPrice : 0,
      contact: editContact,
    });
  }

  return (
    <div
      className="rounded-2xl p-5 col-span-1"
      style={{
        background: 'rgba(99,102,241,0.05)',
        border: '1px solid rgba(99,102,241,0.2)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        className="text-xs font-bold uppercase tracking-widest mb-4"
        style={{ color: 'rgba(99,102,241,0.8)' }}
      >
        Editing
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(100,116,139,0.7)' }}>
            Title
          </label>
          <InlineInput
            value={editTitle}
            onChange={function (e) { setEditTitle(e.target.value); }}
            placeholder="Listing title"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(100,116,139,0.7)' }}>
            Pricing
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['CHAI', 'PAID'].map(function (model) {
              var isActive = editModel === model;
              return (
                <button
                  key={model}
                  type="button"
                  onClick={function () { setEditModel(model); }}
                  className="py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: isActive ? 'rgba(99,102,241,0.2)' : 'rgba(0,0,0,0.3)',
                    border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    color: isActive ? '#a5b4fc' : 'rgba(148,163,184,0.5)',
                  }}
                >
                  {model === 'CHAI' ? 'Chai ☕' : 'Paid ₹'}
                </button>
              );
            })}
          </div>
        </div>

        {editModel === 'PAID' && (
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(100,116,139,0.7)' }}>
              Amount (₹)
            </label>
            <InlineInput
              type="number"
              value={editPrice}
              onChange={function (e) { setEditPrice(e.target.value); }}
              placeholder="499"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(100,116,139,0.7)' }}>
            Contact
          </label>
          <InlineInput
            value={editContact}
            onChange={function (e) { setEditContact(e.target.value); }}
            placeholder="Phone or email"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            type="submit"
            className="py-2 rounded-xl text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="py-2 rounded-xl text-xs font-bold"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(148,163,184,0.6)',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── MY LISTINGS ──────────────────────────────────────────────────────────────

/**
 * MyListings — premium glass grid of the user's own listings.
 * Matches the MarketFeed visual quality with Edit / Delete actions.
 *
 * RSM JS Style: no arrow functions, no destructuring.
 */
function MyListings() {
  var navigate = useNavigate();
  var gridRef = useRef(null);
  var pageRef = useRef(null);

  var listingsState = useState([]);
  var listings = listingsState[0];
  var setListings = listingsState[1];

  var loadingState = useState(true);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];

  var editingState = useState(null);
  var editingItem = editingState[0];
  var setEditingItem = editingState[1];

  useEffect(function () {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    loadMyListings();
  }, []);

  /* GSAP stagger after data loads */
  useEffect(function () {
    if (isLoading) return;
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.08, ease: 'power3.out' }
      );
    }
    if (gridRef.current && gridRef.current.children.length > 0) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, [isLoading]);

  async function loadMyListings() {
    setIsLoading(true);
    try {
      var response = await fetch(API_BASE + '/api/my-listings', {
        headers: authHeaders(),
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      var data = await response.json();
      setListings(data);
    } catch (err) {
      console.error('Failed to load my listings:', err);
    }
    setIsLoading(false);
  }

  async function handleDelete(id, type) {
    var confirmed = window.confirm('Delete this listing?');
    if (!confirmed) return;

    try {
      var response = await fetch(
        API_BASE + '/api/listings/' + type + '/' + id,
        { method: 'DELETE', headers: authHeaders() }
      );
      if (response.ok) {
        setListings(listings.filter(function (item) {
          return !(String(item.id) === String(id) && item.type === type);
        }));
      } else {
        var data = await response.json();
        alert(data.error || 'Failed to delete.');
      }
    } catch (err) {
      alert('Could not connect to server.');
    }
  }

  async function handleSave(id, type, body) {
    try {
      var response = await fetch(API_BASE + '/api/listings/' + type + '/' + id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setEditingItem(null);
        loadMyListings();
      } else {
        var data = await response.json();
        alert(data.error || 'Failed to update.');
      }
    } catch (err) {
      alert('Could not connect to server.');
    }
  }

  function handleEditStart(item) {
    setEditingItem(item);
  }

  function handleEditCancel() {
    setEditingItem(null);
  }

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-11 h-11 rounded-full animate-spin"
            style={{ border: '2px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1' }}
          />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(99,102,241,0.6)' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen py-10 px-5"
      style={{
        background: '#050505',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 55%)',
      }}
    >
      <div className="max-w-6xl mx-auto" ref={pageRef}>

        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: 'rgba(99,102,241,0.8)', letterSpacing: '0.2em' }}
            >
              SkillNet · My Account
            </div>
            <h1
              className="font-black text-white"
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                letterSpacing: '-0.04em',
              }}
            >
              My{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #818cf8, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Listings
              </span>
            </h1>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: 'rgba(165,180,252,0.8)',
            }}
          >
            {listings.length} {listings.length !== 1 ? 'listings' : 'listing'}
          </div>
        </div>

        {/* Empty state */}
        {listings.length === 0 && (
          <div className="text-center py-28">
            <div className="text-5xl mb-5">📭</div>
            <p className="font-black text-white text-xl mb-2" style={{ letterSpacing: '-0.03em' }}>
              Nothing posted yet
            </p>
            <p className="text-sm mb-6" style={{ color: 'rgba(148,163,184,0.45)' }}>
              Post your first gig and start earning on campus!
            </p>
            <a
              href="/post"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
              }}
            >
              ⚡ Post a Gig
            </a>
          </div>
        )}

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {listings.map(function (item) {
            var isEditing = editingItem !== null
              && String(editingItem.id) === String(item.id)
              && editingItem.type === item.type;

            if (isEditing) {
              return (
                <EditPanel
                  key={item.type + '-' + item.id}
                  item={item}
                  onSave={handleSave}
                  onCancel={handleEditCancel}
                />
              );
            }

            return (
              <MyListingCard
                key={item.type + '-' + item.id}
                item={item}
                onEditStart={handleEditStart}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MyListings;
