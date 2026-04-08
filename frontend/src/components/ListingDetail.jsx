import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useQuery } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { selectedListingAtom } from '../state/listingAtoms.js';
import CheckoutModal from './CheckoutModal.jsx';
import AnimationWrapper from './AnimationWrapper.jsx';

gsap.registerPlugin(ScrollTrigger);

var API_BASE = '';

// ─── GRADIENT PLACEHOLDER (when listing has no image_url) ───────────────────

function getHeroGradient(type) {
  if (type === 'SERVICE') {
    return 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.18) 50%, rgba(5,5,5,1) 100%)';
  }
  return 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(59,130,246,0.18) 50%, rgba(5,5,5,1) 100%)';
}

function getHeroIcon(type) {
  return type === 'SERVICE' ? '\uD83D\uDEE0\uFE0F' : '\uD83D\uDCE6';
}

// ─── DATA FETCHER ─────────────────────────────────────────────────────────────

function fetchFeed() {
  return fetch(API_BASE + '/api/feed').then(function (res) {
    return res.json();
  });
}

// ─── GLASS CARD WRAPPER ───────────────────────────────────────────────────────

/**
 * GlassPanel — applies the exact glass formula to any children.
 * bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl
 */
function GlassPanel(props) {
  var children = props.children;
  var className = props.className || '';
  var extraStyle = props.style || {};

  var baseStyle = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
  };

  var mergedStyle = Object.assign({}, baseStyle, extraStyle);

  return (
    <div className={'rounded-2xl ' + className} style={mergedStyle}>
      {children}
    </div>
  );
}

// ─── PRICING BLOCK (V3 Glass) ─────────────────────────────────────────────────

function PricingBlock(props) {
  var model = props.pricingModel;
  var price = props.price;

  var label = '';
  var sublabel = '';
  var accentStyle = {};

  if (model === 'FREE') {
    label = 'Free';
    sublabel = 'No cost. Just connect.';
    accentStyle = {
      color: '#a5b4fc',
      textShadow: '0 0 20px rgba(165,180,252,0.4)',
    };
  } else if (model === 'CHAI') {
    label = 'Chai ☕';
    sublabel = 'Barter deal — buy them a chai!';
    accentStyle = {
      color: '#fcd34d',
      textShadow: '0 0 20px rgba(252,211,77,0.3)',
    };
  } else {
    label = '₹' + parseFloat(price).toFixed(2);
    sublabel = 'Secure campus payment';
    accentStyle = {
      color: '#93c5fd',
      textShadow: '0 0 24px rgba(147,197,253,0.4)',
    };
  }

  return (
    <GlassPanel className="p-5 relative overflow-hidden">
      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
        }}
      />
      {/* Corner blue glow orb */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          transform: 'translate(25%, -25%)',
        }}
      />

      <div
        className="text-xs font-bold uppercase tracking-widest mb-3 relative z-10"
        style={{ color: 'rgba(99,102,241,0.7)', letterSpacing: '0.18em' }}
      >
        Pricing
      </div>

      <div className="flex items-end justify-between relative z-10">
        <div>
          <div
            className="font-black text-3xl tracking-tight"
            style={accentStyle}
          >
            {label}
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(148,163,184,0.5)' }}>
            {sublabel}
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          {model === 'FREE' ? '🎁' : model === 'CHAI' ? '🤝' : '💳'}
        </div>
      </div>
    </GlassPanel>
  );
}

// ─── CONTACT CARD (V3 Glass) ──────────────────────────────────────────────────

