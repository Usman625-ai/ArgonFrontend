import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Package, ShoppingBag, ShieldCheck, Truck, Headphones, BadgeCheck } from 'lucide-react';
import api from '../../lib/api';
import type { Product, Category, ApiResponse, PagedResponse } from '../../types';
import { SkeletonCard, SmartImage } from '../../components/ui';
import ProductCard from '../../components/shop/ProductCard';
import EmptyState from '../../components/shop/EmptyState';
import CountUp from '../../components/shared/CountUp';
import usePlatformStats from '../../hooks/usePlatformStats';
import { cn, formatNumber } from '../../lib/utils';

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } };

function SectionHead({ title, accent, to, cta = 'View all' }: { title: string; accent: string; to?: string; cta?: string }) {
  return (
    <div className="mb-10 flex flex-col items-center gap-2 text-center">
      <h2 className="section-title">{title}<em>{accent}</em></h2>
      {to && <Link to={to} className="group mt-1 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">{cta}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></Link>}
    </div>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { stats } = usePlatformStats();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [featRes, catRes] = await Promise.all([
        api.get<ApiResponse<PagedResponse<Product>>>('/api/products', { params: { page: 0, size: 12, sortBy: 'createdAt', sortDir: 'DESC' } }),
        api.get<ApiResponse<Category[]>>('/api/categories'),
      ]);
      setFeatured(featRes.data.data.content || []);
      setCategories(catRes.data.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const heroProduct = featured.find((p) => p.primaryImageUrl || p.images?.length) || featured[0];
  const spotlight = featured.slice(1, 3);
  const heroImg = (p?: Product) => p?.primaryImageUrl || p?.images?.[0]?.imageUrl || '';

  return (
    <div className="space-y-24 pb-6 sm:space-y-32">
      {/* ── Hero: Modulive-style headline + rounded feature panel ── */}
      <section className="mx-auto max-w-[88rem] px-4 pt-8 sm:px-8 sm:pt-12">
        <div className="mx-auto max-w-4xl text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eyebrow mb-5">Multi-vendor marketplace · Pakistan</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-[5.5rem]">
            Things worth<br className="hidden sm:block" /> <em className="font-editorial font-normal italic text-gold">keeping,</em> from sellers you can trust.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Discover curated goods from verified storefronts — secure checkout, nationwide delivery, and cash on delivery.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/shop/products" className="inline-flex h-14 items-center gap-2 rounded-full bg-foreground px-8 text-[0.95rem] font-medium text-background transition-opacity hover:opacity-85">Shop now<ArrowUpRight className="h-4 w-4" /></Link>
            <Link to="/shop/about" className="inline-flex h-14 items-center rounded-full bg-card px-8 text-[0.95rem] font-medium ring-1 ring-border transition-colors hover:bg-accent">Our story</Link>
          </motion.div>
        </div>

        <div className="mt-12 grid gap-3 sm:mt-16 sm:gap-4 lg:grid-cols-[2.1fr_1fr]">
          <Link to={heroProduct ? `/shop/product/${heroProduct.slug}` : '/shop/products'} className="group relative block aspect-[4/3] overflow-hidden rounded-[2rem] bg-secondary sm:aspect-[16/10] lg:aspect-auto lg:min-h-[34rem]">
            {loading ? <div className="skeleton absolute inset-0 rounded-none" /> : (
              <SmartImage src={heroImg(heroProduct)} alt={heroProduct?.name || 'Featured'} width={1400} aspect="auto" className="absolute inset-0 h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]" fallbackIcon={<Package className="h-16 w-16" />} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            {heroProduct && (
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white sm:inset-x-8 sm:bottom-8">
                <div><p className="text-xs uppercase tracking-[0.2em] text-white/70">Just in</p><p className="mt-1 font-editorial text-3xl sm:text-5xl">{heroProduct.name}</p></div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:rotate-45 sm:h-14 sm:w-14"><ArrowUpRight className="h-5 w-5" /></span>
              </div>
            )}
          </Link>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1">
            {(loading ? [null, null] : spotlight).map((p, i) => p ? (
              <Link key={p.id} to={`/shop/product/${p.slug}`} className="group relative block aspect-square overflow-hidden rounded-[2rem] bg-secondary lg:aspect-auto lg:min-h-[16.5rem]">
                <SmartImage src={heroImg(p)} alt={p.name} width={700} aspect="auto" className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105" fallbackIcon={<Package className="h-10 w-10" />} />
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-full bg-card/90 py-2 pl-4 pr-2 backdrop-blur">
                  <span className="truncate text-sm font-medium">{p.name}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background"><ArrowUpRight className="h-3.5 w-3.5" /></span>
                </div>
              </Link>
            ) : <div key={i} className="skeleton aspect-square rounded-[2rem] lg:aspect-auto lg:min-h-[16.5rem]" />)}
          </div>
        </div>

        {/* Live platform numbers */}
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-3 divide-x divide-border text-center">
          {[
            { v: stats.verifiedSellers, l: 'Verified sellers' },
            { v: stats.totalProducts, l: 'Products listed' },
            { v: stats.totalCustomers, l: 'Happy customers' },
          ].map((s) => (
            <div key={s.l} className="px-2">
              <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-5xl"><CountUp value={s.v} format={(n) => formatNumber(Math.round(n))} /></p>
              <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Shop by category: Alder & Lane ── */}
      <section className="mx-auto max-w-[88rem] px-4 sm:px-8">
        <SectionHead title="Shop by" accent="category" to="/shop/products" />
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : categories.length === 0 ? (
          <EmptyState icon={Package} title="No categories yet" description="Categories will appear here once sellers add them." />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 12).map((cat, i) => (
              <motion.div key={cat.id} {...reveal} transition={{ ...reveal.transition, delay: Math.min(i * 0.04, 0.3) }}>
                <Link to={`/shop/products?categoryId=${cat.id}`} className="group block text-center">
                  <div className="relative mx-auto aspect-square overflow-hidden rounded-[1.75rem] bg-secondary">
                    <SmartImage src={cat.imageUrl} alt={cat.name} width={400} aspect="auto" className="h-full w-full transition-transform duration-700 group-hover:scale-105" fallbackIcon={<Package className="h-8 w-8" strokeWidth={1.4} />} />
                  </div>
                  <p className="mt-3.5 text-[0.82rem] font-medium tracking-wide">{cat.name}</p>
                  {typeof cat.productCount === 'number' && <p className="mt-0.5 text-xs text-muted-foreground">{cat.productCount} items</p>}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── Editorial band ── */}
      <section className="mx-auto max-w-[88rem] px-4 sm:px-8">
        <motion.div {...reveal} className="relative overflow-hidden rounded-[2.25rem] bg-foreground px-7 py-14 text-background sm:px-16 sm:py-20">
          <div className="relative z-10 grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl">When we curate, we hold ourselves to <em className="font-editorial font-normal italic text-gold">the finest</em> standard.</h2>
            <div className="space-y-4">
              {[{ i: BadgeCheck, t: 'Every seller reviewed before they list' }, { i: Truck, t: 'Nationwide delivery, free over PKR 5,000' }, { i: ShieldCheck, t: 'Cash on delivery — pay when it arrives' }, { i: Headphones, t: 'Real people on support, every day' }].map((f) => (
                <div key={f.t} className="flex items-center gap-3.5 border-b border-background/15 pb-4 last:border-0"><f.i className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.6} /><span className="text-sm text-background/80">{f.t}</span></div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── New arrivals ── */}
      <section className="mx-auto max-w-[88rem] px-4 sm:px-8">
        <SectionHead title="Our best" accent="quality products" to="/shop/products" cta="Browse everything" />
        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : featured.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No products yet" description="Products will appear here once sellers list them." actionLabel="Browse All" onAction={() => window.location.assign('/shop/products')} />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
            {featured.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
        <div className="mt-12 text-center"><Link to="/shop/products" className="inline-flex h-12 items-center gap-2 rounded-full border border-foreground/80 px-8 text-sm font-medium transition-colors hover:bg-foreground hover:text-background">View all products<ArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </div>
  );
}
