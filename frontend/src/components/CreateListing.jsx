import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

var API_BASE = '';

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

function CreateListing() {
  var navigate = useNavigate();

  var listingTypeState = useState('PRODUCT');
  var listingType = listingTypeState[0];
  var setListingType = listingTypeState[1];

  var titleState = useState('');
  var title = titleState[0];
  var setTitle = titleState[1];

  var pricingModelState = useState('FREE');
  var pricingModel = pricingModelState[0];
  var setPricingModel = pricingModelState[1];

  var priceState = useState('');
  var price = priceState[0];
  var setPrice = priceState[1];

  var contactState = useState('');
  var contact = contactState[0];
  var setContact = contactState[1];

  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var errorState = useState('');
  var error = errorState[0];
  var setError = errorState[1];

  var imageFileState = useState(null);
  var imageFile = imageFileState[0];
  var setImageFile = imageFileState[1];

  var imagePreviewState = useState(null);
  var imagePreview = imagePreviewState[0];
  var setImagePreview = imagePreviewState[1];

  var isDraggingState = useState(false);
  var isDragging = isDraggingState[0];
  var setIsDragging = isDraggingState[1];

  var dropZoneRef = useRef(null);
  var formRef = useRef(null);

  useEffect(function () {
    if (!getToken()) {
      navigate('/login');
    }
    gsap.fromTo(
      formRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  function handleImageSelect(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    var reader = new FileReader();
    reader.onload = function (e) {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleFileInputChange(e) {
    var file = e.target.files[0];
    handleImageSelect(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    var file = e.dataTransfer.files[0];
    handleImageSelect(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    var endpoint = listingType === 'PRODUCT' ? '/api/products' : '/api/services';
    var body = {
      title: title,
      pricing_model: pricingModel,
      price: pricingModel === 'PAID' ? price : 0,
      contact: contact,
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

    setLoading(false);
  }

  var dropZoneStyle = {
    border: '2px dashed ' + (isDragging ? '#dfff00' : 'rgba(223,255,0,0.2)'),
    background: isDragging ? 'rgba(223,255,0,0.05)' : 'rgba(255,255,255,0.02)',
    borderRadius: '16px',
    transition: 'all 0.2s ease',
    boxShadow: isDragging ? '0 0 20px rgba(223,255,0,0.1)' : 'none',
  };

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(223,255,0,0.03) 0%, transparent 60%)' }}>
      <div className="max-w-lg mx-auto">

        {/* Page title */}
        <div className="mb-8">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: '#dfff00', letterSpacing: '0.18em' }}
          >
            SkillNet · Post
          </div>
          <h1
            className="font-black text-white leading-none"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.03em' }}
          >
            List Your Gig
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Reach hundreds of students on campus instantly.
          </p>
        </div>

        <div
          ref={formRef}
          className="rounded-2xl p-7"
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Listing Type */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}
              >
                Listing Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={function () { setListingType('PRODUCT'); }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                  style={listingType === 'PRODUCT' ? {
                    background: 'rgba(223,255,0,0.12)',
                    border: '1.5px solid rgba(223,255,0,0.5)',
                    color: '#dfff00',
                    boxShadow: '0 0 16px rgba(223,255,0,0.12)',
                  } : {
                    background: 'rgba(255,255,255,0.03)',
                    border: '1.5px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  📦 Product
                </button>
                <button
                  type="button"
                  onClick={function () { setListingType('SERVICE'); }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                  style={listingType === 'SERVICE' ? {
                    background: 'rgba(168,85,247,0.12)',
                    border: '1.5px solid rgba(168,85,247,0.5)',
                    color: '#c084fc',
                    boxShadow: '0 0 16px rgba(168,85,247,0.12)',
                  } : {
                    background: 'rgba(255,255,255,0.03)',
                    border: '1.5px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  🛠️ Service
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}
              >
                Listing Image
              </label>

              {!imagePreview && (
                <div
                  ref={dropZoneRef}
                  style={dropZoneStyle}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className="flex flex-col items-center justify-center py-10 px-6 cursor-pointer text-center"
                  onClick={function () { document.getElementById('image-upload-input').click(); }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-2xl"
                    style={{ background: 'rgba(223,255,0,0.07)', border: '1px solid rgba(223,255,0,0.15)' }}
                  >
                    📷
                  </div>
                  <p className="font-semibold text-sm mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Drag &amp; Drop or{' '}
                    <span style={{ color: '#dfff00' }}>Click to Upload</span>
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    PNG, JPG, WEBP — max 8MB
                  </p>
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>
              )}

              {imagePreview && (
                <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full"
                    style={{ objectFit: 'cover' }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                    style={{
                      background: 'rgba(0,0,0,0.75)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#f87171',
                      backdropFilter: 'blur(8px)',
                    }}
                    onMouseEnter={function (e) {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                    }}
                    onMouseLeave={function (e) {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.75)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    }}
                  >
                    ✕ Remove
                  </button>
                  <div
                    className="absolute bottom-3 left-3 text-xs font-medium px-2 py-1 rounded"
                    style={{
                      background: 'rgba(223,255,0,0.15)',
                      border: '1px solid rgba(223,255,0,0.3)',
                      color: '#dfff00',
                    }}
                  >
                    ✓ Image Ready
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="post-title"
                className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}
              >
                Title
              </label>
              <input
                id="post-title"
                type="text"
                placeholder={listingType === 'PRODUCT' ? 'e.g. Used Headset (barely used)' : 'e.g. Linux Installation & Setup'}
                value={title}
                onChange={function (e) { setTitle(e.target.value); }}
                className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f0f0f0',
                }}
                onFocus={function (e) {
                  e.currentTarget.style.borderColor = 'rgba(223,255,0,0.4)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(223,255,0,0.07)';
                }}
                onBlur={function (e) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            {/* Pricing */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}
              >
                Pricing
              </label>
              <div className="flex gap-2">
                {['FREE', 'CHAI', 'PAID'].map(function (model) {
                  var isActive = pricingModel === model;
                  return (
                    <button
                      key={model}
                      type="button"
                      onClick={function () { setPricingModel(model); }}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                      style={isActive ? {
                        background: 'rgba(223,255,0,0.1)',
                        border: '1.5px solid rgba(223,255,0,0.45)',
                        color: '#dfff00',
                      } : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1.5px solid rgba(255,255,255,0.07)',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {model === 'FREE' ? 'Free' : model === 'CHAI' ? 'Chai ☕' : 'Paid ₹'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price amount */}
            {pricingModel === 'PAID' && (
              <div>
                <label
                  htmlFor="post-price"
                  className="block text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}
                >
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
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#f0f0f0',
                  }}
                  onFocus={function (e) {
                    e.currentTarget.style.borderColor = 'rgba(223,255,0,0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(223,255,0,0.07)';
                  }}
                  onBlur={function (e) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
            )}

            {/* Contact */}
            <div>
              <label
                htmlFor="post-contact"
                className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}
              >
                Contact
              </label>
              <input
                id="post-contact"
                type="text"
                placeholder="Phone number or email"
                value={contact}
                onChange={function (e) { setContact(e.target.value); }}
                className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f0f0f0',
                }}
                onFocus={function (e) {
                  e.currentTarget.style.borderColor = 'rgba(223,255,0,0.4)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(223,255,0,0.07)';
                }}
                onBlur={function (e) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {error && (
              <p
                className="text-xs font-semibold px-4 py-3 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              >
                ⚠ {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all duration-200 disabled:opacity-50"
              style={{
                background: loading ? 'rgba(223,255,0,0.5)' : '#dfff00',
                color: '#0a0a0a',
                letterSpacing: '0.04em',
                boxShadow: loading ? 'none' : '0 0 24px rgba(223,255,0,0.3)',
              }}
              onMouseEnter={function (e) {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 0 36px rgba(223,255,0,0.5)';
                  e.currentTarget.style.background = '#eeff33';
                }
              }}
              onMouseLeave={function (e) {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(223,255,0,0.3)';
                  e.currentTarget.style.background = '#dfff00';
                }
              }}
            >
              {loading ? 'Posting...' : '⚡ Post Listing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateListing;