function ContactCard(props) {
  var contact = props.contact;
  var type = props.type;

  var availability = type === 'SERVICE'
    ? 'Mon – Fri, 9 AM – 6 PM (Campus Hours)'
    : 'Flexible — message to arrange pickup';

  var isEmail = contact && contact.indexOf('@') !== -1;

  return (
    <GlassPanel className="p-5 relative overflow-hidden">
      {/* Top shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)',
        }}
      />

      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          }}
        >
          ✓
        </div>
        <div>
          <div className="text-sm font-bold text-white">Verified Campus Seller</div>
          <div className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>
            Identity confirmed by MITS
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {isEmail ? '📧' : '📞'}
          </div>
          <div>
            <div className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
              {isEmail ? 'Campus Email' : 'Contact Number'}
            </div>
            <div className="text-sm font-semibold" style={{ color: '#a5b4fc' }}>
              {contact || 'Contact not provided'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            🕐
          </div>
          <div>
            <div className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
              Availability
            </div>
            <div className="text-sm font-medium" style={{ color: 'rgba(148,163,184,0.7)' }}>
              {availability}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            🏫
          </div>
          <div>
            <div className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
              Campus
            </div>
            <div className="text-sm font-medium" style={{ color: 'rgba(148,163,184,0.7)' }}>
              Muthoot Institute of Technology &amp; Science
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

// ─── TRUST BADGE ──────────────────────────────────────────────────────────────

function TrustBadge(props) {
  var icon = props.icon;
  var title = props.title;
  var sub = props.sub;

  return (
    <div
      className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-bold text-white">{title}</span>
      <span className="text-xs" style={{ color: 'rgba(100,116,139,0.7)' }}>{sub}</span>
    </div>
  );
}

// ─── CLAIM BUTTON ─────────────────────────────────────────────────────────────

function ClaimButton(props) {
  var onClick = props.onClick;
  var btnRef = useRef(null);

  useEffect(function () {
    if (!btnRef.current) return;

    var tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(btnRef.current, {
      boxShadow: '0 8px 48px rgba(99,102,241,0.6)',
      duration: 1.4,
      ease: 'sine.inOut',
    });
    tl.to(btnRef.current, {
      boxShadow: '0 8px 24px rgba(99,102,241,0.28)',
      duration: 1.4,
      ease: 'sine.inOut',
    });

    return function () { tl.kill(); };
  }, []);

  function handleMouseEnter() {
    gsap.to(btnRef.current, { scale: 1.025, duration: 0.2, ease: 'power2.out' });
  }

  function handleMouseLeave() {
    gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
  }

  function handleMouseDown() {
    gsap.to(btnRef.current, { scale: 0.975, duration: 0.1 });
  }

  function handleMouseUp() {
    gsap.to(btnRef.current, { scale: 1.025, duration: 0.15, ease: 'back.out(2)' });
  }

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="w-full py-4 rounded-2xl font-extrabold text-base text-white tracking-wide relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
        boxShadow: '0 8px 32px rgba(99,102,241,0.45)',
        letterSpacing: '0.04em',
      }}
    >
      {/* Shine sweep */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
        }}
      />
      <span className="relative z-10">⚡ Claim Deal</span>
    </button>
  );
}

// ─── LISTING DETAIL (V3) ──────────────────────────────────────────────────────

/**
 * ListingDetail — full detail page with:
 *   - Hero image gallery section at the top
 *   - Glassmorphism detail cards (pricing, seller info)
 *   - GSAP ScrollTrigger parallax on hero
 *   - AnimationWrapper staggered card entrance
 *
 * RSM JS Style: no arrow functions, no destructuring.
 */
