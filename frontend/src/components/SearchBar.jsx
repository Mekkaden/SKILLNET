import { useState, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * SearchBar — glassmorphism search bar with Electric Blue icon glow.
 *
 * Props:
 *   props.value     — controlled input value (string)
 *   props.onChange  — change handler function(value)
 *   props.placeholder — optional placeholder override
 *
 * RSM JS Style: no arrow functions, no destructuring.
 */
function SearchBar(props) {
  var value = props.value;
  var onChange = props.onChange;
  var placeholder = props.placeholder || 'Search listings, skills, products...';

  var focusedState = useState(false);
  var isFocused = focusedState[0];
  var setIsFocused = focusedState[1];

  var iconRef = useRef(null);
  var barRef = useRef(null);

  function handleFocus() {
    setIsFocused(true);
    gsap.to(barRef.current, {
      boxShadow: '0 0 0 1px rgba(59,130,246,0.4), 0 0 24px rgba(59,130,246,0.12)',
      duration: 0.25,
      ease: 'power2.out',
    });
    gsap.to(iconRef.current, {
      color: '#60a5fa',
      filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.7))',
      duration: 0.25,
    });
  }

  function handleBlur() {
    setIsFocused(false);
    gsap.to(barRef.current, {
      boxShadow: '0 0 0 1px rgba(255,255,255,0.07)',
      duration: 0.3,
      ease: 'power2.out',
    });
    gsap.to(iconRef.current, {
      color: 'rgba(100,116,139,0.7)',
      filter: 'drop-shadow(0 0 0px transparent)',
      duration: 0.3,
    });
  }

  function handleChange(e) {
    onChange(e.target.value);
  }

  function handleClear() {
    onChange('');
  }

  return (
    <div
      ref={barRef}
      className="flex items-center gap-3 w-full rounded-xl px-4 py-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.07)',
      }}
    >
      {/* Search icon */}
      <span
        ref={iconRef}
        style={{
          color: 'rgba(100,116,139,0.7)',
          flexShrink: 0,
          fontSize: '16px',
          lineHeight: 1,
          transition: 'color 0.25s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </span>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm font-medium"
        style={{
          color: '#f1f5f9',
          caretColor: '#60a5fa',
        }}
      />

      {/* Clear button */}
      {value && value.length > 0 && (
        <button
          onClick={handleClear}
          className="flex-shrink-0 text-xs rounded-full w-5 h-5 flex items-center justify-center transition-all"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(148,163,184,0.7)',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SearchBar;
