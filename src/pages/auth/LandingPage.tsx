import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShoppingBag, Store, ShieldCheck, Truck, BadgeCheck, Sparkles, Armchair, Watch, Shirt, Gem } from 'lucide-react';
import { useAppSelector } from '../../store';
import CountUp from '../../components/shared/CountUp';
import { Logo } from '../../components/ui';
import usePlatformStats from '../../hooks/usePlatformStats';
import { formatNumber } from '../../lib/utils';

const fade = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: d, ease: [0.16, 1, 0.3, 1] as const } });

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const { stats } = usePlatformStats();

  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'SELLER' ? '/seller/dashboard' : '/shop';
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const numbers = [
    { v: stats.verifiedSellers, l: 'Verified sellers' },
    { v: stats.totalProducts, l: 'Products listed' },
    { v: stats.totalCustomers, l: 'Happy customers' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-[88rem] items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/"><Logo size={32} wordmarkClassName="text-2xl" /></Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link to="/shop/about" className="hidden rounded-full px-4 py-2 text-foreground/70 hover:text-foreground sm:block">About</Link>
          <Link to="/shop" className="hidden rounded-full px-4 py-2 text-foreground/70 hover:text-foreground sm:block">Browse</Link>
          <Link to="/login" className="rounded-full px-4 py-2 text-foreground/70 hover:text-foreground">Log in</Link>
          <Link to="/register" className="rounded-full bg-foreground px-5 py-2.5 text-background transition-opacity hover:opacity-85">Sign up</Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-[88rem] items-center gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          <div>
            <motion.p {...fade()} className="eyebrow mb-6 flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-gold" />Pakistan’s curated marketplace</motion.p>
            <motion.h1 {...fade(0.08)} className="text-[3rem] font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl xl:text-[6.25rem]">
              Shop the<br /><em className="font-editorial font-normal italic text-gold">finest</em> from<br />every maker.
            </motion.h1>
            <motion.p {...fade(0.18)} className="mt-7 max-w-lg text-lg text-muted-foreground">
              Argon brings thousands of verified sellers into one calm, trustworthy storefront — secure checkout, nationwide delivery, cash on delivery.
            </motion.p>
            <motion.div {...fade(0.28)} className="mt-9 flex flex-wrap gap-3">
              <button onClick={() => navigate('/shop')} className="inline-flex h-14 items-center gap-2 rounded-full bg-foreground px-8 font-medium text-background transition-opacity hover:opacity-85"><ShoppingBag className="h-[18px] w-[18px]" />Start shopping<ArrowUpRight className="h-4 w-4" /></button>
              <button onClick={() => navigate('/register')} className="inline-flex h-14 items-center gap-2 rounded-full bg-card px-8 font-medium ring-1 ring-border transition-colors hover:bg-accent"><Store className="h-[18px] w-[18px]" />Become a seller</button>
            </motion.div>

            <motion.div {...fade(0.4)} className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-border pt-8">
              {numbers.map((n) => (
                <div key={n.l}><p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl"><CountUp value={n.v} format={(x) => `${formatNumber(Math.round(x))}+`} /></p><p className="mt-1 text-xs text-muted-foreground sm:text-sm">{n.l}</p></div>
              ))}
            </motion.div>
          </div>

          {/* Arch collage — a nod to the Alder & Lane mirror shapes */}
          <motion.div {...fade(0.2)} className="relative mx-auto grid w-full max-w-xl grid-cols-6 grid-rows-[auto] gap-4" aria-hidden>
            <div className="col-span-4 flex aspect-[4/5] items-end justify-start rounded-t-[999px] rounded-b-[2rem] bg-foreground p-8 text-background"><Armchair className="h-14 w-14 text-gold" strokeWidth={1.2} /></div>
            <div className="col-span-2 mt-16 flex aspect-[2/3] items-center justify-center rounded-t-[999px] rounded-b-[2rem] bg-gold/85"><Watch className="h-9 w-9 text-white" strokeWidth={1.3} /></div>
            <div className="col-span-2 -mt-6 flex aspect-square items-center justify-center rounded-[2rem] bg-secondary"><Shirt className="h-9 w-9 text-foreground/70" strokeWidth={1.3} /></div>
            <div className="col-span-4 -mt-6 flex items-center justify-between rounded-[2rem] bg-card p-7 ring-1 ring-border/60 shadow-luxury">
              <div><p className="font-editorial text-3xl leading-none">Verified</p><p className="mt-2 text-sm text-muted-foreground">Every storefront is reviewed before it goes live.</p></div>
              <Gem className="h-8 w-8 shrink-0 text-gold" strokeWidth={1.3} />
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-[88rem] px-5 pb-24 sm:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { i: ShieldCheck, t: 'Secure by default', d: 'Cash on delivery, with every order tracked from checkout to your door.' },
              { i: Truck, t: 'Delivered nationwide', d: 'Fast shipping across Pakistan, and free delivery on orders over PKR 5,000.' },
              { i: BadgeCheck, t: 'Sellers you can trust', d: 'We review each seller before they list, so what you see is what arrives.' },
            ].map((f) => (
              <div key={f.t} className="rounded-[2rem] bg-card p-8 ring-1 ring-border/60">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary"><f.i className="h-5 w-5" strokeWidth={1.6} /></span>
                <h3 className="mt-8 text-xl font-semibold tracking-tight">{f.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-6 rounded-[2.25rem] bg-foreground p-8 text-background sm:flex-row sm:items-center sm:p-14">
            <h2 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">Sell on Argon. <em className="font-editorial font-normal italic text-gold">Keep it simple.</em></h2>
            <button onClick={() => navigate('/register')} className="inline-flex h-14 shrink-0 items-center gap-2 rounded-full bg-background px-8 font-medium text-foreground transition-opacity hover:opacity-90">Open your shop<ArrowUpRight className="h-4 w-4" /></button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[88rem] flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:px-8">
          <span>© {new Date().getFullYear()} Argon. All rights reserved.</span>
          <span>By continuing you agree to our Terms of Service and Privacy Policy.</span>
        </div>
      </footer>
    </div>
  );
}
