import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useSetRecoilState } from 'recoil';
import { selectedListingAtom } from '../state/listingAtoms.js';

// ─── PLACEHOLDER IMAGES ───────────────────────────────────────────────────────

var PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
  'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=600&q=80',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
];

function getPlaceholderImage(id) {
  var index = Math.abs((id || 0)) % PLACEHOLDER_IMAGES.length;
  return PLACEHOLDER_IMAGES[index];
}

// ─── PRICE BADGE ──────────────────────────────────────────────────────────────

function PricePill(props) {
  var model = props.pricingModel;
  var price = props.price;

  var label = '';
  var style = {};

  if (model === 'FREE') {
    label = 'Free';
    style = {
      background: 'rgba(99,102,241,0.18)',
      border: '1px solid rgba(99,102,241,0.35)',
      color: '#a5b4fc',
      backdropFilter: 'blur(8px)',
    };
  } else if (model === 'CHAI') {
    label = 'Chai ☕';
    style = {
      background: 'rgba(251,191,36,0.14)',
      border: '1px solid rgba(251,191,36,0.28)',
      color: '#fcd34d',
      backdropFilter: 'blur(8px)',
    };
  } else {
    label = '₹' + parseFloat(price).toFixed(0);
    style = {
      background: 'rgba(59,130,246,0.18)',
      border: '1px solid rgba(59,130,246,0.35)',
      color: '#93c5fd',
      backdropFilter: 'blur(8px)',
    };
  }

  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={style}
    >
      {label}
    </span>
  );
}

// ─── TYPE PILL ────────────────────────────────────────────────────────────────

function TypePill(props) {
  var type = props.type;

  if (type === 'PRODUCT') {
    return (
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{
          background: 'rgba(99,102,241,0.14)',
          border: '1px solid rgba(99,102,241,0.25)',
          color: '#a5b4fc',
          backdropFilter: 'blur(8px)',
        }}
      >
        Product
      </span>
    );
  }
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: 'rgba(139,92,246,0.14)',
        border: '1px solid rgba(139,92,246,0.25)',
        color: '#c4b5fd',
        backdropFilter: 'blur(8px)',
      }}
    >
      Service
    </span>
  );
}

// ─── LISTING CARD ─────────────────────────────────────────────────────────────

/**
 * ListingCard — image-first glassmorphism card for the MarketFeed grid.
 *
 * Glass formula: bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl
 * Hover: image scales up, border glows blue (border-blue-500/30)
 *
 * Props: props.item → { id, type, title, pricing_model, price, contact }
 *
 * RSM JS Style: no arrow functions, no destructuring.
 */
function ListingCard(props) {
  var item = props.item;
  var cardRef = useRef(null);
  var imgRef = useRef(null);
  var glowRef = useRef(null);
  var setSelectedListing = useSetRecoilState(selectedListingAtom);

  var imageUrl = item.image_url || getPlaceholderImage(item.id);
  var linkPath = '/listing/' + item.type + '/' + item.id;

  function handleMouseEnter() {
    // Image scale up
    gsap.to(imgRef.current, {
      scale: 1.06,
      duration: 0.45,
      ease: 'power2.out',
    });
    // Card border brightens to blue glow
    gsap.to(cardRef.current, {
      boxShadow: '0 0 0 1px rgba(59,130,246,0.3), 0 20px 60px rgba(59,130,246,0.12)',
      duration: 0.3,
      ease: 'power2.out',
    });
    // Glow overlay brightens
    gsap.to(glowRef.current, {
      opacity: 1,
      duration: 0.3,
    });
  }

  function handleMouseLeave() {
    gsap.to(imgRef.current, {
      scale: 1,
      duration: 0.4,
      ease: 'power2.out',
    });
    gsap.to(cardRef.current, {
      boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.4)',
      duration: 0.35,
      ease: 'power2.out',
    });
    gsap.to(glowRef.current, {
      opacity: 0,
      duration: 0.35,
    });
  }

  function handleClick() {
    setSelectedListing(item);
  }

  return (
    <Link to={linkPath} onClick={handleClick} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* ── IMAGE CONTAINER — 4:3 aspect ratio ──────────── */}
        <div
          className="relative w-full overflow-hidden"
          style={{ paddingTop: '75%' }}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'cover', transformOrigin: 'center center' }}
            onError={function (e) {
              e.currentTarget.src = PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];
            }}
          />

          {/* Blue glow overlay on hover */}
          <div
            ref={glowRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0,
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.06) 100%)',
            }}
          />

          {/* Bottom image fade to card body */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: '55%',
              background: 'linear-gradient(to top, rgba(10,10,15,0.92) 0%, rgba(10,10,15,0.3) 60%, transparent 100%)',
            }}
          />

          {/* Top badges row */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <TypePill type={item.type} />
            <PricePill pricingModel={item.pricing_model} price={item.price} />
          </div>
        </div>

        {/* ── INFO SECTION ─────────────────────────────────── */}
        <div className="px-4 pb-4 pt-3">
          {/* Divider shimmer line */}
          <div
            className="mb-3 h-px w-full"
            style={{
              background: 'linear-gradient(90deg, rgba(99,102,241,0.3) 0%, rgba(255,255,255,0.04) 100%)',
            }}
          />

          <h3
            className="font-bold text-sm leading-snug text-white"
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
            <p
              className="text-xs mt-1.5 truncate"
              style={{ color: 'rgba(148,163,184,0.6)' }}
            >
              {item.contact.indexOf('@') !== -1 ? '✉ ' : '📞 '}
              {item.contact}
            </p>
          )}

          <div
            className="flex items-center gap-1 mt-3 text-xs font-semibold"
            style={{ color: '#6366f1' }}
          >
            View Deal
            <span style={{ fontSize: '10px', marginLeft: '2px' }}>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ListingCard;
