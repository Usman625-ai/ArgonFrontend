import { useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, type MotionStyle } from 'framer-motion';
import {
  ShoppingBag, Store, ArrowRight, Sparkles, Shield, Truck, Compass,
  Headphones, Star, Package, Heart, TrendingUp,
} from 'lucide-react';
import { useAppSelector } from '../../store';
import CountUp from '../../components/shared/CountUp';

/* 3D tilt that follows the cursor — mirrors the treatment used across the shop pages. */
function TiltCard({ children, className, max = 8, glare = true }: { children: ReactNode; className?: string; max?: number; glare?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 150, damping: 18 });
  const gx = useTransform(mx, [0, 1], ['0%', '100%']);
  const gy = useTransform(my, [0, 1], ['0%', '100%']);
  const glareStyle: MotionStyle = glare ? { background: useTransform([gx, gy], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.16), transparent 45%)`) } : {};

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={className}
    >
      {children}
      {glare && <motion.div aria-hidden style={glareStyle} className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
    </motion.div>
  );
}

/* Word-by-word mask reveal for the hero headline. */
function RevealText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ delay: delay + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block"
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* Parallax gradient orbs — track the cursor at a slow, subtle rate for ambient depth. */
function ParallaxField() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const t1x = useTransform(sx, [-1, 1], [-24, 24]);
  const t1y = useTransform(sy, [-1, 1], [-18, 18]);
  const t2x = useTransform(sx, [-1, 1], [18, -18]);
  const t2y = useTransform(sy, [-1, 1], [14, -14]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div style={{ x: t1x, y: t1y }} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
      <motion.div style={{ x: t2x, y: t2y }} animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-amber-400/15 blur-[100px]" />
      <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-[100px]" />
    </div>
  );
}

/* Small floating badge that drifts up and down — used to dress the auth panel with life. */
function FloatBadge({ icon: Icon, label, className, delay = 0 }: { icon: any; label: string; className: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
      transition={{ opacity: { delay: 0.9 + delay, duration: 0.5 }, scale: { delay: 0.9 + delay, duration: 0.5 }, y: { delay: 1.2 + delay, duration: 4.5, repeat: Infinity, ease: 'easeInOut' } }}
      className={`absolute z-10 hidden items-center gap-2 rounded-full border border-border bg-card/90 px-3.5 py-2 shadow-luxury backdrop-blur-md sm:flex ${className}`}
    >
      <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
      <span className="text-xs font-medium text-foreground">{label}</span>
    </motion.div>
  );
}

const features = [
  { icon: Shield, t: 'Secure Payments', d: 'JazzCash & Cash on Delivery' },
  { icon: Truck, t: 'Fast Delivery', d: 'Nationwide shipping' },
  { icon: Store, t: 'Verified Sellers', d: 'Quality you can trust' },
];

const stats = [
  { icon: Store, value: 1200, suffix: '+', label: 'Verified sellers' },
  { icon: Package, value: 25000, suffix: '+', label: 'Products listed' },
  { icon: Star, value: 98, suffix: '%', label: 'Satisfaction rate' },
];

const whyCards = [
  { icon: TrendingUp, title: 'Curated marketplace', desc: 'Every seller is vetted so you shop with confidence, not guesswork.', tone: 'from-[#241812] to-[#0f0b08]' },
  { icon: Heart, title: 'Built around you', desc: 'Wishlists, order tracking, and instant notifications keep you in control.', tone: 'from-[#1a1f1a] to-[#0b0d0a]' },
  { icon: Headphones, title: 'Support that shows up', desc: 'Real help, fast — before, during, and after checkout.', tone: 'from-[#20140f] to-[#0d0908]' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'SELLER' ? '/seller/dashboard' : '/shop';
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <ParallaxField />

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
        <motion.span initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="font-editorial text-2xl font-medium tracking-tight">
          Arg<span className="italic text-primary">on</span>
        </motion.span>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="hidden items-center gap-3 sm:flex">
          <button onClick={() => navigate('/shop')} className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">Browse as Guest</button>
          <span className="h-4 w-px bg-border" />
          <button onClick={() => navigate('/login')} className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">Sign in</button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-luxury transition-colors hover:bg-primary-600">Create account</motion.button>
        </motion.div>
      </header>

      {/* Hero */}
      <div className="relative z-10 mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-16">
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <span className="eyebrow inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Multi-vendor marketplace</span>
            <h1 className="mt-5 font-editorial text-5xl font-normal leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.2rem]">
              <RevealText text="Shop from thousands of sellers," delay={0.1} />
              <span className="inline-block overflow-hidden align-bottom">
                <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.66, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="inline-block italic text-primary">
                  all in one place
                </motion.span>
              </span>
            </h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }} className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
              Join Argon as a customer to discover curated goods, or as a seller to grow your business nationwide.
            </motion.p>

            <div className="mt-10 space-y-5">
              {features.map((f, i) => {
                const I = f.icon;
                return (
                  <motion.div key={f.t} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.95 + i * 0.1, duration: 0.5 }} className="flex items-center gap-4">
                    <motion.div whileHover={{ rotate: 8, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                      <I className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </motion.div>
                    <div><p className="text-sm font-medium">{f.t}</p><p className="text-sm text-muted-foreground">{f.d}</p></div>
                  </motion.div>
                );
              })}
            </div>

            {/* Stats strip */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.5 }} className="mt-11 flex max-w-md gap-8 border-t border-border pt-7">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-editorial text-2xl font-medium tracking-tight text-foreground">
                    <CountUp value={s.value} duration={1400} /> {s.suffix}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <FloatBadge icon={Shield} label="Verified sellers only" className="-left-4 top-6 lg:-left-8" delay={0} />
          <FloatBadge icon={Truck} label="Free nationwide shipping" className="-right-2 bottom-16 lg:-right-6" delay={0.15} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm [perspective:1200px]"
          >
            <TiltCard className="group relative w-full" max={4} glare>
              <div className="surface-panel relative overflow-hidden rounded-2xl p-9">
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
                <h2 className="relative text-center font-editorial text-2xl font-medium">Welcome to Argon</h2>
                <p className="relative mt-2 text-center text-sm text-muted-foreground">Choose an option to get started</p>
                <div className="relative mt-8 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/login')}
                    className="group/btn flex w-full items-center justify-between rounded-lg bg-primary px-5 py-4 text-primary-foreground shadow-luxury transition-shadow duration-300 hover:shadow-luxury-lg"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-[18px] w-[18px]" />
                      <span className="text-sm font-medium">Login</span>
                    </div>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/register')}
                    className="group/btn flex w-full items-center justify-between rounded-lg border border-border bg-transparent px-5 py-4 transition-colors duration-300 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <Store className="h-[18px] w-[18px]" />
                      <span className="text-sm font-medium">Create Account</span>
                    </div>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </motion.button>
                </div>
                <div className="relative divider-fade my-6" />
                <button
                  onClick={() => navigate('/shop')}
                  className="group/btn relative flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-foreground/75 transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Compass className="h-4 w-4" />
                  Browse as Guest
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                </button>
                <p className="relative mt-4 text-center text-xs leading-relaxed text-muted-foreground">By continuing, you agree to Argon's Terms of Service and Privacy Policy.</p>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>

      {/* Why Argon — editorial feature cards */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }} className="mb-9 text-center">
          <span className="eyebrow">Why Argon</span>
          <h2 className="mt-2 font-editorial text-3xl font-normal tracking-tight sm:text-4xl">A marketplace built to be trusted</h2>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-3">
          {whyCards.map((c, i) => {
            const I = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="[transform-style:preserve-3d]"
              >
                <TiltCard className="group relative h-full" max={7}>
                  <div className={`relative flex h-full min-h-[13rem] flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br ${c.tone} p-6 text-white`}>
                    <div className="pointer-events-none absolute inset-0 opacity-[0.06] transition-opacity group-hover:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                    <motion.div
                      aria-hidden
                      animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.28, 0.15] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                      className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-2xl"
                    />
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5">
                      <I className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div className="relative">
                      <p className="font-editorial text-xl italic">{c.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/60">{c.desc}</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Closing CTA band */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#241812] via-[#1a120d] to-[#0f0b08] px-6 py-14 text-center text-white sm:px-16"
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <motion.div aria-hidden animate={{ x: [-20, 30, -20], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute left-1/4 top-0 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
          <motion.div aria-hidden animate={{ x: [20, -30, 20], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="relative">
            <motion.span initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
              <Sparkles className="h-3.5 w-3.5" /> Ready when you are
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="mt-3 font-editorial text-3xl font-normal italic tracking-tight sm:text-4xl">
              Your next favorite find is one tap away
            </motion.h2>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')} className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#1a1510] transition-colors hover:bg-white/90">
                Create free account <ArrowRight className="h-4 w-4" />
              </motion.button>
              <button onClick={() => navigate('/shop')} className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/10">
                <Compass className="h-4 w-4" /> Browse as Guest
              </button>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
