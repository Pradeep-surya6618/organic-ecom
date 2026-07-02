const StoreSetting = require('../models/StoreSetting');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// Single StoreSetting document holds the storefront contact details + socials,
// shared by the Contact page and the Footer.
const KEY = 'contact_info';

const DEFAULTS = {
    phone: '9942585985',
    email: 'organicstore@gmail.com',
    address: '123 Organic Street, Tech City, Hyderabad',
    social: { facebook: '', twitter: '', instagram: '', pinterest: '' }
};

const merge = (value = {}) => ({
    phone: value.phone != null ? value.phone : DEFAULTS.phone,
    email: value.email != null ? value.email : DEFAULTS.email,
    address: value.address != null ? value.address : DEFAULTS.address,
    social: { ...DEFAULTS.social, ...(value.social || {}) }
});

// Public — read contact info + social links
exports.getContactInfo = asyncHandler(async (req, res) => {
    const doc = await StoreSetting.findOne({ key: KEY });
    res.json(new ApiResponse(200, merge(doc?.value), 'Contact info fetched'));
});

// Admin — update contact info + social links
exports.updateContactInfo = asyncHandler(async (req, res) => {
    const { phone, email, address, social } = req.body;
    const value = merge({ phone, email, address, social });
    const doc = await StoreSetting.findOneAndUpdate(
        { key: KEY },
        { key: KEY, value, group: 'contact', description: 'Storefront contact details & social links' },
        { new: true, upsert: true }
    );
    res.json(new ApiResponse(200, doc.value, 'Contact info updated'));
});

// ── Top announcement / ad bar (green strip above the navbar) ──
const AD_BAR_KEY = 'ad_bar';
const AD_BAR_DEFAULTS = {
    enabled: true,
    text: 'Fresh groceries delivered in 10 minutes',
    subtext: 'Delivering near you · 7am–11pm'
};
const mergeAdBar = (v = {}) => ({
    enabled: v.enabled != null ? !!v.enabled : AD_BAR_DEFAULTS.enabled,
    text: v.text != null ? v.text : AD_BAR_DEFAULTS.text,
    subtext: v.subtext != null ? v.subtext : AD_BAR_DEFAULTS.subtext
});

// Public — read the ad bar
exports.getAdBar = asyncHandler(async (req, res) => {
    const doc = await StoreSetting.findOne({ key: AD_BAR_KEY });
    res.json(new ApiResponse(200, mergeAdBar(doc?.value), 'Ad bar fetched'));
});

// Admin — update the ad bar
exports.updateAdBar = asyncHandler(async (req, res) => {
    const { enabled, text, subtext } = req.body;
    const value = mergeAdBar({ enabled, text, subtext });
    const doc = await StoreSetting.findOneAndUpdate(
        { key: AD_BAR_KEY },
        { key: AD_BAR_KEY, value, group: 'ad_bar', description: 'Top storefront announcement bar' },
        { new: true, upsert: true }
    );
    res.json(new ApiResponse(200, doc.value, 'Ad bar updated'));
});
