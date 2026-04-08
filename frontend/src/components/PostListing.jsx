import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

var API_BASE = import.meta.env.VITE_API_URL;

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

// ─── GLASS INPUT ──────────────────────────────────────────────────────────────

function GlassInput(props) {
  var type = props.type || 'text';
  var id = props.id;
  var value = props.value;
  var onChange = props.onChange;
  var placeholder = props.placeholder || '';
  var required = props.required || false;
  var min = props.min;
  var step = props.step;

  var inputRef = useRef(null);

  function handleFocus() {
    inputRef.current.style.borderColor = 'rgba(59,130,246,0.6)';
    inputRef.current.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.2), 0 0 16px rgba(59,130,246,0.08)';
  }

  function handleBlur() {
    inputRef.current.style.borderColor = 'rgba(255,255,255,0.08)';
    inputRef.current.style.boxShadow = 'none';
  }

  return (
    <input
      ref={inputRef}
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      required={required}
      min={min}
      step={step}
      className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
      style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#f1f5f9',
        caretColor: '#60a5fa',
      }}
    />
  );
}

function FieldLabel(props) {
  var htmlFor = props.htmlFor;
  var children = props.children;
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-bold uppercase tracking-widest mb-2"
      style={{ color: 'rgba(99,102,241,0.8)', letterSpacing: '0.16em' }}
    >
      {children}
    </label>
  );
}

// ─── POST LISTING ─────────────────────────────────────────────────────────────

/**
 * PostListing — premium glass form. Two pricing options: PAID or CHAI.
 * Image is read as base64 via FileReader and sent as `image_url` in JSON body.
 * RSM JS Style: no arrow functions, no destructuring.
 */
