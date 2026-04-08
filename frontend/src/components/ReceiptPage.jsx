import { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { gsap } from 'gsap';
import { selectedListingAtom, listingPriceLabelSelector } from '../state/listingAtoms.js';

/**
 * ReceiptPage — displayed after a successful deal claim.
 * Reads the transaction from sessionStorage, listing from Recoil atom.
 * RSM JS Style: no arrow functions, no object destructuring.
 */
function ReceiptPage() {
    var navigate = useNavigate();
    var listing = useRecoilValue(selectedListingAtom);
    var priceLabel = useRecoilValue(listingPriceLabelSelector);

    var cardRef = useRef(null);
    var rowsRef = useRef(null);

    var txnRaw = sessionStorage.getItem('lastTxn');
    var txn = txnRaw ? JSON.parse(txnRaw) : null;

    // Redirect guard — if no txn data, go back to feed
    useEffect(function () {
        if (!txn) {
            navigate('/feed');
        }
    }, []);

    // GSAP entrance animations
    useEffect(function () {
        if (!txn) return;

        gsap.fromTo(
            cardRef.current,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay: 0.1 }
        );

        var rows = rowsRef.current ? rowsRef.current.children : [];
        gsap.fromTo(
            rows,
            { x: -20, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.07, delay: 0.35 }
        );
    }, []);

    if (!txn) return null;

    var txnListing = txn.listing || listing;
    var txnTitle = txnListing ? txnListing.title : 'Unknown Item';
    var txnContact = txnListing ? (txnListing.contact || 'N/A') : 'N/A';
    var txnType = txnListing ? txnListing.type : '';

    function getStatusColor() {
        if (!txnListing) return '#34d399';
        var model = txnListing.pricing_model;
        if (model === 'FREE') return '#34d399';
        if (model === 'CHAI') return '#fbbf24';
        return '#818cf8';
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{ background: 'radial-gradient(ellipse at 60% 20%, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
        >
            <div
                ref={cardRef}
                className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                style={{
                    background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
                    border: '1px solid rgba(99,102,241,0.2)',
                }}
            >

                {/* ── Header ───────────────────────────────────────── */}
                <div
                    className="flex flex-col items-center py-8 px-6"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div
                        className="flex items-center justify-center rounded-full mb-4"
                        style={{
                            width: '72px', height: '72px',
                            background: 'rgba(52,211,153,0.12)',
                            border: '2px solid rgba(52,211,153,0.4)',
                            boxShadow: '0 0 28px rgba(52,211,153,0.2)',
                        }}
                    >
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div className="text-white font-extrabold text-xl tracking-tight">Deal Confirmed!</div>
                    <div className="text-xs mt-1" style={{ color: '#475569' }}>Your campus deal is live 🦈</div>
                    <div
                        className="mt-4 px-4 py-1.5 rounded-full text-xs font-bold"
                        style={{
                            background: 'rgba(52,211,153,0.08)',
                            border: '1px solid rgba(52,211,153,0.3)',
                            color: '#34d399',
                        }}
                    >
                        ✓ Verified Campus Transaction
                    </div>
                </div>

                {/* ── Transaction Details ───────────────────────────── */}
                <div ref={rowsRef} className="px-6 py-5 flex flex-col gap-3">
                    {renderRow('Transaction ID', txn.txnId, '#818cf8')}
                    {renderRow('Date & Time', txn.date, null)}
                    {renderRow('Item', txnTitle, null)}
                    {renderRow('Type', txnType, txnType === 'PRODUCT' ? '#86efac' : '#c4b5fd')}
                    {renderRow('Amount', priceLabel || '—', getStatusColor())}
                    {renderRow('Seller Contact', txnContact, null)}
                </div>

                {/* ── Actions ──────────────────────────────────────── */}
                <div className="px-6 pb-7 flex flex-col gap-3">
                    <Link
                        to="/feed"
                        className="block w-full py-3 text-center rounded-xl font-bold text-sm text-white transition-all duration-200 hover:opacity-90"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                        }}
                    >
                        ← Back to Feed
                    </Link>
                    <button
                        onClick={function () { window.print(); }}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-80"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#64748b',
                        }}
                    >
                        🖨️ Save Receipt
                    </button>
                </div>

                {/* ── Footer ───────────────────────────────────────── */}
                <div className="px-6 pb-5 text-center">
                    <div className="text-xs" style={{ color: '#1e293b' }}>
                        SkillNet · Muthoot Institute of Technology and Science
                    </div>
                </div>
            </div>
        </div>
    );
}

function renderRow(label, value, valueColor) {
    return (
        <div
            key={label}
            className="flex items-start justify-between gap-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
            <span className="text-xs font-medium flex-shrink-0" style={{ color: '#475569', minWidth: '120px' }}>
                {label}
            </span>
            <span
                className="text-xs font-semibold text-right break-all"
                style={{ color: valueColor || '#cbd5e1' }}
            >
                {value}
            </span>
        </div>
    );
}

export default ReceiptPage;
