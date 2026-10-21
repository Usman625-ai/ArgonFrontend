import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Heart, User, Menu, X, Moon, Sun, LogOut, Package } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleTheme } from '../../store/uiSlice';
import { logout } from '../../store/authSlice';
import { cn, getInitials } from '../../lib/utils';
import NotificationBell from '../shared/NotificationBell';
import { Logo } from '../ui';

const links = [
  { to: '/shop', label: 'Home', end: true },
  { to: '/shop/products', label: 'Shop' },
  { to: '/shop/about', label: 'About' },
  { to: '/shop/orders', label: 'Orders' },
];

const iconBtn = 'relative flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-accent hover:text-foreground';

export default function CustomerNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const loc = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const { itemCount } = useAppSelector((s) => s.cart);
  const { theme } = useAppSelector((s) => s.ui);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    h();
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  useEffect(() => { setMobileOpen(false); setMenuOpen(false); setSearchOpen(false); }, [loc.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) { navigate(`/shop/products?q=${encodeURIComponent(q)}`); setSearchOpen(false); }
  };
  const handleLogout = async () => { await dispatch(logout()); navigate('/'); };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="brand-bar hidden text-center text-[0.72rem] tracking-[0.08em] sm:block">
        <p className="py-2">Free delivery on orders over Rs. 5,000 · Cash on delivery nationwide</p>
      </div>
      <div className={cn('transition-[background-color,box-shadow] duration-300', scrolled ? 'bg-background/85 shadow-[0_1px_0_hsl(var(--border))] backdrop-blur-xl' : 'bg-background')}>
        <div className="mx-auto flex h-[68px] max-w-[88rem] items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex flex-1 items-center gap-2">
            <button onClick={() => setMobileOpen(true)} className={cn(iconBtn, 'lg:hidden')} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            <nav className="hidden items-center gap-1 lg:flex">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cn('rounded-full px-4 py-2 text-sm font-medium transition-colors', isActive ? 'bg-foreground text-background' : 'text-foreground/65 hover:bg-accent hover:text-foreground')}>{l.label}</NavLink>
              ))}
            </nav>
          </div>

          <Link to="/shop" className="shrink-0" aria-label="Argon home">
            <Logo size={30} withWordmark={false} className="sm:hidden" />
            <Logo size={32} wordmarkClassName="text-[1.55rem]" className="hidden sm:inline-flex" />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-0.5">
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-10 w-44 rounded-full border border-transparent bg-secondary pl-10 pr-4 text-sm transition-[width,background-color,border-color] duration-300 placeholder:text-muted-foreground focus:w-60 focus:border-foreground/30 focus:bg-card focus:outline-none" />
              </div>
            </form>
            <button onClick={() => setSearchOpen((o) => !o)} className={cn(iconBtn, 'md:hidden')} aria-label="Search"><Search className="h-[18px] w-[18px]" /></button>
            <button onClick={() => dispatch(toggleTheme())} className={cn(iconBtn, 'hidden sm:flex')} aria-label="Toggle theme">{theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}</button>
            <Link to="/shop/wishlist" className={cn(iconBtn, 'hidden sm:flex')} aria-label="Wishlist"><Heart className="h-[18px] w-[18px]" /></Link>
            {isAuthenticated && <NotificationBell basePath="/api/customer" />}
            <Link to="/shop/cart" className={iconBtn} aria-label="Cart">
              <ShoppingBag className="h-[18px] w-[18px]" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span key={itemCount} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gold px-1 text-[0.62rem] font-bold text-white">{itemCount}</motion.span>
                )}
              </AnimatePresence>
            </Link>
            {isAuthenticated ? (
              <div className="relative ml-1">
                <button onClick={() => setMenuOpen((o) => !o)} className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-[0.78rem] font-semibold text-background" aria-label="Account">{getInitials(user?.name || 'U')}</button>
                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.14 }} className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-border/60 bg-card p-1.5 shadow-luxury-lg">
                        <div className="px-3 py-2.5"><p className="truncate text-sm font-semibold">{user?.name}</p><p className="truncate text-xs text-muted-foreground">{user?.email}</p></div>
                        <div className="my-1 h-px bg-border" />
                        <Link to="/shop/profile" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-accent"><User className="h-4 w-4" />Profile</Link>
                        <Link to="/shop/orders" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-accent"><Package className="h-4 w-4" />Orders</Link>
                        <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10"><LogOut className="h-4 w-4" />Log out</button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="ml-1 hidden items-center gap-1 sm:flex">
                <Link to="/login" className="rounded-full px-4 py-2 text-sm font-medium text-foreground/75 hover:text-foreground">Log in</Link>
                <Link to="/register" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85">Sign up</Link>
              </div>
            )}
          </div>
        </div>
        <AnimatePresence>
          {searchOpen && (
            <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handleSearch} className="overflow-hidden px-4 pb-3 md:hidden">
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="h-11 w-full rounded-full bg-secondary px-5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.35 }} className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col bg-background p-5 lg:hidden">
              <div className="mb-8 flex items-center justify-between"><Logo size={30} wordmarkClassName="text-2xl" /><button onClick={() => setMobileOpen(false)} className={iconBtn}><X className="h-5 w-5" /></button></div>
              <nav className="flex flex-col">
                {[...links, { to: '/shop/wishlist', label: 'Wishlist' }].map((l) => (
                  <Link key={l.to} to={l.to} className="border-b border-border/60 py-4 font-editorial text-3xl">{l.label}</Link>
                ))}
              </nav>
              <div className="mt-auto space-y-2 pt-6">
                <button onClick={() => dispatch(toggleTheme())} className="flex w-full items-center justify-center gap-2 rounded-full border border-input py-3 text-sm font-medium">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
                {!isAuthenticated && (<><Link to="/login" className="block rounded-full border border-input py-3 text-center text-sm font-medium">Log in</Link><Link to="/register" className="block rounded-full bg-foreground py-3 text-center text-sm font-medium text-background">Sign up</Link></>)}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