function PostListing() {
  var navigate = useNavigate();
  var pageRef = useRef(null);

  var typeState = useState('PRODUCT');
  var listingType = typeState[0];
  var setListingType = typeState[1];

  var titleState = useState('');
  var title = titleState[0];
  var setTitle = titleState[1];

  // Only PAID or CHAI — no FREE option per user directive
  var pricingModelState = useState('CHAI');
  var pricingModel = pricingModelState[0];
  var setPricingModel = pricingModelState[1];

  var priceState = useState('');
  var price = priceState[0];
  var setPrice = priceState[1];

  var contactState = useState('');
  var contact = contactState[0];
  var setContact = contactState[1];

  var descriptionState = useState('');
  var description = descriptionState[0];
  var setDescription = descriptionState[1];

  var imageBase64State = useState(null);
  var imageBase64 = imageBase64State[0];
  var setImageBase64 = imageBase64State[1];

  var previewUrlState = useState(null);
  var previewUrl = previewUrlState[0];
  var setPreviewUrl = previewUrlState[1];

  var imageFileNameState = useState('');
  var imageFileName = imageFileNameState[0];
  var setImageFileName = imageFileNameState[1];

  var isDraggingState = useState(false);
  var isDragging = isDraggingState[0];
  var setIsDragging = isDraggingState[1];

  var loadingState = useState(false);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];

  var errorState = useState('');
  var error = errorState[0];
  var setError = errorState[1];

  var fileInputRef = useRef(null);

  useEffect(function () {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    // GSAP entry animation
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, []);

  /**
   * Reads a File object and stores base64 result in state.
   * This is the correct approach: the base64 string is sent to the server
   * as `image_url` in the JSON body. No hardcoded placeholder is used.
   */
  function readFileAsBase64(file) {
    var reader = new FileReader();
    reader.onloadend = function () {
      // reader.result is a data URL: "data:image/jpeg;base64,/9j/..."
      setImageBase64(reader.result);
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    setImageFileName(file.name);
  }

  function handleFileChange(e) {
    var file = e.target.files[0];
    if (!file) return;
    readFileAsBase64(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    var file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    readFileAsBase64(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleRemoveImage() {
    setImageBase64(null);
    setPreviewUrl(null);
    setImageFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    var endpoint = listingType === 'PRODUCT' ? '/api/products' : '/api/services';

    // Build the JSON body.
    // image_url receives the real base64 data URI from FileReader — NOT a placeholder.
    var body = {
      title: title,
      description: description,
      pricing_model: pricingModel,
      price: pricingModel === 'PAID' ? parseFloat(price) : 0,
      contact: contact,
      image_url: imageBase64 || null,
    };

    try {
      var response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      var data = await response.json();

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

    setIsLoading(false);
  }

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        background: '#050505',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 55%)',
      }}
    >
      <div className="max-w-3xl mx-auto" ref={pageRef}>

        {/* Page header */}
        <div className="mb-8">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: 'rgba(99,102,241,0.8)', letterSpacing: '0.2em' }}
          >
            SkillNet · New Listing
          </div>
          <h1
            className="font-black text-white"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.04em' }}
          >
            Post a{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Gig
            </span>
          </h1>
        </div>

        {/* Main glass panel */}
        <div
          className="rounded-2xl p-7 md:p-10"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">

            {/* ── IMAGE UPLOAD ──────────────────────────── */}
            <div>
              <FieldLabel>Listing Image</FieldLabel>

              {!previewUrl ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={function () { if (fileInputRef.current) fileInputRef.current.click(); }}
                  className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300"
                  style={{
                    height: '200px',
                    border: isDragging ? '2px dashed rgba(59,130,246,0.7)' : '2px dashed rgba(255,255,255,0.1)',
                    background: isDragging ? 'rgba(59,130,246,0.05)' : 'rgba(0,0,0,0.25)',
                    boxShadow: isDragging ? '0 0 20px rgba(59,130,246,0.1)' : 'none',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    📸
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'rgba(148,163,184,0.6)' }}>
                    Drag & Drop or{' '}
                    <span style={{ color: '#60a5fa' }}>click to upload</span>
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(100,116,139,0.5)' }}>
                    PNG, JPG — auto-encoded and stored
                  </p>
                </div>
              ) : (
                <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: '220px' }}>
                  <img src={previewUrl} alt="Preview" className="w-full h-full" style={{ objectFit: 'cover' }} />
                  <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{
                      background: 'rgba(239,68,68,0.15)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#fca5a5',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    ✕ Remove
                  </button>
                  <div
                    className="absolute bottom-3 left-3 flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{
                      background: 'rgba(0,0,0,0.6)',
                      color: 'rgba(148,163,184,0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <span style={{ color: '#4ade80' }}>✓</span>
                    {imageFileName || 'Image ready'}
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* ── LISTING TYPE ──────────────────────────── */}
            <div>
              <FieldLabel>Type</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'PRODUCT', icon: '📦', label: 'Product' },
                  { val: 'SERVICE', icon: '🛠️', label: 'Service / Gig' },
                ].map(function (opt) {
                  var isActive = listingType === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={function () { setListingType(opt.val); }}
                      className="py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
                      style={{
                        background: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.3)',
                        border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.07)',
                        color: isActive ? '#a5b4fc' : 'rgba(148,163,184,0.5)',
                        boxShadow: isActive ? '0 0 20px rgba(99,102,241,0.12)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── TITLE ─────────────────────────────────── */}
            <div>
              <FieldLabel htmlFor="post-title">Title</FieldLabel>
              <GlassInput
                id="post-title"
                type="text"
                value={title}
                onChange={function (e) { setTitle(e.target.value); }}
                placeholder={listingType === 'PRODUCT' ? 'e.g. Used Gaming Headset, HP Laptop' : 'e.g. Linux Setup, UI Design, Python Tutoring'}
                required={true}
              />
            </div>

            {/* ── PRICING — Only PAID or CHAI (no FREE) ── */}
            <div>
              <FieldLabel>Pricing Model</FieldLabel>
              <div className="grid grid-cols-2 gap-4">

                {/* CHAI option */}
                <button
                  type="button"
                  onClick={function () { setPricingModel('CHAI'); }}
                  className="py-5 rounded-2xl flex flex-col items-center gap-2 transition-all duration-200"
                  style={{
                    background: pricingModel === 'CHAI' ? 'rgba(234,179,8,0.1)' : 'rgba(0,0,0,0.3)',
                    border: pricingModel === 'CHAI' ? '1px solid rgba(234,179,8,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: pricingModel === 'CHAI' ? '0 0 20px rgba(234,179,8,0.1)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>☕</span>
                  <span
                    className="font-bold text-sm"
                    style={{ color: pricingModel === 'CHAI' ? '#fcd34d' : 'rgba(148,163,184,0.5)' }}
                  >
                    Coffee / Chai
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(100,116,139,0.5)' }}>
                    Barter / Trade
                  </span>
                </button>

                {/* PAID option */}
                <button
                  type="button"
                  onClick={function () { setPricingModel('PAID'); }}
                  className="py-5 rounded-2xl flex flex-col items-center gap-2 transition-all duration-200"
                  style={{
                    background: pricingModel === 'PAID' ? 'rgba(59,130,246,0.1)' : 'rgba(0,0,0,0.3)',
                    border: pricingModel === 'PAID' ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: pricingModel === 'PAID' ? '0 0 20px rgba(59,130,246,0.12)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>₹</span>
                  <span
                    className="font-bold text-sm"
                    style={{ color: pricingModel === 'PAID' ? '#93c5fd' : 'rgba(148,163,184,0.5)' }}
                  >
                    Paid
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(100,116,139,0.5)' }}>
                    Set your price
                  </span>
                </button>
              </div>

              {pricingModel === 'PAID' && (
                <div className="mt-4">
                  <FieldLabel htmlFor="post-price">Amount (₹)</FieldLabel>
                  <GlassInput
                    id="post-price"
                    type="number"
                    value={price}
                    onChange={function (e) { setPrice(e.target.value); }}
                    placeholder="e.g. 499"
                    required={true}
                    min="1"
                    step="0.01"
                  />
                </div>
              )}
            </div>

            {/* ── DESCRIPTION ───────────────────────────── */}
            <div>
              <FieldLabel htmlFor="post-description">Description</FieldLabel>
              <textarea
                id="post-description"
                value={description}
                onChange={function (e) { setDescription(e.target.value); }}
                placeholder="Describe your listing — condition, what's included, any terms..."
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none transition-all"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f1f5f9',
                  caretColor: '#60a5fa',
                  lineHeight: '1.65',
                }}
                onFocus={function (e) {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(99,102,241,0.15)';
                }}
                onBlur={function (e) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* ── CONTACT ───────────────────────────────── */}
            <div>
              <FieldLabel htmlFor="post-contact">Contact (Phone / Email)</FieldLabel>
              <GlassInput
                id="post-contact"
                type="text"
                value={contact}
                onChange={function (e) { setContact(e.target.value); }}
                placeholder="e.g. 9876543210 or you@college.ac.in"
              />
            </div>


            {/* Error */}
            {error && (
              <p
                className="text-xs font-semibold px-4 py-3 rounded-xl"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#fca5a5',
                }}
              >
                ⚠ {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl font-black text-base text-white relative overflow-hidden transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                letterSpacing: '-0.01em',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)' }}
              />
              <span className="relative z-10">
                {isLoading ? 'Posting...' : '⚡ Post Listing'}
              </span>
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default PostListing;
