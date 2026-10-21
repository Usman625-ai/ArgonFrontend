import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ShoppingBag, Heart, Minus, Plus, Package, Truck, ShieldCheck, RotateCcw, ChevronRight, MessageSquare, Check, Store } from 'lucide-react';
import api from '../../lib/api';
import type { Product, Review, ApiResponse, PagedResponse } from '../../types';
import { cn, formatPrice, formatDate, getEffectivePrice, getDiscountPercentage, getProductImages, truncate } from '../../lib/utils';
import { Button, StarRating, Skeleton, Textarea, Field, SmartImage, SkeletonCard } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToCart } from '../../store/cartSlice';
import EmptyState from '../../components/shop/EmptyState';
import ProductCard from '../../components/shop/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(0);
  const [totalReviewPages, setTotalReviewPages] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [wished, setWished] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const loadProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<Product>>(`/api/products/slug/${slug}`);
      setProduct(res.data.data);
      setActiveImage(0);
      setQuantity(1);
    } catch { setProduct(null); } finally { setLoading(false); }
  }, [slug]);

  const loadReviews = useCallback(async () => {
    if (!product) return;
    setReviewsLoading(true);
    try {
      const res = await api.get<ApiResponse<PagedResponse<Review>>>(`/api/products/${product.id}/reviews`, { params: { page: reviewPage, size: 5 } });
      setReviews(res.data.data.content || []);
      setTotalReviewPages(res.data.data.totalPages || 0);
    } catch { setReviews([]); } finally { setReviewsLoading(false); }
  }, [product, reviewPage]);

  const loadRelated = useCallback(async () => {
    if (!product) return;
    setRelatedLoading(true);
    try {
      const categoryId = product.categoryId || product.category?.id;
      const res = await api.get<ApiResponse<PagedResponse<Product>>>('/api/products', {
        params: { page: 0, size: 8, ...(categoryId ? { categoryId } : {}), sortBy: 'createdAt', sortDir: 'DESC' },
      });
      setRelatedProducts((res.data.data.content || []).filter((p) => p.id !== product.id).slice(0, 6));
    } catch { setRelatedProducts([]); } finally { setRelatedLoading(false); }
  }, [product]);

  useEffect(() => { loadProduct(); }, [loadProduct]);
  useEffect(() => { if (product) loadReviews(); }, [product, loadReviews]);
  useEffect(() => { if (product) loadRelated(); }, [product, loadRelated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); navigate('/login'); return; }
    if (!product || product.stockQuantity <= 0) { toast.error('Product is out of stock'); return; }
    try {
      await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
      toast.success(`${quantity} item(s) added to cart`);
    } catch (err) { toast.error(err as string); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login to use wishlist'); return; }
    if (!product) return;
    try {
      if (wished) {
        await api.delete(`/api/customer/wishlist/${product.id}`);
        setWished(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/api/customer/wishlist/${product.id}`);
        setWished(true);
        toast.success('Added to wishlist');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Wishlist action failed');
    }
  };

  const submitReview = async () => {
    if (!isAuthenticated) { toast.error('Please login to write a review'); return; }
    if (!product) return;
    if (!reviewComment.trim()) { toast.error('Please write a comment'); return; }
    setSubmittingReview(true);
    try {
      await api.post('/api/customer/reviews', { productId: product.id, rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted successfully');
      setReviewSubmitted(true);
      loadReviews();
      loadProduct();
      setTimeout(() => {
        setReviewComment('');
        setReviewRating(5);
        setShowReviewForm(false);
        setReviewSubmitted(false);
      }, 1100);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[88rem] px-4 pb-10 pt-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <Skeleton className="aspect-square w-full rounded-[2rem]" />
          <div className="space-y-4 pt-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-12 w-3/4" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-28 w-full" /><Skeleton className="h-14 w-full rounded-full" /></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <EmptyState icon={Package} title="Product not found" description="The product you're looking for doesn't exist or has been removed." actionLabel="Browse Products" onAction={() => navigate('/shop/products')} />;
  }

  const images = getProductImages(product);
  const effectivePrice = getEffectivePrice(product);
  const discount = getDiscountPercentage(product.price, product.discountedPrice);
  const outOfStock = product.stockQuantity <= 0;
  const specs = product.specifications ? (typeof product.specifications === 'string' ? (() => { try { return JSON.parse(product.specifications); } catch { return null; } })() : product.specifications) : null;
  const categoryName = product.categoryName || product.category?.name;
  const stepBtn = 'flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-90 disabled:opacity-40 disabled:active:scale-100';

  return (
    <div className="pb-28 lg:pb-10">
      <div className="mx-auto max-w-[88rem] px-4 pt-6 sm:px-8 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/shop" className="hover:text-foreground">Home</Link><ChevronRight className="h-3 w-3" />
          <Link to="/shop/products" className="hover:text-foreground">Shop</Link>
          {categoryName && (<><ChevronRight className="h-3 w-3" /><Link to={product.categoryId ? `/shop/products?categoryId=${product.categoryId}` : '/shop/products'} className="hover:text-foreground">{categoryName}</Link></>)}
          <ChevronRight className="h-3 w-3" /><span className="max-w-[12rem] truncate text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          {/* Gallery */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row lg:self-start">
            {images.length > 1 && (
              <div className="scrollbar-thin flex gap-2.5 overflow-x-auto p-1 sm:max-h-[40rem] sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} aria-label={`View image ${i + 1}`} className={cn('h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl bg-secondary ring-2 transition-all sm:h-20 sm:w-20', i === activeImage ? 'ring-foreground' : 'ring-transparent opacity-70 hover:opacity-100')}>
                    <SmartImage src={img} alt={`${product.name} ${i + 1}`} width={120} aspect="auto" className="h-full w-full" fallbackIcon={<Package className="h-6 w-6" />} />
                  </button>
                ))}
              </div>
            )}
            <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[2rem] bg-secondary">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-0">
                  {images[activeImage]
                    ? <SmartImage src={images[activeImage]} alt={product.name} width={1000} aspect="auto" className="h-full w-full" fallbackIcon={<Package className="h-16 w-16" />} />
                    : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><Package className="h-16 w-16" /></div>}
                </motion.div>
              </AnimatePresence>
              {discount > 0 && <span className="absolute left-4 top-4 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background">−{discount}%</span>}
            </div>
          </div>

          {/* Info */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">{[product.brand, categoryName].filter(Boolean).join(' · ') || 'Argon'}</p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">{product.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <StarRating rating={product.averageRating || 0} size={16} />
              <span className="font-medium">{product.averageRating?.toFixed(1) || '0.0'}</span>
              <a href="#reviews" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">{product.totalReviews || 0} reviews</a>
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-semibold tracking-tight tabular-nums">{formatPrice(effectivePrice)}</span>
              {discount > 0 && <span className="text-lg text-muted-foreground line-through tabular-nums">{formatPrice(product.price)}</span>}
              {discount > 0 && <span className="rounded-full bg-success/12 px-3 py-1 text-xs font-semibold text-success">Save {formatPrice(product.price - effectivePrice)}</span>}
            </div>

            <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">{product.shortDescription || truncate(product.description, 220)}</p>

            <div className="mt-5 flex items-center gap-2 text-sm">
              <span className={cn('h-2 w-2 rounded-full', outOfStock ? 'bg-destructive' : product.stockQuantity <= 5 ? 'bg-warning' : 'bg-success')} />
              <span className="font-medium">{outOfStock ? 'Out of stock' : product.stockQuantity <= 5 ? `Only ${product.stockQuantity} left` : 'In stock'}</span>
              {!outOfStock && product.stockQuantity > 5 && <span className="text-muted-foreground">· {product.stockQuantity} available</span>}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-full bg-secondary p-1.5">
                <button aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={outOfStock || quantity <= 1} className={cn(stepBtn, 'bg-card shadow-sm')}><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                <button aria-label="Increase quantity" onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))} disabled={outOfStock || quantity >= product.stockQuantity} className={cn(stepBtn, 'bg-foreground text-background')}><Plus className="h-4 w-4" /></button>
              </div>
              <Button size="lg" onClick={handleAddToCart} disabled={outOfStock} className="hidden flex-1 lg:inline-flex"><ShoppingBag className="h-[18px] w-[18px]" /> Add to bag</Button>
              <button onClick={handleWishlist} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'} className="flex h-14 w-14 items-center justify-center rounded-full bg-card ring-1 ring-border transition-colors hover:bg-accent active:scale-95">
                <motion.span animate={wished ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}><Heart className={cn('h-5 w-5 transition-colors', wished && 'fill-destructive text-destructive')} /></motion.span>
              </button>
            </div>

            {product.sellerName && (
              <button onClick={() => product.sellerId && navigate(`/shop/seller/${product.sellerId}`)} className="group mt-7 flex w-full items-center gap-3.5 rounded-3xl bg-card p-3.5 text-left ring-1 ring-border/60 transition-shadow hover:shadow-luxury">
                {product.sellerProfileImage
                  ? <SmartImage src={product.sellerProfileImage} alt={product.shopName || product.sellerName} width={48} className="h-12 w-12 shrink-0 rounded-full" fallbackIcon={<Store className="h-5 w-5" />} />
                  : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">{(product.shopName || product.sellerName).charAt(0).toUpperCase()}</div>}
                <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">Sold by</p><p className="truncate text-sm font-semibold">{product.shopName || product.sellerName}</p></div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            <ul className="mt-4 grid grid-cols-3 gap-2.5">
              {[{ i: Truck, t: 'Fast delivery' }, { i: ShieldCheck, t: 'Secure payment' }, { i: RotateCcw, t: 'Easy returns' }].map((f) => (
                <li key={f.t} className="flex flex-col items-center gap-1.5 rounded-2xl bg-secondary/70 px-2 py-3.5 text-center"><f.i className="h-[18px] w-[18px]" strokeWidth={1.6} /><span className="text-[0.7rem] text-muted-foreground sm:text-xs">{f.t}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Description + specs */}
        <div className="mt-20 grid gap-10 border-t border-border pt-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <section>
            <h2 className="section-title !text-left !text-xl">The <em className="inline !text-[1.3em]">details</em></h2>
            <p className="mt-5 whitespace-pre-line text-[0.95rem] leading-relaxed text-muted-foreground">{product.description}</p>
          </section>
          <section>
            <h2 className="eyebrow">Specifications</h2>
            {specs && typeof specs === 'object' && Object.keys(specs).length > 0 ? (
              <dl className="mt-4 divide-y divide-border rounded-3xl bg-card px-5 ring-1 ring-border/60">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3.5 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{String(v)}</dd></div>
                ))}
              </dl>
            ) : <p className="mt-4 text-sm text-muted-foreground">No specifications available.</p>}
          </section>
        </div>

        {/* Reviews */}
        <section id="reviews" className="mt-20 scroll-mt-28 border-t border-border pt-12">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Reviews <span className="font-editorial font-normal italic text-gold">({product.totalReviews || 0})</span></h2>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><StarRating rating={product.averageRating || 0} size={16} />{product.averageRating?.toFixed(1) || '0.0'} average</div>
            </div>
            {isAuthenticated && user?.role === 'CUSTOMER' && (
              <Button variant="outline" onClick={() => setShowReviewForm((v) => !v)}><MessageSquare className="h-4 w-4" /> {showReviewForm ? 'Cancel' : 'Write a review'}</Button>
            )}
          </div>

          <AnimatePresence>
            {showReviewForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mb-8 overflow-hidden">
                <div className="relative max-w-2xl space-y-5 overflow-hidden rounded-3xl bg-card p-6 ring-1 ring-border/60">
                  <AnimatePresence>
                    {reviewSubmitted && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-success text-success-foreground">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><Check className="h-6 w-6" /></span>
                        <p className="text-sm font-medium">Thanks for your review!</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Field label="Your rating"><StarRating rating={reviewRating} size={28} interactive onChange={setReviewRating} /></Field>
                  <Field label="Your review"><Textarea rows={4} placeholder="Share your experience with this product..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} /></Field>
                  <Button onClick={submitReview} loading={submittingReview}>Submit review</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {reviewsLoading ? (
            <div className="grid gap-3 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}</div>
          ) : reviews.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No reviews yet" description="Be the first to review this product." className="py-12" />
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                {reviews.map((r) => (
                  <article key={r.id} className="rounded-3xl bg-card p-6 ring-1 ring-border/60">
                    <div className="flex items-center justify-between gap-3">
                      <button onClick={() => navigate(`/shop/reviewer/${r.userId}`)} className="group flex items-center gap-3 text-left">
                        {r.userProfileImage
                          ? <SmartImage src={r.userProfileImage} alt={r.userName || 'Reviewer'} width={40} className="h-10 w-10 shrink-0 rounded-full" />
                          : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">{(r.userName || 'U').charAt(0).toUpperCase()}</span>}
                        <span><span className="block text-sm font-medium group-hover:underline">{r.userName || 'Anonymous'}</span><span className="block text-xs text-muted-foreground">{formatDate(r.createdAt)}</span></span>
                      </button>
                      <StarRating rating={r.rating} size={14} />
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-foreground/80">{r.comment}</p>
                  </article>
                ))}
              </div>
              {totalReviewPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" disabled={reviewPage === 0} onClick={() => setReviewPage((p) => p - 1)}>Previous</Button>
                  <span className="text-sm text-muted-foreground">Page {reviewPage + 1} of {totalReviewPages}</span>
                  <Button variant="outline" size="sm" disabled={reviewPage >= totalReviewPages - 1} onClick={() => setReviewPage((p) => p + 1)}>Next</Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Related */}
        {(relatedLoading || relatedProducts.length > 0) && (
          <section className="mt-20 border-t border-border pt-12">
            <h2 className="section-title mb-10">You may also <em>like</em></h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-6">
              {relatedLoading ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />) : relatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky buy bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 lg:hidden" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-full bg-foreground py-2 pl-6 pr-2 text-background shadow-luxury-lg">
          <div className="min-w-0"><p className="text-[0.65rem] uppercase tracking-[0.14em] text-background/60">{quantity > 1 ? `${quantity} items` : 'Price'}</p><p className="text-lg font-semibold leading-tight tabular-nums">{formatPrice(effectivePrice * quantity)}</p></div>
          <button onClick={handleAddToCart} disabled={outOfStock} className="flex h-12 items-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-foreground active:scale-95 disabled:opacity-50"><ShoppingBag className="h-4 w-4" />{outOfStock ? 'Sold out' : 'Add to bag'}</button>
        </div>
      </div>
    </div>
  );
}
