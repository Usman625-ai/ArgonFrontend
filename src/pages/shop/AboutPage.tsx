import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  Headphones,
  Store,
  Package,
  Star,
  Sparkles,
  ArrowRight,
  Heart,
  Compass,
  Search,
  ShoppingBag,
  CheckCircle2,
  Users,
} from 'lucide-react';
import CountUp from '../../components/shared/CountUp';
import usePlatformStats from '../../hooks/usePlatformStats';

const values = [
  { icon: ShieldCheck, title: 'Trust first', desc: 'Every seller on Argon is vetted before they can list, so you shop with confidence instead of guesswork.' },
  { icon: Heart, title: 'Built around you', desc: 'Wishlists, order tracking, and instant notifications keep you in control of every purchase, start to finish.' },
  { icon: Truck, title: 'Delivered, nationwide', desc: 'From Karachi to Gilgit, our seller network and logistics partners get orders to your door reliably.' },
  { icon: Headphones, title: 'Support that shows up', desc: 'Real help, fast — before you buy, while you wait, and after your order arrives.' },
];

const customerSteps = [
  { icon: Search, title: 'Discover', desc: 'Browse curated categories or search across thousands of listings from verified sellers.' },
  { icon: ShoppingBag, title: 'Checkout securely', desc: 'Pay with JazzCash or Cash on Delivery — your details stay protected at every step.' },
  { icon: Truck, title: 'Track & receive', desc: 'Follow your order in real time, from confirmation to delivery at your doorstep.' },
];

const sellerSteps = [
  { icon: Store, title: 'Apply to sell', desc: 'Register as a seller and get verified — we review every application before approval.' },
  { icon: Package, title: 'List your products', desc: 'Add products, manage inventory, and set your own pricing from a dedicated seller dashboard.' },
  { icon: CheckCircle2, title: 'Grow with Argon', desc: 'Reach customers nationwide, track revenue, and fulfill orders — all from one place.' },
];

function FadeIn({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  const { stats: platformStats } = usePlatformStats();

  // Real, live counts from the backend — no hardcoded marketing numbers.
  // Satisfaction rate only shows once there's at least one real review;
  // showing a fabricated percentage before then would be misleading.
  const stats = [
    { icon: Store, value: platformStats.verifiedSellers, suffix: '+', label: 'Verified sellers' },
    { icon: Users, value: platformStats.totalCustomers, suffix: '+', label: 'Happy customers' },
    { icon: Package, value: platformStats.totalProducts, suffix: '+', label: 'Products listed' },
    ...(platformStats.averageRating != null
      ? [{ icon: Star, value: Math.round((platformStats.averageRating / 5) * 100), suffix: '%', label: 'Satisfaction rate' }]
      : []),
  ];

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#1a120d] via-[#15100c] to-[#0f0b08] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <motion.div aria-hidden animate={{ x: [0, 40, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <motion.div aria-hidden animate={{ x: [0, -30, 0], y: [0, 20, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:py-28">
          <FadeIn>
            <span className="eyebrow inline-flex items-center gap-2 text-primary-300"><Sparkles className="h-3.5 w-3.5" /> About Argon</span>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-5 font-editorial text-4xl font-normal italic leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              A marketplace built on trust, curated for you
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              Argon connects thousands of verified sellers with customers across Pakistan — bringing quality
              products, secure checkout, and dependable delivery together in one place.
            </p>
          </FadeIn>

          <FadeIn delay={0.26} className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-x-10 gap-y-6 border-t border-white/10 pt-8 sm:gap-x-14">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="flex items-center justify-center gap-1.5 font-editorial text-2xl font-medium tracking-tight sm:text-3xl">
                  <s.icon className="h-4 w-4 text-primary-300" strokeWidth={1.75} />
                  <CountUp value={s.value} duration={1400} />{s.suffix}
                </p>
                <p className="mt-1 text-xs text-white/50">{s.label}</p>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <FadeIn>
          <span className="eyebrow">Our mission</span>
          <h2 className="mx-auto mt-3 max-w-2xl font-editorial text-3xl font-normal tracking-tight sm:text-4xl">
            Make buying and selling online <span className="italic text-primary">effortless</span> — for everyone
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground">
            We started Argon around a simple idea: shopping online should feel as trustworthy as walking into a
            store you know. That means every seller is reviewed before they can list, every payment is handled
            securely, and every order can be tracked from checkout to your doorstep.
          </p>
        </FadeIn>
      </section>

      {/* Values grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <FadeIn key={v.title} delay={i * 0.08}>
              <div className="surface-panel surface-panel-hover h-full p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                  <v.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-base font-medium">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How it works — customers & sellers */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <FadeIn className="mb-12 text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="mx-auto mt-3 max-w-xl font-editorial text-3xl font-normal tracking-tight sm:text-4xl">
            Simple for shoppers, powerful for sellers
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <FadeIn className="mb-6 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">For Customers</h3>
            </FadeIn>
            <div className="space-y-5">
              {customerSteps.map((s, i) => (
                <FadeIn key={s.title} delay={i * 0.08}>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                      <s.icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={0.3} className="mt-7">
              <Link to="/shop/products" className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Start shopping <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </FadeIn>
          </div>

          <div>
            <FadeIn className="mb-6 flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">For Sellers</h3>
            </FadeIn>
            <div className="space-y-5">
              {sellerSteps.map((s, i) => (
                <FadeIn key={s.title} delay={i * 0.08}>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                      <s.icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={0.3} className="mt-7">
              <Link to="/register" className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Become a seller <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#241812] via-[#1a120d] to-[#0f0b08] px-6 py-14 text-center text-white sm:px-16">
            <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <Compass className="mx-auto h-8 w-8 text-primary-300" strokeWidth={1.5} />
            <h2 className="relative mt-4 font-editorial text-3xl font-normal italic tracking-tight sm:text-4xl">
              Ready to explore Argon?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm text-white/60">
              Thousands of products, hundreds of sellers, one trusted marketplace.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/shop/products">
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-[#1a1510] transition-colors hover:bg-white/90">
                  Browse products <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
              <Link to="/register">
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10">
                  Create an account
                </motion.span>
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}