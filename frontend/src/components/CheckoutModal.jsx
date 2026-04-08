import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { gsap } from 'gsap';
import { selectedListingAtom } from '../state/listingAtoms.js';

/**
 * CheckoutModal — mock Razorpay-style campus checkout.
 *
 * Props:
 *   props.listing  — the listing object being claimed
 *   props.onClose  — callback to close this modal
 *
 * Stage flow: 'form' → 'loading' → 'success' → redirect to /receipt
 * RSM JS Style: no arrow functions, no object destructuring.
 */
function CheckoutModal(props) {
    var listing = props.listing;
    var onClose = props.onClose;

    var navigate = useNavigate();
    var setSelectedListing = useSetRecoilState(selectedListingAtom);

    // Stage: 'form' | 'loading' | 'success'
    var [stage, setStage] = useState('form');
    var [payMethod, setPayMethod] = useState('upi');
    var [loadingDots, setLoadingDots] = useState('');

    var overlayRef = useRef(null);
    var cardRef = useRef(null);
    var spinnerRef = useRef(null);
    var progressBarRef = useRef(null);
    var checkCircleRef = useRef(null);
    var checkRef = useRef(null);
    var burstRef = useRef(null);

    // ── MOUNT: slide card in ──────────────────────────────────────────────────
    useEffect(function () {
        gsap.fromTo(
            overlayRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        gsap.fromTo(
            cardRef.current,
            { y: 70, opacity: 0, scale: 0.94 },
            { y: 0, opacity: 1, scale: 1, duration: 0.48, ease: 'back.out(1.5)', delay: 0.05 }
        );
    }, []);

    // ── LOADING STAGE animations ──────────────────────────────────────────────
    useEffect(function () {
        if (stage !== 'loading') return;

        // GSAP spinner rotation
        var spinTl = gsap.timeline({ repeat: -1 });
        spinTl.to(spinnerRef.current, { rotation: 360, duration: 0.85, ease: 'none' });

        // GSAP progress bar fill
        gsap.fromTo(
            progressBarRef.current,
            { width: '0%' },
            { width: '90%', duration: 1.5, ease: 'power1.inOut' }
        );

        // Animated ellipsis
        var dotInterval = setInterval(function () {
            setLoadingDots(function (prev) {
                if (prev === '...') return '';
                return prev + '.';
            });
        }, 400);

        return function () {
            spinTl.kill();
            clearInterval(dotInterval);
        };
    }, [stage]);

    // ── SUCCESS STAGE animations ──────────────────────────────────────────────
    useEffect(function () {
        if (stage !== 'success') return;

        // Progress bar completes
        gsap.to(progressBarRef.current, { width: '100%', duration: 0.3, ease: 'power2.out' });

        // Circle pops in
        gsap.fromTo(
            checkCircleRef.current,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.8)', delay: 0.15 }
        );

        // Checkmark draws in
        gsap.fromTo(
            checkRef.current,
            { opacity: 0, scale: 0.4 },
            { opacity: 1, scale: 1, duration: 0.38, ease: 'back.out(2.2)', delay: 0.45 }
        );

        // Burst ring expand
        gsap.fromTo(
            burstRef.current,
            { scale: 0.6, opacity: 0.8 },
            { scale: 2.2, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.5 }
        );

        // Navigate to receipt after a moment
        var timer = setTimeout(function () {
            var fakeTransaction = {
                txnId: 'SHK' + Math.floor(Math.random() * 9000000 + 1000000),
                date: new Date().toLocaleString('en-IN'),
                listing: listing,
            };
            setSelectedListing(listing);
            sessionStorage.setItem('lastTxn', JSON.stringify(fakeTransaction));
            navigate('/receipt');
        }, 1900);

        return function () {
            clearTimeout(timer);
        };
    }, [stage]);

    // ── HANDLERS ─────────────────────────────────────────────────────────────
    function handlePayNow() {
        setStage('loading');
        setTimeout(function () {
            setStage('success');
        }, 1700);
    }

    function handleOverlayClick(event) {
        if (event.target === overlayRef.current && stage === 'form') {
            onClose();
        }
    }

    function getPriceDisplay() {
        var model = listing.pricing_model;
        if (model === 'FREE') return 'Free';
        if (model === 'CHAI') return 'Chai ☕ (Barter)';
        return '₹' + parseFloat(listing.price).toFixed(2);
    }

    function getPriceColor() {
        var model = listing.pricing_model;
        if (model === 'FREE') return '#34d399';
        if (model === 'CHAI') return '#fbbf24';
        return '#818cf8';
    }

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}
        >
            <div
                ref={cardRef}
                className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
                style={{
                    background: 'linear-gradient(160deg, #0d1117 0%, #161b22 100%)',
                    border: '1px solid rgba(99,102,241,0.32)',
                    boxShadow: '0 -8px 60px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.1)',
                }}
            >

                {/* ── Modal Header ──────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-5 py-4 relative"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                    {/* Top shimmer line */}
                    <div
                        className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent)' }}
                    />

                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                                boxShadow: '0 4px 16px rgba(99,102,241,0.45)',
                            }}
                        >
                            S
                        </div>
                        <div>
                            <div className="text-white text-sm font-extrabold leading-tight">SkillNet</div>
                            <div className="text-xs" style={{ color: '#475569' }}>Secure Campus Checkout</div>
                        </div>
                    </div>

                    {stage === 'form' && (
                        <button
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-300 transition-colors text-lg leading-none"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* ── STAGE: FORM ───────────────────────────────────────── */}
                {stage === 'form' && (
                    <div className="p-5 flex flex-col gap-4">

                        {/* Order summary card */}
                        <div
                            className="rounded-2xl p-4 relative overflow-hidden"
                            style={{
                                background: 'rgba(99,102,241,0.07)',
                                border: '1px solid rgba(99,102,241,0.22)',
                            }}
                        >
                            <div
                                className="absolute top-0 right-0 rounded-full pointer-events-none"
                                style={{
                                    width: '100px', height: '100px',
                                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                                    transform: 'translate(30%, -30%)',
                                }}
                            />
                            <div
                                className="text-xs font-bold mb-2 uppercase tracking-widest"
                                style={{ color: '#818cf8' }}
                            >
                                Order Summary
                            </div>
                            <div className="text-white font-semibold text-sm leading-snug mb-2 pr-4">
                                {listing.title}
                            </div>
                            <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(99,102,241,0.15)' }}>
                                <span className="text-xs" style={{ color: '#64748b' }}>Total</span>
                                <span
                                    className="font-extrabold text-lg"
                                    style={{ color: getPriceColor(), textShadow: '0 0 12px ' + getPriceColor() + '55' }}
                                >
                                    {getPriceDisplay()}
                                </span>
                            </div>
                        </div>

                        {/* Payment method (only for PAID) */}
                        {listing.pricing_model === 'PAID' && (
                            <div>
                                <div
                                    className="text-xs font-bold mb-2.5 uppercase tracking-widest"
                                    style={{ color: '#475569' }}
                                >
                                    Pay via
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={function () { setPayMethod('upi'); }}
                                        className="py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
                                        style={{
                                            background: payMethod === 'upi' ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.03)',
                                            border: payMethod === 'upi' ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.07)',
                                            color: payMethod === 'upi' ? '#818cf8' : '#64748b',
                                            boxShadow: payMethod === 'upi' ? '0 0 16px rgba(99,102,241,0.2)' : 'none',
                                        }}
                                    >
                                        📲 UPI
                                    </button>
                                    <button
                                        onClick={function () { setPayMethod('card'); }}
                                        className="py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
                                        style={{
                                            background: payMethod === 'card' ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.03)',
                                            border: payMethod === 'card' ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.07)',
                                            color: payMethod === 'card' ? '#818cf8' : '#64748b',
                                            boxShadow: payMethod === 'card' ? '0 0 16px rgba(99,102,241,0.2)' : 'none',
                                        }}
                                    >
                                        💳 Card
                                    </button>
                                </div>

                                {/* UPI input */}
                                {payMethod === 'upi' && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            placeholder="yourname@okaxis"
                                            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                                            style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.09)',
                                                color: '#e2e8f0',
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Card inputs */}
                                {payMethod === 'card' && (
                                    <div className="mt-3 flex flex-col gap-2">
                                        <input
                                            type="text"
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                                            style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.09)',
                                                color: '#e2e8f0',
                                            }}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="MM / YY"
                                                maxLength={7}
                                                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                                                style={{
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.09)',
                                                    color: '#e2e8f0',
                                                }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="CVV"
                                                maxLength={3}
                                                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                                                style={{
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.09)',
                                                    color: '#e2e8f0',
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pay / Claim button */}
                        <button
                            onClick={handlePayNow}
                            className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white transition-all duration-200 hover:opacity-92 active:scale-95 relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                                boxShadow: '0 6px 28px rgba(99,102,241,0.45)',
                            }}
                        >
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                                }}
                            />
                            <span className="relative z-10">
                                {listing.pricing_model === 'PAID' ? ('Pay ' + getPriceDisplay() + ' →') : '🦈 Claim Deal →'}
                            </span>
                        </button>

                        <p className="text-center text-xs" style={{ color: '#334155' }}>
                            🔒 End-to-end secured · Campus verified
                        </p>
                    </div>
                )}

                {/* ── STAGE: LOADING ────────────────────────────────────── */}
                {stage === 'loading' && (
                    <div className="px-5 pt-8 pb-6 flex flex-col items-center gap-5">
                        {/* Spinner */}
                        <div className="relative">
                            <div
                                ref={spinnerRef}
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    border: '3px solid rgba(99,102,241,0.12)',
                                    borderTopColor: '#6366f1',
                                }}
                            />
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)',
                                }}
                            />
                        </div>

                        <div className="text-center">
                            <div className="text-white font-bold text-base">
                                Securing Deal{loadingDots}
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#475569' }}>
                                Verifying with campus network
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div
                            className="w-full rounded-full overflow-hidden"
                            style={{ height: '3px', background: 'rgba(99,102,241,0.12)' }}
                        >
                            <div
                                ref={progressBarRef}
                                className="h-full rounded-full"
                                style={{
                                    width: '0%',
                                    background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                                    boxShadow: '0 0 8px rgba(99,102,241,0.8)',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* ── STAGE: SUCCESS ────────────────────────────────────── */}
                {stage === 'success' && (
                    <div className="px-5 pt-8 pb-6 flex flex-col items-center gap-4">

                        {/* Checkmark with burst ring */}
                        <div className="relative flex items-center justify-center" style={{ width: '80px', height: '80px' }}>
                            {/* Burst ring */}
                            <div
                                ref={burstRef}
                                className="absolute inset-0 rounded-full border-2"
                                style={{ borderColor: 'rgba(52,211,153,0.5)' }}
                            />
                            {/* Main circle */}
                            <div
                                ref={checkCircleRef}
                                className="flex items-center justify-center rounded-full"
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    background: 'rgba(52,211,153,0.12)',
                                    border: '2px solid rgba(52,211,153,0.45)',
                                    boxShadow: '0 0 30px rgba(52,211,153,0.25)',
                                }}
                            >
                                <svg
                                    ref={checkRef}
                                    width="34"
                                    height="34"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#34d399"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-white font-extrabold text-lg">Deal Secured! 🦈</div>
                            <div className="text-xs mt-1.5" style={{ color: '#475569' }}>
                                Redirecting to your receipt...
                            </div>
                        </div>

                        {/* Progress bar — fills to 100% */}
                        <div
                            className="w-full rounded-full overflow-hidden"
                            style={{ height: '3px', background: 'rgba(52,211,153,0.12)' }}
                        >
                            <div
                                ref={progressBarRef}
                                className="h-full rounded-full"
                                style={{
                                    width: '0%',
                                    background: 'linear-gradient(90deg, #34d399, #10b981)',
                                    boxShadow: '0 0 8px rgba(52,211,153,0.8)',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Footer ────────────────────────────────────────────── */}
                <div className="px-5 pb-4 text-center">
                    <span className="text-xs" style={{ color: '#1e293b' }}>
                        Powered by SkillNet · MITS Campus
                    </span>
                </div>
            </div>
        </div>
    );
}

export default CheckoutModal;
