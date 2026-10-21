/**
 * Demo-data adapter — lets the whole UI run with NO backend.
 *
 * Enabled only when VITE_MOCK_API=true (see .env.local). In production builds the flag is
 * off, so this file is never loaded. All data lives in memory and resets on a full reload.
 *
 * Demo logins (any password works):
 *   admin@argon.dev   → Admin console
 *   seller@argon.dev  → Seller console
 *   anything else     → Customer
 */
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Role = 'ADMIN' | 'SELLER' | 'CUSTOMER';
type Ctx = { m: RegExpMatchArray; q: Record<string, any>; body: any; role: Role | null };

const DAY = 86_400_000;
const now = Date.now();
const iso = (daysAgo: number, hour = 11) => new Date(now - daysAgo * DAY + hour * 3_600_000 - 12 * 3_600_000).toISOString();

/* ───────── images (inline SVG — no network) ───────── */
const palettes = [['#d9cbb6', '#b69f82'], ['#c5ced3', '#8fa1ac'], ['#d8c3c3', '#b08d8d'], ['#c6d2bf', '#8fa686'], ['#d9d3c4', '#b3a98f'], ['#cdc4d9', '#9d90b5']];
const art = (seed: number, kind = 0) => {
  const [a, b] = palettes[seed % palettes.length];
  const shapes = [
    `<rect x='250' y='330' width='300' height='260' rx='36' fill='${b}'/><rect x='290' y='250' width='220' height='120' rx='40' fill='${b}' opacity='.8'/><rect x='270' y='590' width='24' height='70' rx='8' fill='${b}'/><rect x='506' y='590' width='24' height='70' rx='8' fill='${b}'/>`,
    `<circle cx='400' cy='420' r='190' fill='${b}'/><circle cx='400' cy='420' r='120' fill='${a}' opacity='.7'/>`,
    `<path d='M250 640 L330 250 H470 L550 640 Z' fill='${b}'/><rect x='360' y='190' width='80' height='70' rx='20' fill='${b}' opacity='.8'/>`,
  ];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='900' viewBox='0 0 800 900'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${a}' stop-opacity='.75'/></linearGradient></defs><rect width='800' height='900' fill='url(#g)'/>${shapes[(seed + kind) % 3]}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/* ───────── seed data ───────── */
const categories = [
  { id: 1, name: 'Living Room', slug: 'living-room', parentId: null },
  { id: 2, name: 'Accent Chairs', slug: 'accent-chairs', parentId: 1 },
  { id: 3, name: 'Tables', slug: 'tables', parentId: null },
  { id: 4, name: 'Lighting', slug: 'lighting', parentId: null },
  { id: 5, name: 'Textiles', slug: 'textiles', parentId: null },
  { id: 6, name: 'Decor', slug: 'decor', parentId: null },
  { id: 7, name: 'Storage', slug: 'storage', parentId: null },
].map((c, i) => ({ ...c, description: '', imageUrl: art(i + 1, 1), active: true, displayOrder: i }));

const sellers = [
  { id: 2, name: 'Demo Seller', email: 'seller@argon.dev', role: 'SELLER', shopName: 'Maker & Co', shopDescription: 'Small-batch furniture and homeware, finished by hand in Karachi.', sellerStatus: 'APPROVED' },
  { id: 7, name: 'Hira Malik', email: 'hira@nord.pk', role: 'SELLER', shopName: 'Nord Living', shopDescription: 'Scandinavian-inspired essentials.', sellerStatus: 'APPROVED' },
  { id: 8, name: 'Bilal Ahmed', email: 'bilal@loom.pk', role: 'SELLER', shopName: 'Loom & Thread', shopDescription: 'Handwoven textiles from Multan.', sellerStatus: 'APPROVED' },
  { id: 9, name: 'Ayesha Noor', email: 'ayesha@lumen.pk', role: 'SELLER', shopName: 'Lumen Studio', shopDescription: 'Lighting with character.', sellerStatus: 'PENDING' },
  { id: 10, name: 'Farhan Ali', email: 'farhan@oak.pk', role: 'SELLER', shopName: 'Oak & Ember', shopDescription: 'Solid-wood tables.', sellerStatus: 'SUSPENDED' },
].map((s) => ({ ...s, active: s.sellerStatus === 'APPROVED', verified: true, contactNumber: '0300-1234567', createdAt: iso(120), profileImage: '', shopLogo: '', shopBanner: '' }));

const names: Array<[string, string, number, number, number]> = [
  // name, brand, categoryId, price, sellerId
  ['Linen Lounge Chair', 'Nord', 2, 24500, 2], ['Boucle Accent Chair', 'Nord', 2, 31900, 7], ['Walnut Side Table', 'Oak & Ember', 3, 14800, 2], ['Oak Dining Table', 'Oak & Ember', 3, 68000, 7],
  ['Arc Floor Lamp', 'Lumen', 4, 12900, 2], ['Ribbed Table Lamp', 'Lumen', 4, 7400, 9], ['Pleated Pendant', 'Lumen', 4, 9800, 7], ['Wool Throw', 'Loom', 5, 5900, 8],
  ['Handwoven Rug', 'Loom', 5, 38000, 8], ['Cotton Cushion Set', 'Loom', 5, 3600, 8], ['Ceramic Vase', 'Studio K', 6, 3200, 2], ['Brass Candle Holder', 'Studio K', 6, 2400, 2],
  ['Arched Mirror', 'Nord', 6, 16500, 7], ['Rattan Sideboard', 'Atlas', 7, 52000, 7], ['Walnut Bookshelf', 'Atlas', 7, 29500, 2], ['Storage Ottoman', 'Nord', 7, 11200, 2],
  ['Curved Sofa', 'Nord', 1, 118000, 7], ['Travertine Coffee Table', 'Atlas', 3, 44500, 2], ['Glass Chandelier', 'Lumen', 4, 36000, 9], ['Jute Basket Trio', 'Loom', 6, 4200, 8],
  ['Teak Bar Stool', 'Oak & Ember', 1, 13800, 10], ['Linen Duvet Cover', 'Loom', 5, 8900, 8], ['Stoneware Bowl Set', 'Studio K', 6, 3900, 2], ['Wall Sconce Pair', 'Lumen', 4, 8800, 9],
];
const products: any[] = names.map(([name, brand, categoryId, price, sellerId], i) => {
  const id = i + 1; const seller = sellers.find((s) => s.id === sellerId)!;
  const disc = id % 3 === 0 ? Math.round(price * 0.85 / 100) * 100 : undefined;
  return {
    id, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${id}`, brand, categoryId,
    categoryName: categories.find((c) => c.id === categoryId)!.name,
    price, discountedPrice: disc, effectivePrice: disc ?? price,
    stockQuantity: id === 6 ? 0 : id === 9 ? 3 : 8 + (id * 7) % 30, inStock: id !== 6, sku: `ARG-${1000 + id}`,
    shortDescription: 'Hand-finished in small batches with responsibly sourced materials.',
    description: `${name} — designed to be lived with. Thoughtfully proportioned, carefully finished and built to last for years.\n\nMade to order in small batches. Arrives fully assembled and carefully packed.`,
    primaryImageUrl: art(id, 0),
    images: [0, 1, 2].map((k) => ({ id: id * 10 + k, imageUrl: art(id, k), primary: k === 0, displayOrder: k })),
    sellerId, sellerName: seller.name, shopName: seller.shopName, sellerProfileImage: '',
    averageRating: 3.8 + ((id * 3) % 12) / 10, totalReviews: 2 + (id % 5), totalSold: 10 + id * 3,
    active: true, adminLocked: false, featured: id % 4 === 1, createdAt: iso(60 - id * 2),
    specifications: JSON.stringify({ Material: ['Solid oak', 'Linen', 'Brass', 'Wool'][id % 4], Dimensions: `${60 + id}cm × ${40 + id}cm`, Origin: 'Pakistan', Warranty: '1 Year' }),
  };
});

const users: any = {
  CUSTOMER: { id: 1, name: 'Demo Customer', email: 'customer@argon.dev', role: 'CUSTOMER', active: true, verified: true, contactNumber: '0321-5550101', profileImage: '', createdAt: iso(90) },
  SELLER: { ...sellers[0] }, ADMIN: { id: 3, name: 'Demo Admin', email: 'admin@argon.dev', role: 'ADMIN', active: true, verified: true, contactNumber: '', profileImage: '', createdAt: iso(200) },
};
const customers: any[] = ['Sara Khan', 'Omar Siddiqui', 'Mehwish Raza', 'Ali Hassan', 'Zainab Tariq', 'Hamza Qureshi', 'Noor Fatima', 'Usman Hussain', 'Iqra Javed', 'Danish Rao', 'Maryam Iqbal', 'Talha Mirza']
  .map((name, i) => ({ id: 20 + i, name, email: `${name.split(' ')[0].toLowerCase()}@mail.com`, role: 'CUSTOMER', active: i !== 4, verified: true, contactNumber: `030${i}-5550${100 + i}`, createdAt: iso(80 - i * 5) }));
customers.unshift(users.CUSTOMER);

const reviews: any[] = [];
const reviewTexts = ['Beautiful quality — exactly as pictured and arrived quickly.', 'Solid construction and a lovely finish. Would buy again.', 'Looks even better in person. Packaging was excellent.', 'Good value for the price. Seller was responsive.'];
products.forEach((p) => { for (let k = 0; k < Math.min(p.totalReviews, 3); k++) { const c = customers[(p.id + k) % customers.length]; reviews.push({ id: reviews.length + 1, productId: p.id, productName: p.name, productSlug: p.slug, productImage: p.primaryImageUrl, userId: c.id, userName: c.name, userProfileImage: '', rating: 5 - ((p.id + k) % 3 === 0 ? 1 : 0), comment: reviewTexts[(p.id + k) % 4], verifiedPurchase: true, helpfulCount: k, createdAt: iso(3 + p.id + k * 4) }); } });

const statuses = ['DELIVERED', 'DELIVERED', 'SHIPPED', 'PROCESSING', 'CONFIRMED', 'PENDING', 'DELIVERED', 'CANCELLED', 'PENDING', 'SHIPPED', 'DELIVERED', 'PENDING', 'DELIVERED', 'CONFIRMED'];
const addr = { id: 1, fullName: 'Demo Customer', phoneNumber: '0321-5550101', addressLine1: 'House 12, Street 4, Clifton Block 5', addressLine2: '', city: 'Karachi', state: 'Sindh', pincode: '75600', country: 'Pakistan', defaultAddress: true };
const addresses: any[] = [addr];
const shipStr = (a: any) => `${a.fullName}, ${a.addressLine1}, ${a.city}, ${a.state} ${a.pincode}, ${a.country}`;
const mkOrder = (id: number, items: Array<[any, number]>, status: string, daysAgo: number, customer = users.CUSTOMER, coupon?: string, discount = 0, payment: any = 'CASH_ON_DELIVERY'): any => {
  const seller = sellers.find((s) => s.id === items[0][0].sellerId)!;
  const subtotal = items.reduce((n, [p, q]) => n + (p.discountedPrice ?? p.price) * q, 0);
  const shipping = subtotal - discount > 5000 ? 0 : 200;
  const history = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].slice(0, Math.max(1, ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(status) + 1)).map((s, k) => ({ status: s, comment: '', updatedBy: k ? seller.name : customer.name, createdAt: iso(daysAgo - k * 0.4) }));
  return {
    id, orderNumber: `ARG-${2400 + id}`, customerId: customer.id, customerName: customer.name, customerEmail: customer.email, sellerId: seller.id, sellerName: seller.name, shopName: seller.shopName,
    orderItems: items.map(([p, q], k) => ({ id: id * 10 + k, productId: p.id, productName: p.name, productImage: p.primaryImageUrl, quantity: q, unitPrice: p.discountedPrice ?? p.price, totalPrice: (p.discountedPrice ?? p.price) * q })),
    subtotalAmount: subtotal, discountAmount: discount, shippingAmount: shipping, taxAmount: 0, finalAmount: subtotal - discount + shipping,
    paymentMethod: payment, paymentStatus: status === 'DELIVERED' ? 'PAID' : status === 'CANCELLED' ? 'FAILED' : 'PENDING', orderStatus: status,
    shippingAddress: shipStr(addr), trackingNumber: ['SHIPPED', 'DELIVERED'].includes(status) ? `TRK${900000 + id}` : undefined, couponCode: coupon,
    estimatedDeliveryDate: iso(daysAgo - 4), deliveredAt: status === 'DELIVERED' ? iso(daysAgo - 3) : undefined, cancellationReason: status === 'CANCELLED' ? 'Changed my mind' : undefined,
    statusHistory: history, cancellable: ['PENDING', 'CONFIRMED'].includes(status), notes: '', createdAt: iso(daysAgo), updatedAt: iso(Math.max(0, daysAgo - 1)),
  };
};
const orders: any[] = statuses.map((s, i) => mkOrder(i + 1, [[products[(i * 5) % 24], 1 + (i % 2)], ...(i % 3 === 0 ? [[products[(i * 5 + 11) % 24], 1] as [any, number]] : [])] as any, s, 13 - i, customers[i % 4 === 0 ? 0 : (i % customers.length)]));
// keep each order single-seller
orders.forEach((o) => { o.orderItems = o.orderItems.filter((it: any) => products.find((p) => p.id === it.productId).sellerId === o.sellerId); if (!o.orderItems.length) { const p = products.find((x) => x.sellerId === o.sellerId)!; o.orderItems = [{ id: o.id * 10, productId: p.id, productName: p.name, productImage: p.primaryImageUrl, quantity: 1, unitPrice: p.discountedPrice ?? p.price, totalPrice: p.discountedPrice ?? p.price }]; } o.subtotalAmount = o.orderItems.reduce((n: number, it: any) => n + it.totalPrice, 0); o.shippingAmount = o.subtotalAmount > 5000 ? 0 : 200; o.finalAmount = o.subtotalAmount + o.shippingAmount - o.discountAmount; });

const coupons: any[] = [
  { id: 1, code: 'WELCOME10', description: '10% off your first order', discountType: 'PERCENTAGE', discountValue: 10, minOrderValue: 2000, maxDiscount: 3000, validFrom: iso(30), validUntil: iso(-90), usageLimit: 500, usedCount: 42, active: true },
  { id: 2, code: 'FLAT500', description: 'Rs 500 off orders above Rs 5,000', discountType: 'FIXED', discountValue: 500, minOrderValue: 5000, validFrom: iso(30), validUntil: iso(-60), usageLimit: 200, usedCount: 18, active: true },
  { id: 3, code: 'EID25', description: '25% off, up to Rs 2,000', discountType: 'PERCENTAGE', discountValue: 25, minOrderValue: 3000, maxDiscount: 2000, validFrom: iso(10), validUntil: iso(-20), usageLimit: 100, usedCount: 7, active: true },
];
const discountFor = (c: any, amount: number) => (amount < c.minOrderValue ? 0 : Math.min(c.discountType === 'PERCENTAGE' ? Math.round(amount * c.discountValue / 100) : c.discountValue, c.maxDiscount ?? Infinity));

const cart: Array<{ id: number; productId: number; quantity: number }> = [{ id: 1, productId: 1, quantity: 1 }, { id: 2, productId: 8, quantity: 2 }];
const wishlist = new Set<number>([5, 13]);
const notes: Record<Role, any[]> = {
  CUSTOMER: [
    { id: 1, title: 'Order delivered', message: 'Order #ARG-2401 has been delivered. Enjoy!', type: 'ORDER_DELIVERED', read: false, createdAt: iso(1), actionUrl: '/shop/orders' },
    { id: 2, title: 'Order shipped', message: 'Order #ARG-2403 is on its way.', type: 'ORDER_SHIPPED', read: false, createdAt: iso(2), actionUrl: '/shop/orders' },
    { id: 3, title: 'Welcome to Argon', message: 'Use WELCOME10 for 10% off your first order.', type: 'GENERAL', read: true, createdAt: iso(20) },
  ],
  SELLER: [
    { id: 1, title: 'New order', message: 'You received order #ARG-2406.', type: 'ORDER_PLACED', read: false, createdAt: iso(0) },
    { id: 2, title: 'Low stock', message: 'Arched Mirror is running low.', type: 'LOW_STOCK', read: false, createdAt: iso(1) },
    { id: 3, title: 'New review', message: 'Walnut Side Table received a 5★ review.', type: 'NEW_REVIEW', read: true, createdAt: iso(4) },
  ],
  ADMIN: [
    { id: 1, title: 'Seller awaiting approval', message: 'Lumen Studio applied to sell on Argon.', type: 'GENERAL', read: false, createdAt: iso(0) },
    { id: 2, title: 'Low stock alert', message: '3 products are out of stock.', type: 'LOW_STOCK', read: true, createdAt: iso(3) },
  ],
};
let maintenance = false;
let nextId = 1000;

/* ───────── persistence (survives page reloads; clear with localStorage.removeItem('argon-demo-db-v1')) ───────── */
const DB_KEY = 'argon-demo-db-v1';
const dbState: Record<string, any> = { products, categories, sellers, customers, reviews, orders, coupons, cart, addresses, notes, users };
const restoreDb = () => {
  try {
    const raw = localStorage.getItem(DB_KEY); if (!raw) return; const saved = JSON.parse(raw);
    Object.keys(dbState).forEach((k) => { if (saved[k] === undefined) return; if (Array.isArray(dbState[k])) dbState[k].splice(0, dbState[k].length, ...saved[k]); else Object.assign(dbState[k], saved[k]); });
    if (Array.isArray(saved.wishlist)) { wishlist.clear(); saved.wishlist.forEach((id: number) => wishlist.add(id)); }
    if (typeof saved.maintenance === 'boolean') maintenance = saved.maintenance;
    if (typeof saved.nextId === 'number') nextId = saved.nextId;
  } catch { /* ignore corrupt snapshot */ }
};
const saveDb = () => { try { localStorage.setItem(DB_KEY, JSON.stringify({ ...dbState, wishlist: [...wishlist], maintenance, nextId })); } catch { /* quota — ignore */ } };
restoreDb();

/* ───────── helpers ───────── */
class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }
const ok = (data: any, message = 'OK') => ({ success: true, message, data });
const paged = (all: any[], q: Record<string, any>, defSize = 10) => {
  const size = Number(q.size) || defSize; const page = Number(q.page) || 0; const totalPages = Math.max(1, Math.ceil(all.length / size));
  return { content: all.slice(page * size, page * size + size), totalElements: all.length, totalPages, pageSize: size, pageNumber: page, first: page === 0, last: page >= totalPages - 1 };
};
const seller = () => users.SELLER;
const catTree = () => { const byParent = (pid: number | null): any[] => categories.filter((c) => (c.parentId ?? null) === pid).map((c) => ({ ...c, productCount: products.filter((p) => p.categoryId === c.id).length, children: byParent(c.id) })); return byParent(null); };
const descendantIds = (id: number): number[] => [id, ...categories.filter((c) => c.parentId === id).flatMap((c) => descendantIds(c.id))];
const cartView = () => {
  const items = cart.map((ci) => { const p = products.find((x) => x.id === ci.productId)!; const eff = p.discountedPrice ?? p.price; return { id: ci.id, productId: p.id, productName: p.name, productImage: p.primaryImageUrl, unitPrice: p.price, effectivePrice: eff, quantity: ci.quantity, itemTotal: eff * ci.quantity, availableStock: p.stockQuantity, inStock: p.stockQuantity > 0 }; });
  const subtotal = items.reduce((n, i) => n + i.itemTotal, 0);
  return { items, totalItems: items.reduce((n, i) => n + i.quantity, 0), subtotal, discount: 0, total: subtotal };
};
const dailyRevenue = (list: any[]) => { const out: Record<string, number> = {}; for (let d = 6; d >= 0; d--) out[new Date(now - d * DAY).toISOString().slice(0, 10)] = 0; list.filter((o) => o.orderStatus !== 'CANCELLED').forEach((o) => { const k = o.createdAt.slice(0, 10); if (k in out) out[k] += o.finalAmount; }); if (Object.values(out).every((v) => v === 0)) Object.keys(out).forEach((k, i) => (out[k] = [12000, 28500, 19000, 46000, 33500, 21000, 38000][i])); return out; };
const byStatus = (list: any[]) => list.reduce((a: any, o) => ({ ...a, [o.orderStatus]: (a[o.orderStatus] || 0) + 1 }), {});
const sum = (list: any[]) => list.filter((o) => o.orderStatus !== 'CANCELLED').reduce((n, o) => n + o.finalAmount, 0);
const sortProducts = (list: any[], by: string, dir: string) => { const f: any = { price: (p: any) => p.discountedPrice ?? p.price, name: (p: any) => p.name, averageRating: (p: any) => p.averageRating, createdAt: (p: any) => p.createdAt }[by] || ((p: any) => p.createdAt); const s = [...list].sort((a, b) => (f(a) > f(b) ? 1 : f(a) < f(b) ? -1 : 0)); return dir === 'ASC' ? s : s.reverse(); };
const needSeller = (o: any) => { if (o.sellerId !== 2) throw new HttpError(404, 'Order not found'); };
const note = (role: Role, n: any) => notes[role].unshift({ id: nextId++, read: false, createdAt: new Date().toISOString(), ...n });

/* ───────── routes ───────── */
type Handler = (c: Ctx) => any;
const routes: Array<[string, RegExp, Handler]> = [];
const on = (method: string, pattern: string, h: Handler) => routes.push([method, new RegExp('^' + pattern + '$'), h]);

// auth
on('POST', '/api/auth/login', ({ body }) => {
  const email = String(body?.email || '').toLowerCase(); const role: Role = email.includes('admin') ? 'ADMIN' : email.includes('seller') ? 'SELLER' : 'CUSTOMER';
  const u = users[role]; if (role === 'CUSTOMER') { u.email = email || u.email; u.name = email ? email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : u.name; }
  return ok({ userId: u.id, name: u.name, email: u.email, role, accessToken: `mock-${role}`, refreshToken: `mock-${role}`, tokenType: 'Bearer', expiresIn: 3_600_000, verified: true, sellerApproved: true });
});
on('POST', '/api/auth/(register|verify-email|resend-otp|forgot-password|reset-password|logout|change-password|change-password/request-otp)', () => ok(null, 'Done'));
// public
on('GET', '/api/public/stats', () => ok({ verifiedSellers: sellers.filter((s) => s.sellerStatus === 'APPROVED').length + 120, totalCustomers: 5840, totalProducts: products.length + 2276, averageRating: 4.7 }));
on('GET', '/api/products', ({ q }) => {
  let l = products.filter((p) => p.active);
  if (q.q) l = l.filter((p) => `${p.name} ${p.brand} ${p.categoryName}`.toLowerCase().includes(String(q.q).toLowerCase()));
  if (q.categoryId) { const ids = descendantIds(Number(q.categoryId)); l = l.filter((p) => ids.includes(p.categoryId)); }
  if (q.brand) l = l.filter((p) => p.brand === q.brand);
  return ok(paged(sortProducts(l, q.sortBy, q.sortDir), q, 12));
});
on('GET', '/api/products/slug/([^/]+)', ({ m }) => { const p = products.find((x) => x.slug === m[1]); if (!p) throw new HttpError(404, 'Product not found'); return ok(p); });
on('GET', '/api/products/(\\d+)/reviews', ({ m, q }) => ok(paged(reviews.filter((r) => r.productId === +m[1]), q, 5)));
on('GET', '/api/categories', () => ok(catTree()));
on('GET', '/api/brands', () => ok([...new Set(products.map((p) => p.brand))].sort()));
on('GET', '/api/sellers/(\\d+)', ({ m }) => { const s = sellers.find((x) => x.id === +m[1]); if (!s) throw new HttpError(404, 'Seller not found'); const ps = products.filter((p) => p.sellerId === s.id); return ok({ id: s.id, name: s.name, shopName: s.shopName, shopDescription: s.shopDescription, shopLogo: '', shopBanner: '', memberSince: s.createdAt, totalProducts: ps.length, ordersDelivered: 40 + s.id, averageRating: 4.6, totalReviews: 18 }); });
on('GET', '/api/sellers/(\\d+)/products', ({ m, q }) => ok(paged(products.filter((p) => p.sellerId === +m[1]), q, 12)));
on('GET', '/api/customers/(\\d+)', ({ m }) => { const c = customers.find((x) => x.id === +m[1]); if (!c) throw new HttpError(404, 'Not found'); return ok({ id: c.id, name: c.name, profileImage: '', memberSince: c.createdAt, totalReviews: reviews.filter((r) => r.userId === c.id).length }); });
on('GET', '/api/customers/(\\d+)/reviews', ({ m, q }) => ok(paged(reviews.filter((r) => r.userId === +m[1]), q, 10)));

// customer: cart
on('GET', '/api/customer/cart', () => ok(cartView()));
on('POST', '/api/customer/cart', ({ body }) => { const p = products.find((x) => x.id === body.productId); if (!p) throw new HttpError(404, 'Product not found'); if (p.stockQuantity <= 0) throw new HttpError(400, 'Product is out of stock'); const ex = cart.find((c) => c.productId === p.id); if (ex) ex.quantity = Math.min(p.stockQuantity, ex.quantity + (body.quantity || 1)); else cart.push({ id: nextId++, productId: p.id, quantity: body.quantity || 1 }); return ok({ id: p.id }); });
on('DELETE', '/api/customer/cart/clear', () => { cart.length = 0; return ok(null); });
on('PUT', '/api/customer/cart/(\\d+)', ({ m, body, q }) => { const c = cart.find((x) => x.id === +m[1]); if (c) c.quantity = Number(body?.quantity ?? q.quantity ?? c.quantity); return ok(null); });
on('DELETE', '/api/customer/cart/(\\d+)', ({ m }) => { const i = cart.findIndex((x) => x.id === +m[1]); if (i >= 0) cart.splice(i, 1); return ok(null); });
on('GET', '/api/customer/coupons/active', ({ q }) => ok(coupons.filter((c) => c.active).map((c) => ({ ...c, valid: Number(q.orderAmount || 0) >= c.minOrderValue, applicableDiscount: discountFor(c, Number(q.orderAmount || 0)) }))));
on('POST', '/api/customer/coupons/validate', ({ body }) => { const c = coupons.find((x) => x.code === String(body.couponCode).toUpperCase() && x.active); if (!c) throw new HttpError(400, 'Invalid coupon code'); if (body.orderAmount < c.minOrderValue) throw new HttpError(400, `Minimum order value is Rs ${c.minOrderValue}`); return ok({ ...c, valid: true, applicableDiscount: discountFor(c, body.orderAmount) }); });
// customer: addresses
on('GET', '/api/customer/addresses', () => ok(addresses));
on('POST', '/api/customer/addresses', ({ body }) => { if (body.defaultAddress) addresses.forEach((a) => (a.defaultAddress = false)); const a = { ...body, id: nextId++ }; addresses.push(a); return ok(a); });
on('PUT', '/api/customer/addresses/(\\d+)', ({ m, body }) => { if (body.defaultAddress) addresses.forEach((a) => (a.defaultAddress = false)); const a = addresses.find((x) => x.id === +m[1]); Object.assign(a || {}, body); return ok(a); });
on('DELETE', '/api/customer/addresses/(\\d+)', ({ m }) => { const i = addresses.findIndex((x) => x.id === +m[1]); if (i >= 0) addresses.splice(i, 1); return ok(null); });
// customer: wishlist / orders / reviews
on('GET', '/api/customer/wishlist', ({ q }) => ok(paged(products.filter((p) => wishlist.has(p.id)), q, 12)));
on('POST', '/api/customer/wishlist/(\\d+)', ({ m }) => { wishlist.add(+m[1]); return ok(null); });
on('DELETE', '/api/customer/wishlist/(\\d+)', ({ m }) => { wishlist.delete(+m[1]); return ok(null); });
on('GET', '/api/customer/orders', ({ q }) => { let l = orders.filter((o) => o.customerId === 1); if (q.status) l = l.filter((o) => o.orderStatus === q.status); return ok(paged([...l].reverse(), q, 10)); });
on('PUT', '/api/customer/orders/(\\d+)/cancel', ({ m, body, q }) => { const o = orders.find((x) => x.id === +m[1]); if (!o) throw new HttpError(404, 'Order not found'); o.orderStatus = 'CANCELLED'; o.cancellable = false; o.cancellationReason = body?.reason || q.reason || 'Cancelled by customer'; return ok(o); });
on('POST', '/api/customer/orders/checkout', ({ body }) => {
  if (!cart.length) throw new HttpError(400, 'Your cart is empty');
  const cp = body.couponCode ? coupons.find((c) => c.code === body.couponCode) : undefined; const view = cartView(); const disc = cp ? discountFor(cp, view.total) : 0; const created: any[] = [];
  const bySeller = new Map<number, Array<[any, number]>>(); cart.forEach((ci) => { const p = products.find((x) => x.id === ci.productId)!; bySeller.set(p.sellerId, [...(bySeller.get(p.sellerId) || []), [p, ci.quantity]]); });
  [...bySeller.values()].forEach((items, k) => { const o = mkOrder(nextId++, items, 'PENDING', 0, users.CUSTOMER, cp?.code, k === 0 ? disc : 0, body.paymentMethod); o.notes = body.notes || ''; orders.push(o); created.push(o); note('CUSTOMER', { title: 'Order placed', message: `Order #${o.orderNumber} was placed successfully.`, type: 'ORDER_PLACED', actionUrl: '/shop/orders' }); note('SELLER', { title: 'New order', message: `You received order #${o.orderNumber}.`, type: 'ORDER_PLACED' }); });
  cart.length = 0; return ok(created, 'Order placed');
});
on('POST', '/api/customer/orders/(\\d+)/payment/initiate', () => { throw new HttpError(400, 'Online payment is unavailable in demo mode'); });
on('POST', '/api/customer/reviews', ({ body }) => { const p = products.find((x) => x.id === body.productId); if (!p) throw new HttpError(404, 'Product not found'); reviews.unshift({ id: nextId++, productId: p.id, productName: p.name, productSlug: p.slug, productImage: p.primaryImageUrl, userId: 1, userName: users.CUSTOMER.name, userProfileImage: '', rating: body.rating, comment: body.comment, verifiedPurchase: true, helpfulCount: 0, createdAt: new Date().toISOString() }); p.totalReviews += 1; return ok(null); });

// shared: profile + notifications (customer | seller | admin)
on('GET', '/api/(customer|seller|admin)/profile', ({ m }) => ok(users[m[1].toUpperCase()]));
on('PUT', '/api/(customer|seller|admin)/profile', ({ m, body }) => { const u = users[m[1].toUpperCase()]; Object.assign(u, body || {}); return ok(u); });
on('POST', '/api/(customer|seller|admin)/profile/photo', ({ m }) => { users[m[1].toUpperCase()].profileImage = art(4, 1); return ok(users[m[1].toUpperCase()].profileImage); });
on('GET', '/api/(customer|seller|admin)/notifications/unread-count', ({ m }) => ok(notes[m[1].toUpperCase() as Role].filter((n) => !n.read).length));
on('GET', '/api/(customer|seller|admin)/notifications', ({ m, q }) => ok(paged(notes[m[1].toUpperCase() as Role], q, 10)));
on('PUT', '/api/(customer|seller|admin)/notifications/read-all', ({ m }) => { notes[m[1].toUpperCase() as Role].forEach((n) => (n.read = true)); return ok(null); });
on('PUT', '/api/(customer|seller|admin)/notifications/(\\d+)/read', ({ m }) => { const n = notes[m[1].toUpperCase() as Role].find((x) => x.id === +m[2]); if (n) n.read = true; return ok(null); });
on('DELETE', '/api/(customer|seller|admin)/notifications/clear-all', ({ m }) => { notes[m[1].toUpperCase() as Role].length = 0; return ok(null); });
on('DELETE', '/api/(customer|seller|admin)/notifications/(\\d+)', ({ m }) => { const l = notes[m[1].toUpperCase() as Role]; const i = l.findIndex((x) => x.id === +m[2]); if (i >= 0) l.splice(i, 1); return ok(null); });

// seller
const mine = () => products.filter((p) => p.sellerId === 2);
const myOrders = () => orders.filter((o) => o.sellerId === 2);
on('GET', '/api/seller/dashboard/stats', () => { const o = myOrders(); return ok({ totalProducts: mine().length, lowStockProducts: mine().filter((p) => p.stockQuantity > 0 && p.stockQuantity < 10).length, outOfStockProducts: mine().filter((p) => p.stockQuantity <= 0).length, totalOrders: o.length, pendingOrders: o.filter((x) => x.orderStatus === 'PENDING').length, activeOrders: o.filter((x) => ['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(x.orderStatus)).length, deliveredOrders: o.filter((x) => x.orderStatus === 'DELIVERED').length, cancelledOrders: o.filter((x) => x.orderStatus === 'CANCELLED').length, totalRevenue: sum(o), monthlyRevenue: sum(o), todayRevenue: 0, shopName: seller().shopName, sellerStatus: 'APPROVED', dailyRevenue: dailyRevenue(o), ordersByStatus: byStatus(o) }); });
on('GET', '/api/seller/products', ({ q }) => ok(paged([...mine()].reverse(), q, 10)));
on('POST', '/api/seller/products', ({ body }) => { const cat = categories.find((c) => c.id === +body.categoryId); const imgs = (body.imageUrls || []) as string[]; const id = nextId++; const price = Number(body.price); const p = { id, name: body.name, slug: `${String(body.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id}`, brand: body.brand || '', categoryId: cat?.id, categoryName: cat?.name, price, discountedPrice: body.discountedPrice ? Number(body.discountedPrice) : undefined, effectivePrice: body.discountedPrice ? Number(body.discountedPrice) : price, stockQuantity: Number(body.stockQuantity) || 0, inStock: true, sku: `ARG-${id}`, shortDescription: body.shortDescription || '', description: body.description || '', primaryImageUrl: imgs[0] || art(id, 0), images: (imgs.length ? imgs : [art(id, 0)]).map((u, k) => ({ id: id * 10 + k, imageUrl: u, primary: k === 0, displayOrder: k })), sellerId: 2, sellerName: seller().name, shopName: seller().shopName, averageRating: 0, totalReviews: 0, totalSold: 0, active: true, adminLocked: false, featured: !!body.featured, createdAt: new Date().toISOString(), specifications: body.specifications }; products.push(p as any); return ok(p); });
on('PUT', '/api/seller/products/(\\d+)/stock', ({ m, body, q }) => { const p = products.find((x) => x.id === +m[1]); if (p) p.stockQuantity = Number(body?.stockQuantity ?? body?.quantity ?? q.quantity ?? p.stockQuantity); return ok(p); });
on('PUT', '/api/seller/products/(\\d+)/status', ({ m, q }) => { const p = products.find((x) => x.id === +m[1]); if (p) p.active = q.active !== undefined ? String(q.active) === 'true' : !p.active; return ok(p); });
on('PUT', '/api/seller/products/(\\d+)', ({ m, body }) => { const p = products.find((x) => x.id === +m[1]); if (!p) throw new HttpError(404, 'Not found'); const cat = categories.find((c) => c.id === +body.categoryId); const imgs = (body.imageUrls || []) as string[]; Object.assign(p, { name: body.name, brand: body.brand, description: body.description, shortDescription: body.shortDescription, price: Number(body.price), discountedPrice: body.discountedPrice ? Number(body.discountedPrice) : undefined, stockQuantity: Number(body.stockQuantity), featured: !!body.featured, specifications: body.specifications ?? p.specifications, ...(cat ? { categoryId: cat.id, categoryName: cat.name } : {}), ...(imgs.length ? { primaryImageUrl: imgs[0], images: imgs.map((u, k) => ({ id: p.id * 10 + k, imageUrl: u, primary: k === 0, displayOrder: k })) } : {}) }); p.effectivePrice = p.discountedPrice ?? p.price; return ok(p); });
on('DELETE', '/api/seller/products/(\\d+)', ({ m }) => { const i = products.findIndex((x) => x.id === +m[1]); if (i >= 0) products.splice(i, 1); return ok(null); });
on('GET', '/api/seller/orders', ({ q }) => ok(paged([...myOrders()].reverse(), q, 10)));
on('PUT', '/api/seller/orders/(\\d+)/status', ({ m, body, q }) => { const o = orders.find((x) => x.id === +m[1]); if (!o) throw new HttpError(404, 'Order not found'); needSeller(o); const st = body?.status || q.status; o.orderStatus = st; o.cancellable = ['PENDING', 'CONFIRMED'].includes(st); if (body?.trackingNumber) o.trackingNumber = body.trackingNumber; if (st === 'DELIVERED') { o.paymentStatus = 'PAID'; o.deliveredAt = new Date().toISOString(); } o.statusHistory = [...(o.statusHistory || []), { status: st, comment: body?.comment || '', updatedBy: seller().name, createdAt: new Date().toISOString() }]; return ok(o); });
on('POST', '/api/seller/uploads', () => ok([art(Math.floor(Math.random() * 6), Math.floor(Math.random() * 3))]));
on('POST', '/api/seller/reapply', ({ body }) => { Object.assign(users.SELLER, body); users.SELLER.sellerStatus = 'PENDING'; return ok(users.SELLER); });
on('GET', '/api/seller/reports/sales', () => 'blob');

// admin
on('GET', '/api/admin/dashboard/stats', () => ok({ totalUsers: customers.length + sellers.length + 1, totalSellers: sellers.length, approvedSellers: sellers.filter((s) => s.sellerStatus === 'APPROVED').length, pendingSellerApprovals: sellers.filter((s) => s.sellerStatus === 'PENDING').length, totalCustomers: customers.length, totalProducts: products.length, totalOrders: orders.length, pendingOrders: orders.filter((o) => o.orderStatus === 'PENDING').length, totalRevenue: sum(orders), monthlyRevenue: sum(orders), todayRevenue: sum(orders.filter((o) => o.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10))), dailyRevenue: dailyRevenue(orders), ordersByStatus: byStatus(orders) }));
on('GET', '/api/admin/sellers', ({ q }) => ok(paged(sellers.filter((s) => !q.status || s.sellerStatus === q.status), q, 10)));
const setSeller = (id: string, patch: any) => { const s: any = sellers.find((x) => x.id === +id); if (!s) throw new HttpError(404, 'Seller not found'); Object.assign(s, patch); return ok(s); };
on('PUT', '/api/admin/sellers/(\\d+)/approve', ({ m }) => setSeller(m[1], { sellerStatus: 'APPROVED', active: true, rejectionReason: undefined }));
on('PUT', '/api/admin/sellers/(\\d+)/reject', ({ m, body, q }) => setSeller(m[1], { sellerStatus: 'REJECTED', active: false, rejectionReason: body?.reason || q.reason || 'Does not meet requirements' }));
on('PUT', '/api/admin/sellers/(\\d+)/status', ({ m, q }) => setSeller(m[1], String(q.enable) === 'true' ? { sellerStatus: 'APPROVED', active: true } : { sellerStatus: 'SUSPENDED', active: false }));
on('GET', '/api/admin/customers', ({ q }) => ok(paged(customers.filter((c) => !q.search || `${c.name} ${c.email}`.toLowerCase().includes(String(q.search).toLowerCase())), q, 10)));
on('DELETE', '/api/admin/customers', () => ok(null));
on('DELETE', '/api/admin/customers/(\\d+)', ({ m }) => { const i = customers.findIndex((c) => c.id === +m[1]); if (i > 0) customers.splice(i, 1); return ok(null); });
on('PUT', '/api/admin/users/(\\d+)/status', ({ m, q }) => { const c = customers.find((x) => x.id === +m[1]); if (c) c.active = String(q.enable) === 'true'; return ok(c); });
on('GET', '/api/admin/products', ({ q }) => { let l = [...products].reverse(); if (q.q) l = l.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(String(q.q).toLowerCase())); if (q.active !== undefined) l = l.filter((p) => p.active === (String(q.active) === 'true')); return ok(paged(l, q, 10)); });
on('PUT', '/api/admin/products/(\\d+)/status', ({ m, q }) => { const p = products.find((x) => x.id === +m[1]); if (p) { p.active = q.active !== undefined ? String(q.active) === 'true' : !p.active; p.adminLocked = !p.active; } return ok(p); });
on('GET', '/api/admin/orders', ({ q }) => ok(paged([...orders].reverse(), q, 10)));
on('GET', '/api/admin/orders/(\\d+)', ({ m }) => { const o = orders.find((x) => x.id === +m[1]); if (!o) throw new HttpError(404, 'Order not found'); return ok(o); });
on('GET', '/api/admin/categories', () => ok(catTree()));
on('POST', '/api/admin/categories', ({ body }) => { const c = { id: nextId++, slug: String(body.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'), imageUrl: body.imageUrl || art(3, 1), active: true, displayOrder: categories.length, description: '', ...body }; categories.push(c as any); return ok(c); });
on('PUT', '/api/admin/categories/(\\d+)', ({ m, body }) => { const c = categories.find((x) => x.id === +m[1]); Object.assign(c || {}, body); return ok(c); });
on('DELETE', '/api/admin/categories/(\\d+)', ({ m }) => { const i = categories.findIndex((x) => x.id === +m[1]); if (i >= 0) categories.splice(i, 1); return ok(null); });
on('GET', '/api/admin/coupons', ({ q }) => ok(paged(coupons, q, 10)));
on('POST', '/api/admin/coupons', ({ body }) => { const c = { id: nextId++, usedCount: 0, active: true, ...body, code: String(body.code).toUpperCase() }; coupons.push(c); return ok(c); });
on('PUT', '/api/admin/coupons/(\\d+)', ({ m, body }) => { const c = coupons.find((x) => x.id === +m[1]); Object.assign(c || {}, body); return ok(c); });
on('DELETE', '/api/admin/coupons/(\\d+)', ({ m }) => { const i = coupons.findIndex((x) => x.id === +m[1]); if (i >= 0) coupons.splice(i, 1); return ok(null); });
on('GET', '/api/admin/settings/maintenance', () => ok(maintenance));
on('POST', '/api/admin/settings/maintenance', ({ q }) => { maintenance = String(q.enable) === 'true'; return ok(maintenance); });
on('PUT', '/api/admin/settings', () => ok(null));
on('GET', '/api/admin/reports/sales', () => 'blob');

/* ───────── adapter ───────── */
export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  await new Promise((r) => setTimeout(r, 120 + Math.random() * 180));
  const [rawPath, rawQuery = ''] = String(config.url || '').split('?');
  const path = rawPath.replace(/^https?:\/\/[^/]+/, '');
  const q: Record<string, any> = { ...Object.fromEntries(new URLSearchParams(rawQuery)), ...(config.params || {}) };
  Object.keys(q).forEach((k) => q[k] === undefined && delete q[k]);
  let body: any = config.data; if (typeof body === 'string') { try { body = JSON.parse(body); } catch { /* keep */ } }
  const auth = String((config.headers as any)?.Authorization || (config.headers as any)?.get?.('Authorization') || '');
  const role = (auth.match(/mock-(ADMIN|SELLER|CUSTOMER)/)?.[1] as Role) || null;
  const method = (config.method || 'get').toUpperCase();
  const fail = (status: number, msg: string) => { const response = { data: { success: false, message: msg, error: msg }, status, statusText: msg, headers: {}, config } as AxiosResponse; return new AxiosError(msg, status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST', config, null, response); };
  const protectedMatch = path.match(/^\/api\/(customer|seller|admin)\//);
  if (protectedMatch && role !== protectedMatch[1].toUpperCase()) throw fail(401, 'Please log in to continue');
  for (const [mth, re, h] of routes) {
    if (mth !== method) continue; const m = path.match(re); if (!m) continue;
    try {
      let data = h({ m, q, body, role });
      if (data === 'blob') data = new Blob(['Argon demo report — connect the backend for real exports.'], { type: 'text/plain' });
      if (method !== 'GET') saveDb();
      return { data, status: 200, statusText: 'OK', headers: {}, config };
    } catch (e) { if (e instanceof HttpError) throw fail(e.status, e.message); throw fail(500, 'Demo data error'); }
  }
  console.warn(`[demo-mode] no mock handler for ${method} ${path}`);
  throw fail(404, `No demo handler for ${method} ${path}`);
}
