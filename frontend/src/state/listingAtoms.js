import { atom, selector } from 'recoil';

/**
 * Recoil atom — holds the currently-selected listing object.
 * Set this when a user clicks a listing card in the feed.
 *
 * Shape: { id, type, title, pricing_model, price, contact } | null
 */
export var selectedListingAtom = atom({
    key: 'selectedListingAtom',
    default: null,
});

/**
 * Recoil selector — derives the human-readable price label
 * from the currently selected listing atom.
 *
 * Returns a string like "Free", "Chai ☕", or "₹499.00".
 */
export var listingPriceLabelSelector = selector({
    key: 'listingPriceLabelSelector',
    get: function (args) {
        var get = args.get;
        var listing = get(selectedListingAtom);
        if (!listing) return '';
        var model = listing.pricing_model;
        if (model === 'FREE') return 'Free';
        if (model === 'CHAI') return 'Chai ☕';
        var price = parseFloat(listing.price);
        return '₹' + price.toFixed(2);
    },
});