function ListingDetail() {
  var params = useParams();
  var listingType = params.type;
  var listingId = params.id;
  var navigate = useNavigate();

  var setSelectedListing = useSetRecoilState(selectedListingAtom);

  var showModalState = useState(false);
  var showModal = showModalState[0];
  var setShowModal = showModalState[1];

  var heroRef = useRef(null);
  var heroImgRef = useRef(null);
  var titleRef = useRef(null);
  var detailsRef = useRef(null);

  // React Query — fetch public feed then find listing
  var queryResult = useQuery({
    queryKey: ['feed'],
    queryFn: fetchFeed,
    staleTime: 60000,
  });

  var allListings = queryResult.data;
  var isLoading = queryResult.isLoading;
  var isError = queryResult.isError;

  var listing = null;
  if (allListings) {
    var i = 0;
    while (i < allListings.length) {
      var candidate = allListings[i];
      var candidateId = String(candidate.id);
      var candidateType = candidate.type;
      if (candidateId === String(listingId) && candidateType === listingType) {
        listing = candidate;
        break;
      }
      i = i + 1;
    }
  }

  useEffect(function () {
    if (listing) {
      setSelectedListing(listing);
    }
  }, [listing]);

  useEffect(function () {
    if (!listing) return;

    // Title entrance
    gsap.fromTo(
      titleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', delay: 0.1 }
    );

    // Detail cards stagger
    var detailChildren = detailsRef.current ? detailsRef.current.children : [];
    gsap.fromTo(
      detailChildren,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', stagger: 0.1, delay: 0.25 }
    );

    // Hero image parallax
    ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: function (self) {
        if (heroImgRef.current) {
          gsap.set(heroImgRef.current, { y: self.progress * 80 });
        }
      },
    });

    return function () {
      ScrollTrigger.getAll().forEach(function (st) {
        st.kill();
      });
    };
  }, [listing]);

  // ── LOADING ──────────────────────────────────────────────────────────────────
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

  // ── ERROR ────────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#050505' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">😞</div>
          <p className="text-white font-bold mb-2">Could not load listing</p>
          <Link to="/feed" className="text-indigo-400 hover:underline text-sm">← Back to Feed</Link>
        </div>
      </div>
    );
  }

  // ── NOT FOUND ────────────────────────────────────────────────────────────────
  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#050505' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-white font-black text-xl mb-2">Listing not found</p>
          <p className="text-sm mb-6" style={{ color: 'rgba(148,163,184,0.5)' }}>
            This deal may have been claimed or removed.
          </p>
          <Link to="/feed" className="text-indigo-400 hover:underline text-sm">← Explore other deals</Link>
        </div>
      </div>
    );
  }

  // ── RESOLVED ─────────────────────────────────────────────────────────────────
  var listingTitle = listing.title;
  var listingPricingModel = listing.pricing_model;
  var listingPrice = listing.price;
  var listingContact = listing.contact;

  var hasImage = !!(listing.image_url);
  var heroImageUrl = listing.image_url;

  var typeLabel = listingType === 'PRODUCT' ? 'Product' : 'Service';
  var typeStyle = listingType === 'PRODUCT'
    ? {
        background: 'rgba(99,102,241,0.14)',
        border: '1px solid rgba(99,102,241,0.28)',
        color: '#a5b4fc',
        backdropFilter: 'blur(8px)',
      }
    : {
        background: 'rgba(139,92,246,0.14)',
        border: '1px solid rgba(139,92,246,0.28)',
        color: '#c4b5fd',
        backdropFilter: 'blur(8px)',
      };

  var priceDisplay = listingPricingModel === 'FREE'
    ? 'Free'
    : listingPricingModel === 'CHAI'
      ? 'Chai ☕'
      : '₹' + parseFloat(listingPrice).toFixed(2);

  var fallbackDescription = listingType === 'SERVICE'
    ? 'A fellow campus student is offering this service. Reach out via the contact below to discuss scope, timing, and delivery.'
    : 'A campus seller is offering this item. Inspect before buying — meet at a common campus area and confirm availability via the contact below.';

  var descriptionText = listing.description || fallbackDescription;

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>

      {/* ── HERO IMAGE GALLERY ──────────────────────────────────── */}
      <div
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ height: '420px' }}
      >
        {/* Parallax image */}
        <div
          ref={heroImgRef}
          className="absolute w-full"
          style={{ top: '-60px', height: 'calc(100% + 120px)' }}
        >
          {hasImage ? (
            <img
              src={heroImageUrl}
              alt={listingTitle}
              className="w-full h-full"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: getHeroGradient(listingType) }}
            >
              <span style={{ fontSize: '5rem', opacity: 0.18 }}>
                {getHeroIcon(listingType)}
              </span>
            </div>
          )}
          {/* Deep gradient overlay for text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.5) 50%, rgba(5,5,5,0.95) 100%)',
            }}
          />
          {/* Blue tint overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 60%)',
            }}
          />
        </div>

        {/* Back button (glass) */}
        <div className="absolute top-5 left-5 z-10">
          <button
            onClick={function () { navigate(-1); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(148,163,184,0.9)',
              backdropFilter: 'blur(12px)',
            }}
          >
            ← Back
          </button>
        </div>

        {/* Deal ID (glass pill) */}
        <div className="absolute top-5 right-5 z-10">
          <div
            className="px-3 py-1 rounded-full text-xs font-mono"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(100,116,139,0.9)',
              backdropFilter: 'blur(12px)',
            }}
          >
            #{listingId}
          </div>
        </div>

        {/* Hero content — title + price overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 z-10">
          <div ref={titleRef}>
            <div className="mb-3">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={typeStyle}
              >
                {typeLabel}
              </span>
            </div>
            <h1
              className="font-black leading-tight text-white"
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
                letterSpacing: '-0.035em',
                textShadow: '0 2px 20px rgba(0,0,0,0.7)',
              }}
            >
              {listingTitle}
            </h1>
            <div className="mt-3">
              <span
                className="font-black text-xl"
                style={{
                  color: '#93c5fd',
                  textShadow: '0 0 20px rgba(147,197,253,0.5)',
                }}
              >
                {priceDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade into page */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, #050505)',
          }}
        />
      </div>

      {/* ── CONTENT SECTION ─────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div ref={detailsRef} className="flex flex-col gap-5">

          {/* Description Glass Card */}
          <GlassPanel className="p-5 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
              }}
            />
            <div
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(99,102,241,0.7)', letterSpacing: '0.18em' }}
            >
              About this {listingType === 'PRODUCT' ? 'Item' : 'Service'}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>
              {descriptionText}
            </p>
            <div
              className="mt-4 pt-4 flex items-center gap-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  background: '#6366f1',
                  boxShadow: '0 0 6px rgba(99,102,241,0.8)',
                }}
              />
              <span className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>
                Active Listing
              </span>
            </div>
          </GlassPanel>

          {/* Pricing Block */}
          <PricingBlock pricingModel={listingPricingModel} price={listingPrice} />

          {/* Contact & Timing */}
          <ContactCard contact={listingContact} type={listingType} />

          {/* CTA Button */}
          <ClaimButton onClick={function () { setShowModal(true); }} pricingModel={listingPricingModel} />

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            <TrustBadge icon="🔒" title="Secure" sub="End-to-end" />
            <TrustBadge icon="🏫" title="Campus" sub="Verified peer" />
            <TrustBadge icon="⚡" title="Instant" sub="Claim now" />
          </div>

        </div>
      </div>

      {/* Checkout Modal */}
      {showModal && (
        <CheckoutModal
          listing={listing}
          onClose={function () { setShowModal(false); }}
        />
      )}
    </div>
  );
}

export default ListingDetail;
